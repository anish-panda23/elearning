const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

const registerUser = async (req, res) => {

  const { userName, userEmail, password, role } = req.body;

  const existingUser = await User.findOne({
    $or: [{ userEmail }, { userName }],
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "User name or user email already exists",
    });
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    userName,
    userEmail,
    role: role || "user",
    password: hashPassword,
  });

  await newUser.save();

  return res.status(201).json({
    success: true,
    message: "User registered successfully!",
  });
};

const loginUser = async (req, res) => {
  const { userEmail, password } = req.body;

  const checkUser = await User.findOne({ userEmail });

  if (!checkUser || !checkUser.password || !(await bcrypt.compare(password, checkUser.password))) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // Check if Two-Factor Authentication is enabled
  if (checkUser.isTwoFactorEnabled) {
    return res.status(200).json({
      success: true,
      require2FA: true,
      userId: checkUser._id,
      message: "2FA Verification required",
    });
  }

  const accessToken = jwt.sign(
    {
      _id: checkUser._id,
      userName: checkUser.userName,
      userEmail: checkUser.userEmail,
      role: checkUser.role,
    },
    process.env.JWT_SECRET || "JWT_SECRET",
    { expiresIn: "120m" }
  );

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    data: {
      accessToken,
      user: {
        _id: checkUser._id,
        userName: checkUser.userName,
        userEmail: checkUser.userEmail,
        role: checkUser.role,
        isTwoFactorEnabled: checkUser.isTwoFactorEnabled,
      },
    },
  });
};

const googleAuth = async (req, res) => {
  try {
    const { credential, role } = req.body;
    let payload;

    const clientId = process.env.GOOGLE_CLIENT_ID;

    // Verify token with Google if CLIENT_ID is set
    if (clientId && !clientId.includes("your_google_client_id")) {
      const client = new OAuth2Client(clientId);
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
      payload = ticket.getPayload();
    } else {
      payload = jwt.decode(credential);
    }


    if (!payload || !payload.email) {
      return res.status(400).json({
        success: false,
        message: "Invalid Google credential",
      });
    }

    const { email, name, sub: googleId } = payload;
    let user = await User.findOne({ userEmail: email });

    if (!user) {
      user = new User({
        userName: name || email.split("@")[0],
        userEmail: email,
        googleId,
        isGoogleUser: true,
        role: role || "user",
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.isGoogleUser = true;
      await user.save();
    }

    if (user.isTwoFactorEnabled) {
      return res.status(200).json({
        success: true,
        require2FA: true,
        userId: user._id,
        message: "2FA Verification required",
      });
    }

    const accessToken = jwt.sign(
      {
        _id: user._id,
        userName: user.userName,
        userEmail: user.userEmail,
        role: user.role,
      },
      process.env.JWT_SECRET || "JWT_SECRET",
      { expiresIn: "120m" }
    );

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      data: {
        accessToken,
        user: {
          _id: user._id,
          userName: user.userName,
          userEmail: user.userEmail,
          role: user.role,
          isTwoFactorEnabled: user.isTwoFactorEnabled,
        },
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return res.status(500).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};

const setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const secret = speakeasy.generateSecret({
      name: `Elearn Adda (${user.userEmail})`,
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    user.twoFactorSecret = secret.base32;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        secret: secret.base32,
        qrCodeUrl,
      },
    });
  } catch (error) {
    console.error("Setup 2FA error:", error);
    res.status(500).json({ success: false, message: "Failed to setup 2FA" });
  }
};

const verifyEnable2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user._id);

    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ success: false, message: "2FA setup not initiated" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
    });

    if (!verified) {
      return res.status(400).json({ success: false, message: "Invalid 2FA Code" });
    }

    user.isTwoFactorEnabled = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "2FA enabled successfully",
      user: {
        _id: user._id,
        userName: user.userName,
        userEmail: user.userEmail,
        role: user.role,
        isTwoFactorEnabled: true,
      },
    });
  } catch (error) {
    console.error("Verify 2FA error:", error);
    res.status(500).json({ success: false, message: "Failed to verify 2FA token" });
  }
};

const validate2FA = async (req, res) => {
  try {
    const { userId, token } = req.body;
    const user = await User.findById(userId);

    if (!user || !user.twoFactorSecret || !user.isTwoFactorEnabled) {
      return res.status(400).json({ success: false, message: "2FA is not enabled for this user" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ success: false, message: "Invalid 2FA Security Code" });
    }

    const accessToken = jwt.sign(
      {
        _id: user._id,
        userName: user.userName,
        userEmail: user.userEmail,
        role: user.role,
      },
      process.env.JWT_SECRET || "JWT_SECRET",
      { expiresIn: "120m" }
    );

    res.status(200).json({
      success: true,
      message: "2FA verification successful",
      data: {
        accessToken,
        user: {
          _id: user._id,
          userName: user.userName,
          userEmail: user.userEmail,
          role: user.role,
          isTwoFactorEnabled: user.isTwoFactorEnabled,
        },
      },
    });
  } catch (error) {
    console.error("Validate 2FA error:", error);
    res.status(500).json({ success: false, message: "Failed to validate 2FA token" });
  }
};

const disable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "2FA disabled successfully",
      user: {
        _id: user._id,
        userName: user.userName,
        userEmail: user.userEmail,
        role: user.role,
        isTwoFactorEnabled: false,
      },
    });
  } catch (error) {
    console.error("Disable 2FA error:", error);
    res.status(500).json({ success: false, message: "Failed to disable 2FA" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleAuth,
  setup2FA,
  verifyEnable2FA,
  validate2FA,
  disable2FA,
};

