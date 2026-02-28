require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const passport = require('passport');

// Passport config
require('./config/passport')(passport);

// Import routes
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

// Connect to MongoDB
connectDB();

const app = express();

/*
|--------------------------------------------------------------------------
| CORS CONFIGURATION (PRODUCTION SAFE)
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
    "http://3.235.84.198",          // EC2 frontend
    "http://localhost:5173",       // Local dev
    process.env.FRONTEND_URL       // Optional from .env
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like curl / Postman)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.log(`❌ CORS blocked for origin: ${origin}`);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));

/*
|--------------------------------------------------------------------------
| MIDDLEWARE
|--------------------------------------------------------------------------
*/

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/announcements', announcementRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: '🏨 HostelOps API is running',
        timestamp: new Date().toISOString(),
    });
});

/*
|--------------------------------------------------------------------------
| 404 HANDLER
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

/*
|--------------------------------------------------------------------------
| GLOBAL ERROR HANDLER
|--------------------------------------------------------------------------
*/

app.use((err, req, res, next) => {
    console.error("🔥 Server Error:", err.message);

    res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

/*
|--------------------------------------------------------------------------
| SERVER LISTEN
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 5001;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 HostelOps Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV}`);
});