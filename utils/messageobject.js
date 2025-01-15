const moment = require("moment")
const Messageobject = (username,text) =>{
    return {
        username,
        text,
        time:moment().format('h:mm a')
    }
}

module.exports = Messageobject