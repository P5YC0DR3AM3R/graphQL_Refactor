const { test } = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = 'ci-test-secret-not-for-production';
const { signToken, getUser } = require('../utils/auth');

test('signToken round-trips the user', () => {
  const token = signToken({ username: 'ada', email: 'ada@example.com', _id: '1' });
  const user = getUser({ headers: { authorization: `Bearer ${token}` } });
  assert.equal(user.username, 'ada');
  assert.equal(user._id, '1');
});

test('missing header is null, not a throw', () => {
  assert.equal(getUser({ headers: {} }), null);
});
