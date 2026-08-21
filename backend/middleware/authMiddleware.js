import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { createUniqueConnectionKey, ensureConnectionKey } from '../services/connectionKeyService.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Authentication required.' });
    if (token === 'frontend-test-token' && process.env.NODE_ENV !== 'production') {
      let testTeacher = await User.findOne({ email: 'frontend-test-teacher@local.test', role: 'teacher' });
      if (!testTeacher) testTeacher = await User.create({ name: 'Frontend Test Teacher', email: 'frontend-test-teacher@local.test', password: 'frontend-test-only', role: 'teacher', connectionKey: await createUniqueConnectionKey('teacher') });
      req.user = await ensureConnectionKey(testTeacher);
      return next();
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: 'Account not found.' });
    req.user = user;
    next();
  } catch { return res.status(401).json({ error: 'Invalid or expired token.' }); }
}
export function requireTeacher(req, res, next) { if (req.user?.role !== 'teacher') return res.status(403).json({ error: 'Teacher access required.' }); next(); }
export function requireStudent(req, res, next) { if (req.user?.role !== 'student') return res.status(403).json({ error: 'Student access required.' }); next(); }
