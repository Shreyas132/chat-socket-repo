const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
    username:{type:String,required:true},
    text:{type:String},
    type:{type:String,enum:["text","file"],default:"text"},
    filename:{type:String},
    originalname:{type:String},
    room:{type:String,required:true},
    time:{type:String,required:true},
    url:String,
    size:Number
},{timestamps:true})

const chatMessageModel = mongoose.models.chatMessageModel || mongoose.model("chatMessageModel", messageSchema);
module.exports = chatMessageModel