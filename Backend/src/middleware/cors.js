const cors = require('cors');
const config = require('../config/environment');

const corsOptions = {
  origin: config.ALLOWED_ORIGINS || '*',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = cors(corsOptions);
