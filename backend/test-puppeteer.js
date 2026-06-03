const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Login first or set localStorage
  await page.goto('http://localhost:5173/login');
  // Need to know credentials... wait, I can just set localStorage using a valid token
  // Let's get the token for the recruiter
  
  const mongoose = require('mongoose');
  const jwt = require('jsonwebtoken');
  const dotenv = require('dotenv');
  dotenv.config();
  
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./models/User');
  const recruiter = await User.findOne({ role: 'RECRUITER' });
  const token = jwt.sign({ id: recruiter._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  
  await page.evaluate((token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, token, recruiter);
  
  // Go to manage jobs
  await page.goto('http://localhost:5173/recruiter/jobs');
  
  // Intercept dialog
  page.on('dialog', async dialog => {
    console.log('Dialog appeared:', dialog.message());
    await dialog.accept();
  });
  
  page.on('console', msg => console.log('Browser Console:', msg.text()));
  
  // Wait for jobs to load
  await page.waitForSelector('button:has-text("Terminate")', { timeout: 10000 }).catch(() => console.log("Timeout waiting for terminate button"));
  
  const terminateBtns = await page.$$('button');
  let clicked = false;
  for (const btn of terminateBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Terminate')) {
      console.log('Clicking Terminate button...');
      await btn.click();
      clicked = true;
      break;
    }
  }
  
  if (!clicked) console.log("No Terminate button found");
  
  // wait a bit for network
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
  process.exit(0);
})();
