import { Router } from "express";
import { users } from "../../fakeData/fakeUsers.js";
import { User } from "../../modules/users/user.model.js";

export const router = Router();

const userResponse = (doc) => {
  const user = doc.toObject();
  delete user.password;
  return user;
};

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return res.status(400).json({ success: false, error: error });
  }
});

router.post("/", async (req, res) => {
  const { username, email, password, role } = req.body || {};

  if (!username || !email || !password) {
    const err = new Error("username, email, and password are required");
    err.name = "ValidationError";
    err.status = 400;
    return res.status(400).json({ success: false, error: err });
  }

  try {
    const doc = await User.create({ username, email, password, role });

    return res.status(201).json({ success: true, data: userResponse(doc) });
  } catch (err) {
    return res.status(400).json({ success: false, error: err });
  }
});

router.put("/:id", (req, res) => {
  const user = users.find((u) => String(u.id) === req.params.id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const { username, email, password } = req.body || {};

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "username, email, and password are required" });
  }

  user.username = username;
  user.email = email;
  user.password = password;

  return res.status(200).json(user);
});

router.delete("/:id", (req, res) => {
  const userIndex = users.findIndex((u) => String(u.id) === req.params.id);

  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  const [deletedUser] = users.splice(userIndex, 1);

  return res.status(200).json(deletedUser);
});
