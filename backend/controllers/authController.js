const authService = require("../services/authService");

exports.login = async (req, res) => {

  try {

    const result = await authService.login(req.body);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message
    });

  }

};

//Forget password
exports.forgotPassword = async (req, res) => {

  try {

    const { email } = req.body;
    const result = await authService.forgotPassword(email, req);

    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message
    });

  }

};

//Reset Password
exports.resetPassword = async (req, res) => {

  try {

    const { token, password } = req.body;

    const result = await authService.resetPassword(token, password);

    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message
    });

  }

};

exports.verifyResetToken = async (req, res) => {

  try {

    const { token } = req.params;

    const result = await authService.verifyResetToken(token);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {

    res.json({
      success: false,
      message: error.message
    });

  }

};