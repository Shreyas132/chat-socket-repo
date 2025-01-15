const express = require("express");
const session = require("express-session");
const path = require("path");
const http = require("http");
const socket = require("socket.io");
const cors = require("cors")
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const passportInitializer = require("./passportlocalconfig");
const Messageobject = require("./utils/messageobject");
const router = require("./routes/userroutes");
const messageModel = require("./models/userModel");
require("dotenv").config()
const {
  userJoin,
  getcurrentUser,
  leftUser,
  getRoomUsers,
} = require("./utils/users");
const passport = require("passport");
//
const app = express();
const server = http.createServer(app);
const io = socket(server,{
  cors:"http://localhost:8000",
  Credential:true
});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//
const sessionMiddleware =   session({
  secret: "security",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.DB_CONNECTION_STRING,
    collectionName: "sessions",
  }),
})

app.use(sessionMiddleware);
passportInitializer(passport, getbyemail, getbyid);
app.use(passport.initialize());
app.use(passport.session());

//
app.set("view engine", "ejs");
app.use(router);
//

mongoose
  .connect(process.env.DB_CONNECTION_STRING)
  .then(() => console.log("Db connected succesfully"))
  .catch((error) => console.log("error while connectig database", error));

//

// io.use((socket,next)=>{
//   sessionMiddleware(socket.request,{},next)
// })

// io.use((socket,next)=>{
//   if(socket.request.passport.session && socket.request.session.passport.user){
//     console.log("Authorised user")
//     next()
    
//   }
//   console.log("UNAuthorised user")
//   next(new Error("UnAuthorised"))
// })


async function getbyemail (email){
  return await messageModel.findOne({ email });
};
async function getbyid (id){
  return await messageModel.findById(id);
};


const botname = "Bot";
io.on("connection", (socket) => {
  //authenticate middleware

  //catch username and room
  socket.on("joinroom", ({ username, room }) => {
    //join the room

    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    // welcome message to all
    socket.emit(
      "message",
      Messageobject(botname, ` Hello!welcome ${user.username}`)
    );

    //when user joins broadcast this
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        Messageobject(botname, `${user.username} has joined the chat`)
      );

    //send users and roomName

    io.to(user.room).emit("userRoom", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });
  //listen for chatmessage
  socket.on("chatMessage", (message) => {
    const user = getcurrentUser(socket.id);
    io.to(user.room).emit("message", Messageobject(user.username, message));
  });
  socket.on("disconnect", () => {
    const user = leftUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        Messageobject(botname, `${user.username} has left the chat`)
      );
      io.to(user.room).emit("userRoom", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

server.listen(8000, () => {
  console.log("app is listening on port 8000");
});
