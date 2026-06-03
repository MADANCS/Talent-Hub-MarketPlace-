const nodemailer = require('nodemailer');
const ics = require('ics');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendInterviewInvitation = async (candidateEmail, recruiterName, jobTitle, companyName, interviewDetails) => {
  try {
    const { type, scheduledAt, duration, meetingLink, notes } = interviewDetails;
    const dateStr = new Date(scheduledAt).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' });

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #334155; line-height: 1.6;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #0891b2 100%); padding: 40px; border-radius: 24px 24px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800;">Interview Scheduled</h1>
          <p style="color: rgba(255,255,255,0.8); margin-top: 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Talent Marketplace Protocol</p>
        </div>
        
        <div style="padding: 40px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 24px 24px; background: white;">
          <p>Hi there,</p>
          <p>Great news! Your interview for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> has been scheduled by ${recruiterName}.</p>
          
          <div style="background: #f8fafc; padding: 24px; border-radius: 16px; margin: 30px 0;">
            <h3 style="margin-top: 0; color: #1e293b; font-size: 16px;">Mission Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 13px; width: 100px;">Type</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${type} Interview</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Date & Time</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${dateStr}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Duration</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${duration} Minutes</td>
              </tr>
            </table>
          </div>

          ${notes ? `
          <div style="margin-bottom: 30px;">
            <h4 style="color: #64748b; margin-bottom: 8px;">Instructions from Recruiter:</h4>
            <p style="font-style: italic; color: #475569;">"${notes}"</p>
          </div>
          ` : ''}

          <div style="text-align: center; margin-top: 40px;">
            <a href="${meetingLink}" style="background: #2563eb; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.2);">
              JOIN INTERVIEW ROOM
            </a>
            <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">
              Alternatively, copy and paste this link: <br/>
              <span style="color: #2563eb;">${meetingLink}</span>
            </p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
          <p>&copy; 2024 TalentHub AI Marketplace. All rights reserved.</p>
        </div>
      </div>
    `;

    // Generate Calendar Event (.ics)
    const startDate = new Date(scheduledAt);
    const event = {
      start: [
        startDate.getFullYear(), 
        startDate.getMonth() + 1, 
        startDate.getDate(), 
        startDate.getHours(), 
        startDate.getMinutes()
      ],
      duration: { minutes: duration || 60 },
      title: `Interview: ${jobTitle} at ${companyName}`,
      description: `Interview with ${recruiterName}. \n\nInstructions: ${notes || 'No specific instructions provided.'}`,
      location: meetingLink,
      url: meetingLink,
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
      organizer: { name: 'TalentHub Recruitment', email: process.env.EMAIL_USER || 'recruitment@talenthub.ai' },
      attendees: [
        { name: 'Candidate', email: candidateEmail, rsvp: true, partstat: 'ACCEPTED', role: 'REQ-PARTICIPANT' }
      ]
    };

    const { error, value } = ics.createEvent(event);
    let attachments = [];
    if (!error) {
      attachments.push({
        filename: 'invite.ics',
        content: value,
        contentType: 'text/calendar; charset=utf-8; method=REQUEST'
      });
    }

    const mailOptions = {
      from: `"TalentHub Recruitment" <${process.env.EMAIL_USER}>`,
      to: candidateEmail,
      subject: `Interview Scheduled: ${jobTitle} at ${companyName}`,
      html: html,
      attachments: attachments
    };

    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
      console.warn('Email credentials not configured. Skipping email dispatch.');
      console.log('--- MOCK EMAIL ---');
      console.log(`To: ${candidateEmail}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Link: ${meetingLink}`);
      console.log('------------------');
      return;
    }

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email Dispatch Error:', error.message);
  }
};

module.exports = {
  sendInterviewInvitation
};
