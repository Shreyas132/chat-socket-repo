const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
    username:{type:String,require:true},
    text:{type:String,require:true},
    room:{type:String,require:true},
    time:{type:String,require:true}
},{timestamps:true})

const chatModel = mongoose.model("messageModel",messageSchema)
module.exports = chatModel