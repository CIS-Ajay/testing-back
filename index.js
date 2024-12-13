// app.js
const express = require('express');
const cors = require('cors');
// Routes
const authRoute = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const bodyParser = require('body-parser');
const config = require('./config/config');
require('./config/db'); 


const passport = require('passport');
const session = require('express-session');
require('./passportConfig');


const app = express();
app.use(cors());
app.use(bodyParser.json());


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());


app.use('/api/auth', authRoute);
app.use('/api/tasks', taskRoutes);


app.listen( config.port,config.ip, () => {
    console.log(`Server running on port ${config.port}`);
});