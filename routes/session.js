import express from 'express';
import GameSession from '../models/GameSession.js';
import { connectDB } from '../utils/connectMongo.js'; // 👈 importa el forzador

const router = express.Router();

router.post('/save', async (req, res) => {
  try {
    await connectDB(); // 👈 conéctate antes de hacer nada

    const session = new GameSession(req.body);
    await session.save();

    res.status(201).json({ message: 'Sesión guardada correctamente' });
  } catch (err) {
    console.error("❌ Error guardando sesión:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

