const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'OPTIONS,POST',
};

const respond = (statusCode, body = {}) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    ...corsHeaders,
  },
  body: JSON.stringify(body),
});

const handlePreflight = () => ({
  statusCode: 200,
  headers: corsHeaders,
  body: '',
});

module.exports = {
  corsHeaders,
  respond,
  handlePreflight,
};
