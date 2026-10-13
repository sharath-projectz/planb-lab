import '../config.js';
import jwt from 'jsonwebtoken';

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  const isPlaceholder = secret && (secret.includes('your_jwt_secret') || secret.includes('placeholder'));
  if (!secret || secret.trim() === '' || isPlaceholder) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[Security Error] JWT_SECRET must be configured in production environment and cannot be a default placeholder.');
    }
    console.warn('[Security Warning] JWT_SECRET not configured. Using temporary dev secret for local development only.');
    return 'planb_lab_dev_only_jwt_secret_not_for_production';
  }
  return secret;
}

export function signToken(payload) {
  // 8-hour token lifetime for session continuity
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '8h' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (err) {
    return null;
  }
}

/**
 * Express middleware to authenticate JWT token
 * Derives user ID strictly from the verified JWT payload!
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      error: 'Authentication Required',
      message: 'Missing Bearer token in Authorization header.'
    });
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) {
    return res.status(403).json({
      error: 'Invalid or Expired Token',
      message: 'Your authentication token is invalid or has expired. Please sign in again.'
    });
  }

  // Derive authenticated user identity solely from token
  req.user = {
    userId: decoded.userId,
    email: decoded.email,
    name: decoded.name
  };

  next();
}

/**
 * Optional authentication: populates req.user if valid token exists, but does not block guests.
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token) {
    const decoded = verifyToken(token);
    if (decoded && decoded.userId) {
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.name
      };
    }
  }
  next();
}
