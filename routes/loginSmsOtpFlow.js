const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const bcrypt = require('bcrypt');
// Twilio code removed

// Step 1: Username & Password
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const staff = await Staff.findOne({ username });
  if (!staff || !staff.password) {
    return res.render('login.ejs', { error: 'Invalid username or password.' });
  }
  const match = await bcrypt.compare(password, staff.password);
  if (!match) {
    return res.render('login.ejs', { error: 'Invalid username or password.' });
  }
  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  req.session.staffId = staff.staffId;
  req.session.smsOtp = otp;
  req.session.smsOtpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
  // Twilio SMS sending removed. You may want to implement another SMS provider or alternative notification here.
  return res.render('login-sms-otp.ejs', { phone: staff.contactNumber });
});

// Step 2: OTP Verification
router.post('/sms-otp/verify', async (req, res) => {
  const staffId = req.session.staffId;
  const { otp } = req.body;
  if (!staffId || !req.session.smsOtp) {
    return res.redirect('/login');
  }
  if (Date.now() > req.session.smsOtpExpires) {
    return res.render('login-sms-otp.ejs', { error: 'OTP expired. Please log in again.' });
  }
  if (otp === req.session.smsOtp) {
    req.session.smsOtp = null;
    req.session.smsOtpExpires = null;
    req.session.smsOtpVerified = true;
    // Show splash before redirecting to dashboard
    return res.render('login-sms-otp-success', { redirectUrl: '/dashboard' });
  } else {
    return res.render('login-sms-otp.ejs', { error: 'Invalid code. Please try again.' });
  }
});

module.exports = router;
