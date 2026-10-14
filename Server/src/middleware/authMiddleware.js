import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { User } from '../models/User.js';
import { sendError } from '../utils/apiResponse.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      // 2. Check cookies
      token = req.cookies.accessToken;
    }

    if (!token) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication token required', [], 401);
    }

    // Verify token
    const decoded = jwt.verify(token, ENV.JWT_ACCESS_SECRET);

    // Look up user in database
    const user = await User.findById(decoded.userId).lean();
    if (!user || !user.isActive) {
      return sendError(res, 'UNAUTHORIZED', 'User not found or account deactivated', [], 401);
    }

    req.user = {
      _id: user._id,
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      shopId: user.shopId.toString()
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'TOKEN_EXPIRED', 'Authentication token has expired', [], 401);
    }
    return sendError(res, 'INVALID_TOKEN', 'Invalid authentication token', [], 401);
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', [], 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        'FORBIDDEN',
        `Access restricted to ${allowedRoles.join(', ')}`,
        [],
        403
      );
    }

    next();
  };
};
