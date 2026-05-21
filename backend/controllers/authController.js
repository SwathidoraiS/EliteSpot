const authService = require("../services/authService");

exports.login = async (req, res, next) => {

  try {
    const result = await authService.login(req.body);

    res.status(200).json({
      success: true,
      data: result
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