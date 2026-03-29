require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const playersRoutes = require('./routes/players');
const sportsRoutes = require('./routes/sports');

const app = express();

// -----------------------------
// CORS
// -----------------------------
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// -----------------------------
// JSON parser
// -----------------------------
app.use(express.json());

// -----------------------------
// Routes
// -----------------------------
app.use('/api/auth', authRoutes);
app.use('/api/players', playersRoutes);
app.use('/api/sports', sportsRoutes);

// -----------------------------
// Démarrage serveur
// -----------------------------
const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});