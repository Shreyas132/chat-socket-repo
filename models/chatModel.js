const { text } = require("express")
const mongoose = require("mongoose")

const chatSchema = new mongoose.Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:user
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:user
    },
    text:{
        type:String,
        required:true
    }
},{timestamps:true})

const Chat = mongoose.model("Chat",chatSchema)
module.exports = Chat