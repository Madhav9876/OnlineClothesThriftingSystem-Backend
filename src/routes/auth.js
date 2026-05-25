import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { memory } from '../store/memoryStore.js';
import { isMongoReady, publicUser } from '../utils/mode.js';

export const authRouter = express.Router();

function sign(user) {
  return jwt.sign(publicUser(user), process.env.JWT_SECRET || 'purana-dev-secret', { expiresIn: '7d' });
}

authRouter.post('/signup', async (req, res) => {
  const { name, email, password, role, location, phone } = req.body;

  if (!name || !email || !password || !['buyer', 'seller'].includes(role)) {
    return res.status(400).json({ message: 'Name, email, password and valid role are required' });
  }

  const normalizedEmail = email.toLowerCase();

  if (isMongoReady()) {
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, 10),
      role,
      location,
      phone
    });

    return res.status(201).json({ token: sign(user), user: publicUser(user) });
  }

  if (memory.users.some((user) => user.email === normalizedEmail)) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const user = {
    _id: `user-${Date.now()}`,
    name,
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 10),
    role,
    location,
    phone
  };
  memory.users.push(user);
  return res.status(201).json({ token: sign(user), user: publicUser(user) });
});

authRouter.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  const normalizedEmail = email?.toLowerCase();

  const query = role ? { email: normalizedEmail, role } : { email: normalizedEmail };
  const user = isMongoReady()
    ? await User.findOne(query)
    : memory.users.find((item) => item.email === normalizedEmail && (!role || item.role === role));

  if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) {
    return res.status(401).json({ message: 'Invalid login credentials' });
  }

  return res.json({ token: sign(user), user: publicUser(user) });
});

authRouter.post('/forgot-password', async (req, res) => {
  const { email, role, newPassword } = req.body;
  const normalizedEmail = email?.toLowerCase();

  if (!normalizedEmail || !['buyer', 'seller', 'admin'].includes(role) || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Email, role and a new password of at least 6 characters are required' });
  }

  if (isMongoReady()) {
    const user = await User.findOne({ email: normalizedEmail, role });
    if (!user) return res.status(404).json({ message: 'No registered user found for that email and role' });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.json({ message: 'Password reset successfully. You can login with your new password.' });
  }

  const user = memory.users.find((item) => item.email === normalizedEmail && item.role === role);
  if (!user) return res.status(404).json({ message: 'No registered user found for that email and role' });

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  return res.json({ message: 'Password reset successfully. You can login with your new password.' });
});
