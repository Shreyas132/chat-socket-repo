const express = require("express");
const session = require("express-session");
const path = require("path");
const http = require("http");
const socket = require("socket.io");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const passportInitializer = require("./passportlocalconfig");
const router = require("./routes/userroutes");
const uploadrouter = require("./routes/fileuploadroutes")
const messageModel = require("./models/userModel");
const chatMessageModel = require("./models/chats");
require("dotenv").config();
const {
  userJoin,
  getcurrentUser,
  leftUser,
  getRoomUsers,
} = require("./utils/users");
const passport = require("passport");
const moment = require("moment");
const flash = require("express-flash");
const { type } = require("os");
//
const app = express();
const server = http.createServer(app);
const io = socket(server, {
  cors: "http://localhost:8000",
  Credential: true,
});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//
const sessionMiddleware = session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.DB_CONNECTION_STRING,
    collectionName: "sessions",
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
  },
});

app.use(sessionMiddleware);
app.use(flash());
passportInitializer(passport, getbyemail, getbyid);
app.use(passport.initialize());
app.use(passport.session());

//
app.set("view engine", "ejs");

//
mongoose
  .connect(process.env.DB_CONNECTION_STRING)
  .then(() => console.log("Db connected succesfully"))
  .catch((error) => console.log("error while connectig database", error));

//
app.use(router);
app.use(uploadrouter)


async function getbyemail(email) {
  return await messageModel.findOne({ email });
}
async function getbyid(id) {
  return await messageModel.findById(id);
}

const botname = "Bot";
io.on("connection", (socket) => {
  //authenticate middleware

  //catch username and room
  socket.on("joinroom", async ({ username, room }) => {
    //join the room

    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    //chat history
    const loadhistory = await chatMessageModel
      .find({ room })
      .sort({ createdAt: 1 });
    socket.emit("loadmessages", loadhistory);
    // welcome message to all
    socket.emit("message", {
      type: "system",
      text: `Hello! Welcome ${user.username}`,
      time: moment().format("h:mm a"),
    });

    //when user joins broadcast this
    socket.broadcast.to(user.room).emit("message", {
      type: "system",
      text: `${user.username} has joined the chat`,
      time: moment().format("h:mm a"),
    });

    //send users and roomName

    io.to(user.room).emit("userRoom", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });
  //listen for chatmessage
  socket.on("chatMessage", async (message) => {
    const user = getcurrentUser(socket.id);
    if (user) {
      const chatData = new chatMessageModel({
        username: user.username,
        text: message.text || null,
        type:message.filename ? "file" : "text",
        filename:message.filename || null,
        originalname:message.originalname || null,
        room: user.room,
        time: moment().format("h:mm a"),
        url:message.url,
        size:message.size,
      });
      await chatData.save();
      io.to(user.room).emit("message", {
        username: chatData.username,
        text: chatData.text,
        type:chatData.type,
        filename:chatData.filename,
        originalname:chatData.originalname,
        time: chatData.time,
        url:chatData.url,
        size:chatData.size,
      });
    }
  });
  socket.on("disconnect", () => {
    const user = leftUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", {
        type:"system",
        username: botname,
        text: `${user.username} has left the chat`,
      });
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
