import jwt from "jsonwebtoken";
import { isMongoReady } from "../config/mongodb.js";
import { User } from "../modules/users/user.model.js";

const TOKEN_COOKIE_NAME = "accessToken";

const parseCookies = (cookieHeader = "") => {
  return cookieHeader.split(";").reduce((cookies, part) => {
    const [rawKey, ...rawValue] = part.trim().split("=");

    if (!rawKey) return cookies;

    cookies[rawKey] = decodeURIComponent(rawValue.join("="));
    return cookies;
  }, {});
};

const extractToken = (req) => {
  const authHeader = req.headers.authorization || "";

  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const cookies = parseCookies(req.headers.cookie);
  return cookies[TOKEN_COOKIE_NAME];
};

export const protectAuth = async (req, res, next) => {
  if (!isMongoReady()) {
    return res.status(503).json({
      success: false,
      error: "MongoDB is not connected yet",
    });
  }

  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: user not found",
      });
    }

    req.user = user;
    req.auth = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized: invalid or expired token",
    });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: user context missing",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Forbidden: insufficient permissions",
      });
    }

    next();
  };
};

export const authorizeSelfOrAdmin = (paramKey = "id") => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: user context missing",
      });
    }

    const targetUserId = req.params[paramKey];
    const currentUserId = String(req.user._id);
    const isAdmin = req.user.role === "admin";
    const isOwner = currentUserId === targetUserId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        error: "Forbidden: you can only access your own account",
      });
    }

    next();
  };
};
