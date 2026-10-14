import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Shop } from '../models/Shop.js';
import { ENV } from '../config/env.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logAudit } from '../services/auditService.js';

export const login = async (req, res) => {
  try {
    const { email, password, shopName } = req.body;

    const query = { email: email.toLowerCase().trim() };

    // Find user by email
    let user = await User.findOne(query);

    // If not found by email, allow finding by name if entered
    if (!user) {
      user = await User.findOne({ name: { $regex: new RegExp(`^${email.trim()}$`, 'i') } });
    }

    if (!user) {
      return sendError(res, 'INVALID_CREDENTIALS', 'Invalid email or password', [], 401);
    }

    if (!user.isActive) {
      return sendError(res, 'ACCOUNT_INACTIVE', 'Account is deactivated. Contact shop owner.', [], 403);
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'INVALID_CREDENTIALS', 'Invalid email or password', [], 401);
    }

    // Find shop
    const shop = await Shop.findById(user.shopId);
    if (!shop) {
      return sendError(res, 'SHOP_NOT_FOUND', 'Associated shop could not be found', [], 404);
    }

    // Update lastLoginAt
    user.lastLoginAt = new Date();
    await user.save();

    // Generate JWT access & refresh tokens
    const tokenPayload = {
      userId: user._id.toString(),
      role: user.role,
      shopId: shop._id.toString()
    };

    const accessToken = jwt.sign(tokenPayload, ENV.JWT_ACCESS_SECRET, {
      expiresIn: ENV.JWT_ACCESS_EXPIRES_IN
    });

    const refreshToken = jwt.sign(tokenPayload, ENV.JWT_REFRESH_SECRET, {
      expiresIn: ENV.JWT_REFRESH_EXPIRES_IN
    });

    // Set HTTP-only cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: ENV.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Audit log
    await logAudit({
      shopId: shop._id,
      actor: user,
      action: 'AUTH_LOGIN',
      targetType: 'User',
      targetId: user._id.toString(),
      summary: `User ${user.name} logged in successfully`
    });

    return sendSuccess(res, {
      token: accessToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        shopId: shop._id.toString(),
        shopName: shop.name
      },
      shop: {
        id: shop._id.toString(),
        name: shop.name,
        tagline: shop.tagline,
        ownerName: shop.ownerName,
        currency: shop.currency,
        categories: shop.categories,
        warrantyDurations: shop.warrantyDurations,
        staffMembers: shop.staffMembers
      }
    }, 'Signed in successfully');
  } catch (error) {
    console.error('[Auth] Login error:', error);
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: ENV.NODE_ENV === 'production' ? 'strict' : 'lax'
    });

    if (req.user) {
      await logAudit({
        shopId: req.user.shopId,
        actor: req.user,
        action: 'AUTH_LOGOUT',
        targetType: 'User',
        targetId: req.user.id,
        summary: `User ${req.user.name} logged out`
      });
    }

    return sendSuccess(res, {}, 'Logged out successfully');
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const shop = await Shop.findById(req.user.shopId);

    if (!user || !shop) {
      return sendError(res, 'NOT_FOUND', 'User or shop record not found', [], 404);
    }

    return sendSuccess(res, {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        shopId: shop._id.toString(),
        shopName: shop.name
      },
      shop: {
        id: shop._id.toString(),
        name: shop.name,
        tagline: shop.tagline,
        ownerName: shop.ownerName,
        phone: shop.phone,
        address: shop.address,
        city: shop.city,
        currency: shop.currency,
        categories: shop.categories,
        warrantyDurations: shop.warrantyDurations,
        staffMembers: shop.staffMembers
      }
    });
  } catch (error) {
    return sendError(res, 'SERVER_ERROR', error.message, [], 500);
  }
};

export const refreshSession = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      return sendError(res, 'UNAUTHORIZED', 'Refresh token required', [], 401);
    }

    const decoded = jwt.verify(token, ENV.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return sendError(res, 'UNAUTHORIZED', 'Invalid session', [], 401);
    }

    const newAccessToken = jwt.sign(
      { userId: user._id.toString(), role: user.role, shopId: user.shopId.toString() },
      ENV.JWT_ACCESS_SECRET,
      { expiresIn: ENV.JWT_ACCESS_EXPIRES_IN }
    );

    return sendSuccess(res, { token: newAccessToken }, 'Token refreshed');
  } catch (error) {
    return sendError(res, 'UNAUTHORIZED', 'Invalid or expired refresh token', [], 401);
  }
};
