import bcrypt from "bcrypt";
import { isMongoReady } from "../../config/mongodb.js";
import { User } from "./user.model.js";

const userResponse = (doc) => {
  const user = doc.toObject();
  delete user.password;
  return user;
};

const ensureMongoReady = (res) => {
  if (isMongoReady()) {
    return true;
  }

  res.status(503).json({
    success: false,
    error: "MongoDB is not connected yet",
  });
  return false;
};

export const getUsers = async (req, res, next) => {
  if (!ensureMongoReady(res)) return;

  try {
    const users = await User.find();
    return res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  const { username, email, password, role } = req.body || {};

  if (!ensureMongoReady(res)) return;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      error: "username, email, and password are required",
    });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(409).json({
        success: false,
        error: "This email is already in use",
      });
    }

    // ✅ เอาโค้ด bcrypt.hash ตรงนี้ออกแล้ว ส่งพาสเวิร์ดตรงๆ ไปให้ User.model จัดการแฮชแทน
    const doc = await User.create({
      username,
      email: normalizedEmail,
      password, 
      role,
    });

    return res.status(201).json({ success: true, data: userResponse(doc) });
  } catch (err) {
    next(err);
  }
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body || {};

  if (!ensureMongoReady(res)) return;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: "email and password are required",
    });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const userInDB = await User.findOne({ email: normalizedEmail }).select(
      "+password",
    );

    if (!userInDB) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, userInDB.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    return res.status(200).json({
      success: true,
      data: userResponse(userInDB),
      message: "Login successful",
    });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  const { username, email, password, role } = req.body || {};
  const updates = {};

  if (!ensureMongoReady(res)) return;

  if (username !== undefined) updates.username = username;
  if (email !== undefined) updates.email = email.trim().toLowerCase();
  if (role !== undefined) updates.role = role;

  if (Object.keys(updates).length === 0 && password === undefined) {
    return res.status(400).json({
      success: false,
      error: "At least one field is required to update",
    });
  }

  try {
    if (password !== undefined) {
      updates.password = await bcrypt.hash(password, 12);
    }

    const doc = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("+password");

    if (!doc) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({ success: true, data: userResponse(doc) });
  } catch (err) {
    err.status = 400;
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  if (!ensureMongoReady(res)) return;

  try {
    const doc = await User.findByIdAndDelete(req.params.id).select("+password");

    if (!doc) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({ success: true, data: userResponse(doc) });
  } catch (err) {
    next(err);
  }
};