const chatModel = require("../models/messageModel");
const moment = require("moment");

const saveChatactivity = async (username, text) => {
    const time = moment().format("h:mm a")
  const savenewUser = new chatModel.create({ username, text, room, time });
  await savenewUser.save()
  return {username,text,room,time}
};

module.exports = saveChatactivity