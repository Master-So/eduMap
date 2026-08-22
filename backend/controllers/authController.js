import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { createUniqueConnectionKey, ensureConnectionKey } from '../services/connectionKeyService.js';

const generateToken = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const assignedRole = role || 'teacher';
    if (!name || !email || !password || !['teacher', 'student'].includes(assignedRole)) {
      return res.status(400).json({ error: 'Name, email, password, and a valid role are required.' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) return res.status(400).json({ error: 'User already exists.' });
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 10), role: assignedRole, connectionKey: await createUniqueConnectionKey(assignedRole) });
    res.status(201).json({ _id: user.id, name: user.name, email: user.email, role: user.role, connectionKey: user.connectionKey, token: generateToken(user.id, user.role) });
  } catch (error) { res.status(500).json({ error: error.message }); }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password || '', user.password))) return res.status(401).json({ error: 'Invalid email or password.' });
    await ensureConnectionKey(user);
    await user.populate('connectedTeachers', 'name email');
    const connectedTeachers = user.connectedTeachers || (user.connectedTeacher ? [user.connectedTeacher] : []);
    res.json({ _id: user.id, name: user.name, email: user.email, role: user.role, connectionKey: user.connectionKey, connectedTeacher: user.connectedTeacher, connectedTeachers: connectedTeachers.map((teacher) => teacher._id || teacher), connectedTeacherDetails: connectedTeachers.map((teacher) => ({ id: teacher._id || teacher, name: teacher.name || 'Teacher', email: teacher.email || '' })), token: generateToken(user.id, user.role) });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const getCurrentUser = async (req, res) => {
  const user = await ensureConnectionKey(req.user);
  await user.populate('connectedTeachers', 'name email');
  const connectedTeachers = user.connectedTeachers || (user.connectedTeacher ? [user.connectedTeacher] : []);
  const payload = {
    _id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    connectionKey: user.connectionKey,
    connectedTeacher: user.connectedTeacher,
    connectedTeachers: connectedTeachers.map((teacher) => teacher._id || teacher),
    connectedTeacherDetails: connectedTeachers.map((teacher) => ({ id: teacher._id || teacher, name: teacher.name || 'Teacher', email: teacher.email || '' })),
  };
  res.json({
    ...payload,
    user: payload,
    student: payload,
    teacher: payload,
  });
};

