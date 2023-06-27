const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendVerificationEmail } = require("../utils/mailer");
const { JWT_SECRET } = require("../config");

// User registration
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email is already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isVerified: false,
    });

    // Save the user to the database
    await newUser.save();

    // Send verification email
    await sendVerificationEmail(newUser);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred during registration" });
  }
};

// Email verification
const verifyEmail = async (req, res) => {
  try {
    const { email, token } = req.params;

    // Verify the token
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(400).json({ error: "Invalid token" });
      }

      // Find the user in the database
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Mark the user as verified
      user.isVerified = true;
      await user.save();

      res.redirect("/login"); // Redirect to the login page after successful verification
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred during email verification" });
  }
};

// User login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the email is registered
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if the password is correct
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if the email is verified
    if (!user.isVerified) {
      return res.status(401).json({ error: "Email not verified" });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred during login" });
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
};
