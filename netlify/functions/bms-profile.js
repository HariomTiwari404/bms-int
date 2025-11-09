const { respond, handlePreflight } = require('./shared');

const PROFILE_ENDPOINT = 'https://in.bookmyshow.com/api/le-diy/user/profile';

exports.handler = async event => {
  if (event.httpMethod === 'OPTIONS') {
    return handlePreflight();
  }

  if (event.httpMethod !== 'POST') {
    return respond(405, { message: 'Method not allowed' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (error) {
    return respond(400, { message: 'Invalid JSON payload' });
  }

  const accessToken = payload?.accessToken;
  if (!accessToken) {
    return respond(400, { message: 'Missing access token' });
  }

  try {
    const response = await fetch(PROFILE_ENDPOINT, {
      method: 'GET',
      headers: {
        Accept: 'application/json, text/plain, */*',
        Authorization: `Bearer ${accessToken}`,
        'x-bms-le-app-code': 'DIY',
      },
    });

    const data = await response.json().catch(() => ({}));
    return respond(response.status, data);
  } catch (error) {
    return respond(502, {
      message: 'Unable to reach BookMyShow. Please try again later.',
      detail: error.message,
    });
  }
};
