const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'ma_cle_secrete_2plus2egale5';

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [users] = await pool.execute('SELECT * FROM Users WHERE Username = ?', [username]);

        if (users.length === 0) {
            return res.status(401).json({ message: "Utilisateur inconnu" });
        }

        const user = users[0];

        // LOGIQUE SÉCURISÉE : Verification du hash
        // On compare le mot de passe reçu avec le hash stocké en base
        const isMatch = await bcrypt.compare(password, user.Password);

        if (!isMatch) {
            return res.status(401).json({ message: "Mot de passe incorrect" });
        }

        // On génère un TOKEN qui contient les infos de l'utilisateur
        const token = jwt.sign(
            { id: user.idUsers, role: user.Role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: "Connexion réussie",
            token: token,
            user: {
                username: user.Username,
                role: user.Role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur serveur");
    }
});

router.post('/register', async (req, res) => {
    const { username, password, teamName, sportId } = req.body;

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Hash du mot de passe
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 2. Créer le user (leader)
        const [userResult] = await connection.execute(
            `INSERT INTO Users (Username, Password, Role)
             VALUES (?, ?, 'leader')`,
            [username, hashedPassword]
        );

        const userId = userResult.insertId;

        // 3. Créer l'équipe
        const [teamResult] = await connection.execute(
            `INSERT INTO Teams (Name, Users_id)
             VALUES (?, ?)`,
            [teamName, userId]
        );

        const teamId = teamResult.insertId;

        // 4. Associer l'équipe au sport
        await connection.execute(
            `INSERT INTO Sports_has_Teams (idSports, idTeams)
             VALUES (?, ?)`,
            [sportId, teamId]
        );

        // 5. Commit
        await connection.commit();

        res.status(201).json({
            message: "Inscription réussie",
            userId,
            teamId
        });

    } catch (error) {
        await connection.rollback();

        console.error(error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                message: "Nom d'utilisateur ou équipe déjà existant"
            });
        }

        res.status(500).json({
            message: "Erreur lors de l'inscription"
        });
    } finally {
        connection.release();
    }
});

module.exports = router;