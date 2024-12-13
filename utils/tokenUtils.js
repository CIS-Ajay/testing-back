const jwt = require('jsonwebtoken');
const { jwtSecret, accessTokenExpiration, refreshTokenExpiration } = require('../config/config');

module.exports = {
    generateAccessToken: (payload) => jwt.sign(payload, jwtSecret, { expiresIn: accessTokenExpiration }),
    generateRefreshToken: (payload, secret) => jwt.sign(payload, secret, { expiresIn: refreshTokenExpiration }),
    verifyAccessToken: (token) => jwt.verify(token, jwtSecret),
    verifyRefreshToken: (token, secret) => jwt.verify(token, secret),
};
