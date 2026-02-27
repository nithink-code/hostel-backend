const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Helper to generate token (same logic as in controller)
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d',
    });
};

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// @desc    Auth with Google
// @route   GET /api/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
router.get(
    '/google/callback',
    (req, res, next) => {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        passport.authenticate('google', { failureRedirect: `${frontendUrl}/login?error=google_auth_failed`, session: false })(req, res, next);
    },
    (req, res) => {
        try {
            if (!req.user) {
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                return res.redirect(`${frontendUrl}/login?error=no_user_found`);
            }
            // Successful authentication, redirect to frontend with token
            const token = generateToken(req.user._id);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(`${frontendUrl}/google-auth-success?token=${token}`);
        } catch (error) {
            console.error('Callback handling error:', error);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(`${frontendUrl}/login?error=callback_error`);
        }
    }
);

module.exports = router;
