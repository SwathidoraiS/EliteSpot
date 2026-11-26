const authService = require("../services/authService");
const {createCsrfToken}=require("../middlewares/csrfMiddleware");

exports.login = async (req, res, next) => {

  try {
    const result = await authService.login(req.body);

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/"
    });

    res.status(200).json({
      success: true,
      data: {
        user: result.user
      }
    });

  } catch (error) {
    next(error);
  }

};

// Verify authenticated user session
exports.getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        role: req.user.role,
        username: req.user.username
      }
    });
  } catch (error) {
    next(error);
  }
};

//Forget password
exports.forgotPassword = async (req, res, next) => {

  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email, req);

    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    next(error);
  }

};

//Reset Password
exports.resetPassword = async (req, res, next) => {

  try {
    const { token, password } = req.body;

    const result = await authService.resetPassword(token, password);

    res.status(200).json({
      success: true,
      message: result.message
    });

  } catch (error) {
    next(error)
  }

};

exports.verifyResetToken = async (req, res, next) => {

  try {

    const { token } = req.params;

    const result = await authService.verifyResetToken(token);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    next(error);
  }

};

exports.logout = (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  };

  res.clearCookie("token", cookieOptions);
  res.clearCookie("csrfToken", cookieOptions);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};

exports.getCsrfToken = (req, res) => {
  const csrfToken = createCsrfToken();

  res.cookie("csrfToken", csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });

  return res.status(200).json({
    success: true,
    csrfToken
  });
};