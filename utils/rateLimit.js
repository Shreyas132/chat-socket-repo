const rateLimit = require("express-rate-limit");

const maxrateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts",
  standardHeaders: true,
  legacyHeaders: false,
});
module.exports = maxrateLimit