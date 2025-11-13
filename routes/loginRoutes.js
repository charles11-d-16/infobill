const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcrypt');

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  // Hardcoded admin login
  if (username === 'admin' && password === 'admin1234') {
    req.session.userId = 'admin';
    req.session.username = 'admin';
    req.session.category = 'Admin';
    req.session.emailAddress = 'admin@localhost';
    req.session.fullName = 'Administrator';
    return res.redirect('/dashboard');
  }
  // ...existing staff login logic...
  const staff = await Staff.findOne({ username });
  if (!staff) {
    return res.status(401).render('login', { error: 'Invalid username or password' });
  }
  const match = await bcrypt.compare(password, staff.password);
  if (!match) {
    return res.status(401).render('login', { error: 'Invalid username or password' });
  }
  // Set session
  req.session.userId = staff.staffId;
  req.session.username = staff.username;
  req.session.category = staff.category;
  req.session.emailAddress = staff.emailAddress;
  req.session.fullName = `${staff.firstName} ${staff.lastName}`;
  // Audit log entry
  try {
    await AuditLog.create({
      userId: staff.staffId,
      username: staff.username,
      action: 'login',
      recordType: 'Staff',
      recordId: staff.staffId,
      timestamp: new Date(),
      details: { category: staff.category, email: staff.emailAddress }
    });
  } catch (e) {
    console.error('Audit log error:', e);
  }
  // Redirect based on category
  const redirectMap = {
    'Triage': '/triagedashboard',
    'Admission': '/admissiondashboard',
    'Out Patient Department': '/opddashboard',
    'Emergency Department': '/emergencydashboard',
    'Billing': '/billingdashboard',
    'Cashier': '/cashierdashboard',
    'Admin': '/dashboard'
  };
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    req.session.otp = otp;
    req.session.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Send OTP to user's email
    const transporter = require('../utils/mailer');
    try {
      await transporter.sendMail({
        from: 'raycharlesvalino1993@gmail.com',
        to: staff.emailAddress,
        subject: 'Your OsLAMIB Login OTP',
        text: `Your OTP code is: ${otp}`
      });
    } catch (e) {
      console.error('Error sending OTP email:', e);
      // Optionally, you can show an error message on the OTP page
      return res.render('otp', { username: staff.username, error: 'Failed to send OTP email. Please contact support.' });
    }

    // Show OTP input page after successful login
    res.render('otp', { username: staff.username });
});


// OTP page for forgot password flow
router.get('/otp', (req, res) => {
  const username = req.query.username || req.session.username;
  if (!username) {
    return res.render('login', { error: 'No user specified for OTP.' });
  }
  res.render('otp', { username });
});

// Forgot Password route (for modal)
router.post('/forgot-password', async (req, res) => {
  const { username, email } = req.body;
  if (!username || !email) {
    return res.json({ success: false, error: 'Please enter both username and email address.' });
  }
  // Find staff by username and email
  const staff = await Staff.findOne({ username, emailAddress: email });
  if (!staff) {
    return res.json({ success: false, error: 'Username and email do not match our records.' });
  }
  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  req.session.otp = otp;
  req.session.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
  req.session.username = staff.username;
  req.session.category = staff.category;
  req.session.emailAddress = staff.emailAddress;
  // Send OTP to user's email
  const transporter = require('../utils/mailer');
  try {
    await transporter.sendMail({
      from: 'raycharlesvalino1993@gmail.com',
      to: staff.emailAddress,
      subject: 'OSLAM InfoBill Login OTP',
      text: `Your login OTP code is: ${otp}`
    });
  } catch (e) {
    console.error('Error sending OTP email:', e);
    return res.json({ success: false, error: 'Failed to send OTP email. Please contact support.' });
  }
  // Success: tell frontend to redirect to OTP page
  return res.json({ success: true, username: staff.username });
});

module.exports = router;

// OTP verification route
router.post('/verify-otp', async (req, res) => {
  const { otp, username } = req.body;
  // Check if OTP is present in session and not expired
  if (!req.session.otp || !req.session.otpExpires || Date.now() > req.session.otpExpires) {
    return res.render('otp', { username, error: 'OTP expired. Please log in again.' });
  }
  if (otp !== req.session.otp) {
    return res.render('otp', { username, error: 'Invalid OTP. Please try again.' });
  }
  // OTP is valid, clear OTP from session
  req.session.otp = null;
  req.session.otpExpires = null;
  // Set session variables for user (if not already set)
  // Find staff by username and email (from session)
  const staff = await Staff.findOne({ username: username, emailAddress: req.session.emailAddress });
  if (!staff) {
    return res.render('otp', { username, error: 'User not found or email mismatch. Please contact support.' });
  }
  req.session.userId = staff.staffId;
  req.session.username = staff.username;
  req.session.category = staff.category;
  req.session.emailAddress = staff.emailAddress;
  req.session.fullName = `${staff.firstName} ${staff.lastName}`;
  // Redirect to dashboard/module based on category
  const redirectMap = {
    'Triage': '/triagedashboard',
    'Admission': '/admissiondashboard',
    'Out Patient Department': '/opddashboard',
    'Emergency Department': '/emergencydashboard',
    'Billing': '/billingdashboard',
    'Cashier': '/cashierdashboard',
    'Admin': '/dashboard'
  };
  const redirectUrl = redirectMap[staff.category] || '/dashboard';
  req.session.save(err => {
    if (err) {
      return res.render('otp', { username, error: 'Session error. Please try again.' });
    }
    return res.redirect(redirectUrl);
  });
});
