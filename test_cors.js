const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    "http://3.235.84.198",
    "http://localhost:5173"
].filter(Boolean);

const origin = "http://3.235.84.198";
console.log(`Matching "${origin}":`, allowedOrigins.indexOf(origin) !== -1);
console.log("Allowed Origins:", allowedOrigins);
