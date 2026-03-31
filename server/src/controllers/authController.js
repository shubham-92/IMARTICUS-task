import { User } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

const serializeUser = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role
});

export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("User already exists");
      error.statusCode = 409;
      throw error;
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role === "admin" ? "admin" : "learner"
    });

    res.status(201).json({
      token: generateToken({ userId: user._id, role: user.role }),
      user: serializeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    res.json({
      token: generateToken({ userId: user._id, role: user.role }),
      user: serializeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res) => {
  res.json({
    user: serializeUser(req.user)
  });
};
