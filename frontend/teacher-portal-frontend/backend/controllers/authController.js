import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { createUniqueConnectionKey, ensureConnectionKey } from '../services/connectionKeyService.js';

const generateToken = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !['teacher', 'student'].includes(role)) return res.status(400).json({ error: 'Name, email, password, and a valid role are required.' });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) return res.status(400).json({ error: 'User already exists.' });
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 10), role, connectionKey: await createUniqueConnectionKey(role) });
    res.status(201).json({ _id: user.id, name: user.name, email: user.email, role: user.role, connectionKey: user.connectionKey, token: generateToken(user.id, user.role) });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password || '', user.password))) return res.status(401).json({ error: 'Invalid email or password.' });
    await ensureConnectionKey(user);
    res.json({ _id: user.id, name: user.name, email: user.email, role: user.role, connectionKey: user.connectionKey, token: generateToken(user.id, user.role) });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const getCurrentUser = async (req, res) => {
  const user = await ensureConnectionKey(req.user);
  res.json({ teacher: { _id: user.id, name: user.name, email: user.email, role: user.role, connectionKey: user.connectionKey } });
};
