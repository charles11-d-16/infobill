// utils/auth.js
// Middleware to protect routes except /login and /otp

function authMiddleware(req, res, next) {
    // Debug: log session info for troubleshooting
    console.log('AUTH MIDDLEWARE:', {
      path: req.path,
      session: req.session
    });
  const publicPaths = ['/login', '/otp', '/forgot-password'];
  // Allow static files, login, and otp
  if (
    publicPaths.includes(req.path) ||
    req.path.startsWith('/public') ||
    req.path.startsWith('/css') ||
    req.path.startsWith('/js') ||
    req.path.startsWith('/uploads')
  ) {
    return next();
  }
  if (
    req.session &&
    req.session.username &&
    req.session.emailAddress &&
    req.session.category
  ) {
    return next();
  }
  return res.redirect('/login');
}

module.exports = authMiddleware;
