const crypto = require('crypto');

function jwtSecret() {
  if (!process.env.JWT_SECRET) {
    require('dotenv').config();
  }
  return process.env.JWT_SECRET;
}

const TTL_SECONDS = 2 * 60 * 60;

function b64url(value) {
  const buf = Buffer.isBuffer(value) ? value : Buffer.from(value);
  return buf.toString('base64url');
}

function sign(data, secret) {
  return crypto.createHmac('sha256', secret).update(data).digest('base64url');
}

function signToken({ username, email, _id }) {
  const secret = jwtSecret();
  if (!secret) {
    throw new Error('JWT_SECRET is not set. Copy .env.example to .env');
  }
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const payload = b64url(JSON.stringify({ data: { username, email, _id }, exp }));
  const body = `${header}.${payload}`;
  return `${body}.${sign(body, secret)}`;
}

function getUser(req) {
  const secret = jwtSecret();
  if (!secret) return null;
  let token = (req.headers && req.headers.authorization) || '';
  if (token.startsWith('Bearer ')) token = token.slice(7);
  token = token.trim();
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, payload, sig] = parts;
  const expected = sign(`${header}.${payload}`, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let body;
  try {
    body = JSON.parse(Buffer.from(payload, 'base64url').toString());
  } catch {
    return null;
  }
  if (!body.exp || body.exp < Math.floor(Date.now() / 1000)) return null;
  return body.data || null;
}

module.exports = { getUser, signToken };
