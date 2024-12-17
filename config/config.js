require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET,
    accessTokenExpiration: process.env.ACCESS_TOKEN_EXPIRATION || '10m',
    refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION || '5m',
    mongodbUri: process.env.MONGODB_URI,
    ip: process.env.IP || '0.0.0.0',
};
