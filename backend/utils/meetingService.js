const axios = require('axios');
const { google } = require('googleapis');

/**
 * Zoom API Integration
 * Uses Server-to-Server OAuth
 */
const createZoomMeeting = async (topic, startTime, duration) => {
  try {
    const accountId = process.env.ZOOM_ACCOUNT_ID;
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;

    if (!accountId || !clientId || !clientSecret) {
      // Fallback or Mock if credentials are missing
      console.warn('Zoom credentials missing. Returning mock meeting link.');
      return {
        join_url: `https://zoom.us/j/${Math.floor(Math.random() * 1000000000)}`,
        password: 'password123'
      };
    }

    // Get Access Token
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenResponse = await axios.post(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
      {},
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Create Meeting
    const meetingResponse = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      {
        topic: topic || 'Job Interview',
        type: 2, // Scheduled meeting
        start_time: new Date(startTime).toISOString(),
        duration: duration || 60,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: true,
          mute_upon_entry: true,
          waiting_room: true
        }
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return meetingResponse.data;
  } catch (error) {
    console.error('Zoom API Error:', error.response?.data || error.message);
    throw new Error('Failed to create Zoom meeting: ' + (error.response?.data?.message || error.message));
  }
};

/**
 * Google Meet Integration
 * Uses Google Calendar API
 */
const createGoogleMeet = async (summary, startTime, duration) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      // Fallback or Mock
      console.warn('Google credentials missing. Returning mock meeting link.');
      return {
        hangoutLink: `https://meet.google.com/${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`
      };
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const endTime = new Date(new Date(startTime).getTime() + (duration || 60) * 60000);

    const event = {
      summary: summary || 'Job Interview',
      description: 'Video interview scheduled via Talent Marketplace',
      start: {
        dateTime: new Date(startTime).toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'UTC',
      },
      conferenceData: {
        createRequest: {
          requestId: `interview-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
    });

    return response.data;
  } catch (error) {
    console.error('Google Meet Error:', error.message);
    throw new Error('Failed to create Google Meet: ' + error.message);
  }
};

module.exports = {
  createZoomMeeting,
  createGoogleMeet
};
