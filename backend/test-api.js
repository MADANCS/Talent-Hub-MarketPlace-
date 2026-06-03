const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'hr@demo.com',
      password: '123456'
    });
    console.log('Login success:', res.data.success);
    console.log('User Role:', res.data.user.role);
  } catch (err) {
    console.error('Login error:', err.response?.data || err.message);
  }
}
test();
