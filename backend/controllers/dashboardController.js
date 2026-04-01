const { getDashboardData } = require("../services/dashboardService");

/**
 * 📊 Controller: Get Dashboard
 * Handles request/response only
 */
const getDashboard = async (req, res) => {
  try {
    const { date, start, end } = req.query;

    const data = await getDashboardData(date, start, end);

    return res.json({
      success: true,
      data,
    });

  } catch (err) {
    console.error("Dashboard Error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
    });
  }
};

module.exports = { getDashboard };