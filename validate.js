const { body, validationResult, check } = require("express-validator");

const validate =
  ([
    body("username").isString().isLength({ min: 3 }).isAlphanumeric().escape(),
    body("email").isEmail().withMessage("Invalid Email"),
  ],
  (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      console.log(error.array());
      return res.status(400).json({ message: error.array() });
    }
    next();
  });
const validateRegister = [
  check("password")
    .isLength({ min: 8 })
    .matches(/\d/)
    .withMessage("Password must be 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain atleast one Uppercase letter")
    .matches(/[a-z]/)
    .withMessage("password must contain atleast one lowercase letter")
    .matches(/[\W_]/)
    .withMessage("Password must contain atleast one special character"),
  (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      console.error(error.array());
      req.flash(
        "error",
        error.array().map((err) => err.msg)
      );
      return res.redirect("/register");
    }
    next();
  },
];
module.exports = { validate, validateRegister };
