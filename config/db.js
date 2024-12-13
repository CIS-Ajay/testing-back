const mongoose = require('mongoose');
const { mongodbUri } = require('./config');

mongoose.connect(mongodbUri)
    .then(() => console.log('MongoDB connected :)'))
    .catch((err) => console.error('MongoDB connection error:', err));
