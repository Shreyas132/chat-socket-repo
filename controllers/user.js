const messageModel = require("../models/userModel");
const passport = require("passport");
const bcrypt = require("bcrypt");

const getRegister = (req, res) => {
  res.render("register", { messages: { error: req.flash("error") } });
};
const handleRegister = async (req, res) => {
  console.log(req.body);
  const salt = 10;
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res
        .status(400)
        .send("username,email and password fields should not be empty");
    const hashpassword = await bcrypt.hash(password, salt);
    const createnewuser = new messageModel({
      username,
      email,
      password: hashpassword,
    });
    await createnewuser.save();
    console.log(createnewuser);
    res.redirect("/userlogin");
  } catch (error) {
    res.status(500).send("internal server error");
  }
};
const getLogin = (req, res) => {
  res.render("login");
};

//login without passport auth
/* const handleLogin = async (req,res)=>{
    try{
        const { email,password} = req.body
        if(!email || !password) return res.status(400).send("email and password should not be empty")

        const finduser = await messageModel.findOne({email:email})
        console.log(finduser)

        if(!finduser) return res.status(404).send("there is no user accociated with these email")
        if(await bcrypt.compare(password,finduser.password)) {
            console.log(finduser)
            return res.status(200).send("authentication succesfull")

        } else {
            return res.status(401).send("you are Unauthorised")
        }
    } catch (error){
        res.status(500).send("internal server error")
    }

} */

const handleLogin = (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/joinroom",
    failureRedirect: "/register",
    failureFlash: true,
  })(req, res, next);
};

const handleLogout = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("error logging out");
      return res.status(500).send("error logging out");
    }
    req.session.destroy((err) => {
      if (err) {
        console.log("error while destroying session id", err);
        res.status(500).send("Unable to logout");
      }
      res.clearCookie("connect.sid");
      res.redirect("/userlogin");
    });
  });
};

module.exports = {
  handleRegister,
  getRegister,
  getLogin,
  handleLogin,
  handleLogout,
};
