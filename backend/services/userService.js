const { users } = require("../data/store");

const login = async ({ email, password }) => {

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) throw new Error("Invalid credentials");

  return {
    success: true,
    message: "Login successful",
    user
  };
};

module.exports = { login };