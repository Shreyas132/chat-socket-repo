const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
    username:{type:String,required:true},
    text:{type:String,required:true},
    room:{type:String,required:true},
    time:{type:String,required:true}
},{timestamps:true})

const chatMessageModel = mongoose.models.chatMessageModel || mongoose.model("chatMessageModel", messageSchema);
module.exports = chatMessageModel