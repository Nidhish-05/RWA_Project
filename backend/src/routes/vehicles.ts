import { Router, Response } from 'express';
import { pool } from '../db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// ─── RC LOOKUP (placeholder — wire to Surepass/Attestr later) ─────────────────
// POST /api/vehicles/rc-lookup
router.post('/rc-lookup', authenticate, async (req: AuthRequest, res: Response) => {
  const { registrationNumber } = req.body;

  if (!registrationNumber) {
    return res.status(400).json({ error: 'Registration number is required' });
  }

  // Check if we already have cached data for this registration number
  try {
    const cached = await pool.query(
      `SELECT * FROM vehicles
       WHERE registration_number = $1 AND api_last_fetched_at IS NOT NULL
       ORDER BY api_last_fetched_at DESC LIMIT 1`,
      [registrationNumber.toUpperCase().trim()]
    );

    if (cached.rows.length > 0) {
      const v = cached.rows[0];
      return res.json({
        source: 'cache',
        data: {
          registrationNumber: v.registration_number,
          ownerName: v.registered_name,
          make: v.make,
          model: v.model,
          fuelType: v.fuel_type,
          color: v.color,
          ownerType: v.owner_type,
          rtoCode: v.rto_code,
          registrationDate: v.registration_date,
          vehicleAgeYears: v.vehicle_age_years,
          fitnessUpto: v.fitness_upto,
          insuranceUpto: v.insurance_upto,
          pucUpto: v.puc_upto,
          financerName: v.financer_name,
          rcStatus: v.rc_status,
        },
      });
    }

    // TODO: Call Surepass / Attestr / RapidAPI here
    // For now, return a placeholder response
    return res.json({
      source: 'placeholder',
      message: 'RC API integration pending — connect Surepass or Attestr API key in .env',
      data: null,
    });
  } catch (err) {
    console.error('RC lookup error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET USER'S VEHICLES ─────────────────────────────────────────────────────
// GET /api/vehicles/user/:userId
router.get('/user/:userId', authenticate, async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;

  // Users can view their own vehicles; admins can view anyone's
  if (req.userId !== Number(userId) && req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM vehicles WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    const vehicles = result.rows.map(v => ({
      id: v.id,
      userId: v.user_id,
      registrationNumber: v.registration_number,
      registeredName: v.registered_name,
      contactInfo: v.contact_info,
      vehicleType: v.vehicle_type,
      imageUrl: v.image_url,
      make: v.make,
      model: v.model,
      fuelType: v.fuel_type,
      color: v.color,
      ownerType: v.owner_type,
      rtoCode: v.rto_code,
      registrationDate: v.registration_date,
      vehicleAgeYears: v.vehicle_age_years,
      fitnessUpto: v.fitness_upto,
      insuranceUpto: v.insurance_upto,
      pucUpto: v.puc_upto,
      financerName: v.financer_name,
      rcStatus: v.rc_status,
      apiLastFetchedAt: v.api_last_fetched_at,
      createdAt: v.created_at,
    }));

    return res.json({ vehicles });
  } catch (err) {
    console.error('Get vehicles error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── ADD A VEHICLE ───────────────────────────────────────────────────────────
// POST /api/vehicles
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const {
    registrationNumber, registeredName, contactInfo, vehicleType, imageUrl,
  } = req.body;

  if (!registrationNumber || !registeredName || !contactInfo || !vehicleType) {
    return res.status(400).json({ error: 'Registration number, registered name, contact info, and vehicle type are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO vehicles (user_id, registration_number, registered_name, contact_info, vehicle_type, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        req.userId,
        registrationNumber.toUpperCase().trim(),
        registeredName.trim(),
        contactInfo.trim(),
        vehicleType,
        imageUrl || null,
      ]
    );

    const v = result.rows[0];
    return res.status(201).json({
      vehicle: {
        id: v.id,
        userId: v.user_id,
        registrationNumber: v.registration_number,
        registeredName: v.registered_name,
        contactInfo: v.contact_info,
        vehicleType: v.vehicle_type,
        imageUrl: v.image_url,
        createdAt: v.created_at,
      },
    });
  } catch (err) {
    console.error('Add vehicle error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── UPDATE A VEHICLE ────────────────────────────────────────────────────────
// PATCH /api/vehicles/:id
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const {
    registrationNumber, registeredName, contactInfo, vehicleType, imageUrl,
  } = req.body;

  try {
    // Check ownership
    const existing = await pool.query('SELECT user_id FROM vehicles WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
    if (existing.rows[0].user_id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      `UPDATE vehicles SET
        registration_number = COALESCE($1, registration_number),
        registered_name     = COALESCE($2, registered_name),
        contact_info        = COALESCE($3, contact_info),
        vehicle_type        = COALESCE($4, vehicle_type),
        image_url           = COALESCE($5, image_url),
        updated_at          = NOW()
       WHERE id = $6
       RETURNING *`,
      [
        registrationNumber?.toUpperCase().trim() || null,
        registeredName?.trim() || null,
        contactInfo?.trim() || null,
        vehicleType || null,
        imageUrl || null,
        id,
      ]
    );

    return res.json({ vehicle: result.rows[0] });
  } catch (err) {
    console.error('Update vehicle error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── DELETE A VEHICLE ────────────────────────────────────────────────────────
// DELETE /api/vehicles/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const existing = await pool.query('SELECT user_id FROM vehicles WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
    if (existing.rows[0].user_id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await pool.query('DELETE FROM vehicles WHERE id = $1', [id]);
    return res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    console.error('Delete vehicle error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── ADMIN: GET ALL VEHICLES ─────────────────────────────────────────────────
// GET /api/vehicles/admin/all
router.get('/admin/all', authenticate, authorize('admin'), async (_req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT v.*, u.name as user_name, u.flat_number, u.floor_number
       FROM vehicles v
       JOIN users u ON v.user_id = u.id
       ORDER BY v.created_at DESC`
    );

    const vehicles = result.rows.map(v => ({
      id: v.id,
      userId: v.user_id,
      userName: v.user_name,
      flatNumber: v.flat_number,
      floorNumber: v.floor_number,
      registrationNumber: v.registration_number,
      registeredName: v.registered_name,
      contactInfo: v.contact_info,
      vehicleType: v.vehicle_type,
      imageUrl: v.image_url,
      make: v.make,
      model: v.model,
      fuelType: v.fuel_type,
      color: v.color,
      ownerType: v.owner_type,
      rtoCode: v.rto_code,
      registrationDate: v.registration_date,
      vehicleAgeYears: v.vehicle_age_years,
      fitnessUpto: v.fitness_upto,
      insuranceUpto: v.insurance_upto,
      pucUpto: v.puc_upto,
      financerName: v.financer_name,
      rcStatus: v.rc_status,
      apiLastFetchedAt: v.api_last_fetched_at,
      createdAt: v.created_at,
    }));

    return res.json({ vehicles });
  } catch (err) {
    console.error('Admin get vehicles error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
