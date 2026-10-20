import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

import {
  findUser,
  saveUser,
  getUser,
  useMongo,
} from '../services/storage.js';

import {
  auth,
  signToken,
} from '../middleware/auth.js';

const r = Router();

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

const registerSchema = z.object({
  name: z.string().trim().min(2).max(50),
  email: z.string().trim().email(),
  password: z.string().min(8),
});

// POST /api/auth/register
r.post('/register', async (req, res) => {
  try {
    const input = registerSchema.parse(req.body);
    const email = input.email.toLowerCase();

    // Do not report success unless MongoDB is connected.
    if (!useMongo()) {
      return res.status(503).json({
        message: 'Database unavailable. Please try again later.',
      });
    }

    const existingUser = await findUser(email);

    if (existingUser) {
      return res.status(409).json({
        message: 'An account with this email already exists',
      });
    }

    const user = await saveUser({
      name: input.name,
      email,
      passwordHash: await bcrypt.hash(input.password, 12),
      role: 'user',
      subscription: 'free',
    });

    const token = signToken({
      id: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
    });

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: 'An account with this email already exists',
      });
    }

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: error.issues[0]?.message || 'Invalid registration details',
      });
    }

    console.error('Registration failed:', error);

    return res.status(500).json({
      message: 'Registration failed. Check the backend terminal for details.',
    });
  }
});

// POST /api/auth/login
r.post('/login', async (req, res) => {
  try {
    const input = loginSchema.parse(req.body);
    const email = input.email.toLowerCase();

    if (!useMongo()) {
      return res.status(503).json({
        message: 'Database unavailable. Please try again later.',
      });
    }

    const user = await findUser(email);

    if (!user || !user.passwordHash ||
        !(await bcrypt.compare(input.password, user.passwordHash))) {
      return res.status(401).json({
        message: 'Incorrect email or password',
      });
    }

    const token = signToken({
      id: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: error.issues[0]?.message || 'Invalid login details',
      });
    }

    console.error('Login failed:', error);

    return res.status(500).json({
      message: 'Login failed. Check the backend terminal for details.',
    });
  }
});

// GET /api/auth/me
r.get('/me', auth, async (req, res) => {
  try {
    if (!useMongo()) {
      return res.status(503).json({
        message: 'Database unavailable. Please try again later.',
      });
    }

    const user = await getUser(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error('Get current user failed:', error);

    return res.status(500).json({
      message: 'Unable to retrieve user details',
    });
  }
});

export default r;