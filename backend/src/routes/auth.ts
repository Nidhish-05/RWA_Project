import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db';

const router = Router();

// ─── REGISTER ────────────────────────────────────────────────────────────────
// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const {
    name, email, password, flatNumber,
    phone, alternatePhone, floorNumber, residentType,
    tenantDetails, vehicles,
  } = req.body;

  // Basic validation
  if (!name || !email || !password || !flatNumber) {
    return res.status(400).json({ error: 'Name, email, password, and flat number are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }
  if (!floorNumber) {
    return res.status(400).json({ error: 'Floor number is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert user with extended fields
    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash, flat_number, phone, alternate_phone, floor_number, resident_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, email, role, flat_number, phone, alternate_phone, floor_number, resident_type, created_at`,
      [
        name.trim(),
        email.toLowerCase().trim(),
        passwordHash,
        flatNumber.trim(),
        phone.trim(),
        alternatePhone?.trim() || null,
        floorNumber.trim(),
        residentType || 'owner',
      ]
    );

    const user = userResult.rows[0];

    // Insert tenant details if resident_type === 'tenant'
    if (residentType === 'tenant' && tenantDetails) {
      await client.query(
        `INSERT INTO tenant_details (user_id, move_in_date, owner_name, owner_phone, owner_email)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          user.id,
          tenantDetails.moveInDate,
          tenantDetails.ownerName?.trim(),
          tenantDetails.ownerPhone?.trim(),
          tenantDetails.ownerEmail?.trim() || null,
        ]
      );
    }

    // Insert vehicles
    if (vehicles && Array.isArray(vehicles) && vehicles.length > 0) {
      for (const v of vehicles) {
        if (!v.registrationNumber || !v.registeredName || !v.contactInfo || !v.vehicleType) continue;
        await client.query(
          `INSERT INTO vehicles (user_id, registration_number, registered_name, contact_info, vehicle_type, image_url)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            user.id,
            v.registrationNumber.toUpperCase().trim(),
            v.registeredName.trim(),
            v.contactInfo.trim(),
            v.vehicleType,
            v.imageUrl || null,
          ]
        );
      }
    }

    await client.query('COMMIT');

    // Create JWT token (valid for 7 days)
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        flatNumber: user.flat_number,
        phone: user.phone,
        alternatePhone: user.alternate_phone,
        floorNumber: user.floor_number,
        residentType: user.resident_type,
        createdAt: user.created_at,
      },
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    // Unique constraint violation = email already exists
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ─── LOGIN ───────────────────────────────────────────────────────────────────
// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Find user by email
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    const user = result.rows[0];

    // Check user exists and password matches
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        flatNumber: user.flat_number,
        phone: user.phone,
        alternatePhone: user.alternate_phone,
        floorNumber: user.floor_number,
        residentType: user.resident_type,
        isRegularPayer: user.is_regular_payer,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET CURRENT USER (protected) ────────────────────────────────────────────
// GET /api/auth/me  — call this with Authorization: Bearer <token>
router.get('/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };
    const result = await pool.query(
      `SELECT id, name, email, role, flat_number, phone, alternate_phone,
              floor_number, resident_type, is_regular_payer, created_at
       FROM users WHERE id = $1`,
      [decoded.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
    const u = result.rows[0];
    return res.json({
      id: u.id, name: u.name, email: u.email, role: u.role,
      flatNumber: u.flat_number, phone: u.phone, alternatePhone: u.alternate_phone,
      floorNumber: u.floor_number, residentType: u.resident_type,
      isRegularPayer: u.is_regular_payer, createdAt: u.created_at,
    });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

export default router;
