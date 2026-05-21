import bcrypt from "bcrypt";
import { Router } from "express";
import { supabase } from "../../config/supabase.js";
import { protectAuth } from "../../middlewares/auth.middleware.js";
import {
  getUsers,
  createUser,
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateUser,
  deleteUser,
} from "../../modules/users/users.v2.controller.js";

export const router = Router();

// MongoDB routes (/api/v2/users)
router.get("/", getUsers);
router.post("/", createUser);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", protectAuth, getMe);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

// Supabase / PostgreSQL routes (/api/v2/users/pg)
const PG_SELECT = "id, username, email, role, created_at, updated_at";

router.get("/pg", async (req, res) => {
  try {
    const { data, error } = await supabase.from("users").select(PG_SELECT);

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/pg", async (req, res) => {
  const { username, email, password, role } = req.body || {};

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      error: "username, email, and password are required",
    });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (findError) throw findError;

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "This email is already in use",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const { data, error } = await supabase
      .from("users")
      .insert({
        username,
        email: normalizedEmail,
        password: hashedPassword,
        role: role || "user",
      })
      .select(PG_SELECT)
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/pg/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: "email and password are required",
    });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const { data: userInDB, error } = await supabase
      .from("users")
      .select("id, username, email, role, password, created_at, updated_at")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (error) throw error;

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

    delete userInDB.password;

    return res.status(200).json({
      success: true,
      data: userInDB,
      message: "Login successful",
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

router.put("/pg/:id", async (req, res) => {
  const { username, email, password, role } = req.body || {};
  const updates = {};

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
    return res.status(400).json({ success: false, error: error.message });
  }
});

router.delete("/pg/:id", async (req, res) => {
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
    return res.status(400).json({ success: false, error: error.message });
  }
});
