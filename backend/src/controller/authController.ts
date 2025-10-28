import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../model/User";

const JWT_SECRET = "your_secret_key";

// ✅ REGISTER
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || "viewer",
    });

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ LOGIN
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.getDataValue("password"));
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      {
        id: user.getDataValue("id"),
        username: user.getDataValue("username"),
        role: user.getDataValue("role"),
      },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ token, role: user.getDataValue("role") });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
