const { Strategy } = require("passport-local");
const bcrypt = require("bcrypt");

function passportInitializer(passport, getbymail,getbyid) {
  passport.use(
    new Strategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        const user = await getbymail(email);
        if (!user) return done(null, false, { message: "no user with that email" });
        const isMatch = await bcrypt.compare(password, user.password)
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: "incorrect password" });
        }
      } catch (error) {
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => {
    return done(null, user._id);
  });
  passport.deserializeUser(async (id, done) => {
    console.log(id)
    try{
        const user = await getbyid(id) 
        return done(null,user );

    } catch(error){
        return done(error)
    }
  });
}

module.exports = passportInitializer;
