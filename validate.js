const {body,validationResult} = require("express-validator")

const validate = ([
    body("username").isString().isLength({min:3}).isAlphanumeric().escape(),
    body("email").isEmail().withMessage("Invalid Email")
],(req,res,next)=>{
    const error = validationResult(req)
    if(!error.isEmpty()) {
        console.log(error.array())
        return res.status(400).json({message:error.array()})
    }
    next()
})

module.exports = validate
