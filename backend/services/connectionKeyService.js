import crypto from 'crypto';
import User from '../models/user.js';

export async function createUniqueConnectionKey(role) {
  const prefix = role === 'teacher' ? 'TCH' : 'STD';
  let key;
  do { key = `${prefix}-${crypto.randomBytes(6).toString('hex').toUpperCase()}`; } while (await User.exists({ connectionKey: key }));
  return key;
}

export async function ensureConnectionKey(user) {
  if (!user.connectionKey) { user.connectionKey = await createUniqueConnectionKey(user.role); await user.save(); }
  return user;
}
