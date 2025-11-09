const { respond, handlePreflight } = require('./shared');

const TOKEN_ENDPOINT = 'https://in.bookmyshow.com/api/le-diy/auth/token';

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

  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'x-bms-le-app-code': 'DIY',
      },
      body: JSON.stringify(payload),
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
