const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const auth = require("../../models/auth.js");
const User = require("../../models/usersSchema.js");
const multer = require("multer");
const jimp = require("jimp");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const sendEmail = require("../../helpers/sendEmail");

const signupValidate = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginValidate = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

router.post("/signup", async (req, res) => {
  const { error } = signupValidate.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email in use" });
    }

    const verificationToken = uuidv4();

    const newUser = new User({
      email,
      password,
      subscription: "starter",
      avatarURL: "",
      verificationToken,
      verify: false,
    });

    const verifyUrl = `${process.env.BASE_URL}/api/users/verify/${verificationToken}`;

    await newUser.save();

    try {
      await sendEmail({
        to: newUser.email,
        subject: "E-mail verification",
        html: `
      <p>Welcome ${newUser.email},</p>
      <p>Click the link below to verify your email:</p>
      <a href="${verifyUrl}">Verify email</a>
    `,
      });
    } catch (emailError) {
      await User.findByIdAndDelete(newUser._id);
      throw emailError;
    }

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { error } = loginValidate.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    if (!user.verify) {
      return res.status(401).json({ message: "Email not verified" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    user.token = token;
    await user.save();

    res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
        avatarURL: user.avatarURL,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/verify/:verificationToken", async (req, res) => {
  const { verificationToken } = req.params;
  const frontendUrl = process.env.FRONTEND_URL;

  try {
    const user = await User.findOne({ verificationToken });

    if (!user) {
      if (frontendUrl) {
        return res.redirect(`${frontendUrl}/login?verified=false`);
      }

      return res.status(404).json({ message: "User not found " });
    }

    user.verificationToken = null;
    user.verify = true;
    await user.save();

    if (frontendUrl) {
      return res.redirect(`${frontendUrl}/login?verified=true`);
    }

    res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    console.error("Verification error", error);

    if (frontendUrl) {
      return res.redirect(`${frontendUrl}/login?verified=error`);
    }

    res.status(500).json({ message: "Server error" });
  }
});

router.post("/verify", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Fill all the required fields" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verify) {
      return res
        .status(400)
        .json({ message: "Verification has already been passed" });
    }

    const verificationToken = user.verificationToken;

    const verifyUrl = `${process.env.BASE_URL}/api/users/verify/${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: "E-mail verification",
      html: `
    <p>Welcome ${user.email},</p>
    <p>Click the link below to verify your email:</p>
    <a href="${verifyUrl}">Verify email</a>
  `,
    });

    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.use(auth);

router.get("/logout", async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    user.token = null;
    await user.save();
    res.status(204).send();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/current", async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "tmp");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },

  fileFilter: (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only image files are allowed"));
    }

    cb(null, true);
  },
}).single("avatar");

router.patch(
  "/avatars",
  (req, res, next) => {
    upload(req, res, function (err) {
      if (err) {
        return res.status(400).json({
          message: err.message,
        });
      }

      next();
    });
  },
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    let avatarPath;

    try {
      const { _id } = req.user;
      avatarPath = path.join(__dirname, "../../", "tmp", req.file.filename);

      const avatar = await jimp.read(avatarPath);
      await avatar.resize(250, 250);
      const publicDir = path.resolve(__dirname, "../../", "public", "avatars");

      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      const avatarFilename = `${_id}-${req.file.filename}`;
      const avatarSavePath = path.join(publicDir, avatarFilename);

      await avatar.write(avatarSavePath);

      const avatarURL = `/avatars/${avatarFilename}`;
      await User.findByIdAndUpdate(_id, { avatarURL });

      res.status(200).json({
        avatarURL,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    } finally {
      if (avatarPath && fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }
  },
);

module.exports = router;
