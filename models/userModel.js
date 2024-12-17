// userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: [true, 'Username is required'], minlength: [4, 'Username must be at least 4 characters long'], unique: true },
    password: { type: String, required: [true, 'Password is required'], minlength: [6, 'Password must be at least 6 characters long'] },
    email: { type: String, required: [true, 'Email is required'], lowercase: true, unique: true, match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email.", ],  
    },
    firstName: { type: String, required: [true, 'First name is required'] },
    lastName: { type: String, required: [true, 'Last name is required'] },
    dateOfBirth: { type: Date, required: [true, 'Date of birth is required'] },
    profilePicture: String,
    refreshToken: String,
    refreshTokenSecret: String,
    invalidatedTokens: [{ type: String }],
    loggedOut: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // otpExpiration: Date,
    // otp: String,
    // isVerified: { type: Boolean, default: false },

});

module.exports = mongoose.model('User', userSchema);