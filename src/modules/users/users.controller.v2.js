import mongoose from "mongoose";
import { User } from "./user.model.js";
import { supabase } from "../../config/supabase.js";

// Helper: Remove password from user response
const userResponse = (doc) => {
  const user = doc.toObject();
  delete user.password;
  return user;
};

// Error handlers
const handleMongoError = (res, error) => {
  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      error: "Invalid user id",
    });
  }

  if (error?.code === 11000) {
    return res.status(409).json({
      success: false,
      error: "This email is already in use",
    });
  }

  return res.status(400).json({
    success: false,
    error: error.message || "Request failed",
  });
};

const handlePgError = (res, error) => {
  if (error?.code === "23505") {
    return res.status(409).json({
      success: false,
      error: "This email is already in use",
    });
  }

  return res.status(400).json({
    success: false,
    error: error.message || "Request failed",
  });
};

// ====== MongoDB Controllers ======

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return handleMongoError(res, error);
  }
};

export const createUser = async (req, res) => {
  const body = req.body || {};
  const isArray = Array.isArray(body);
  const users = isArray ? body : [body];

  // Validate all users
  for (const user of users) {
    const { username, email, password } = user;
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "username, email, and password are required for all users",
      });
    }
  }

  try {
    const insertData = users.map((user) => ({
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role || "user",
    }));

    const docs = await User.insertMany(insertData);
    const response = isArray ? docs.map(userResponse) : userResponse(docs[0]);

    return res.status(201).json({ success: true, data: response });
  } catch (error) {
    return handleMongoError(res, error);
  }
};

export const updateUser = async (req, res) => {
  const { username, email, password, role } = req.body || {};
  const updates = {};

  if (username !== undefined) updates.username = username;
  if (email !== undefined) updates.email = email;
  if (password !== undefined) updates.password = password;
  if (role !== undefined) updates.role = role;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      error: "At least one field is required to update",
    });
  }

  try {
    const doc = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("+password");

    if (!doc) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({ success: true, data: userResponse(doc) });
  } catch (error) {
    return handleMongoError(res, error);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const doc = await User.findByIdAndDelete(req.params.id).select("+password");

    if (!doc) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({ success: true, data: userResponse(doc) });
  } catch (error) {
    return handleMongoError(res, error);
  }
};

// ====== Supabase / PostgreSQL Controllers ======

const PG_SELECT = "id, username, email, role, created_at, updated_at";

export const getAllUsersPG = async (req, res) => {
  try {
    const { data, error } = await supabase.from("users").select(PG_SELECT);

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return handlePgError(res, error);
  }
};

export const createUserPG = async (req, res) => {
  const body = req.body || {};
  const isArray = Array.isArray(body);
  const users = isArray ? body : [body];

  // Validate all users
  for (const user of users) {
    const { username, email, password } = user;
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "username, email, and password are required for all users",
      });
    }
  }

  try {
    const insertData = users.map((user) => ({
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role || "user",
    }));

    const { data, error } = await supabase
      .from("users")
      .insert(insertData)
      .select(PG_SELECT);

    if (error) throw error;

    const response = isArray ? data : data[0];
    const statusCode = isArray ? 201 : 201;

    return res.status(statusCode).json({ success: true, data: response });
  } catch (error) {
    return handlePgError(res, error);
  }
};

export const updateUserPG = async (req, res) => {
  const { username, email, password, role } = req.body || {};
  const updates = {};

  if (username !== undefined) updates.username = username;
  if (email !== undefined) updates.email = email;
  if (password !== undefined) updates.password = password;
  if (role !== undefined) updates.role = role;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      error: "At least one field is required to update",
    });
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", req.params.id)
      .select(PG_SELECT);

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({ success: true, data: data[0] });
  } catch (error) {
    return handlePgError(res, error);
  }
};

export const deleteUserPG = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .delete()
      .eq("id", req.params.id)
      .select("id, username, email, role");

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({ success: true, data: data[0] });
  } catch (error) {
    return handlePgError(res, error);
  }
};
