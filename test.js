// test_request.js
const http = require('http');

const payload = JSON.stringify({
  name: "Test User",
  email: "test@example.com",
  guests: [],
  phone: "+911234567890",
  startDatetime: "2025-09-10T09:30:00.000Z",
  durationMinutes: 15,
  notes: "hello",
  state: "Karnataka"
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/appointment/create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', body);
  });
});
req.on('error', (e) => console.error('Request error:', e));
req.write(payload);
req.end();
