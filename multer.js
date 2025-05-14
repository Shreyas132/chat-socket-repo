const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("./utils/cloudinary")
const path = require("path")

const storage = new CloudinaryStorage({
    cloudinary:cloudinary,
    params:(req,file)=>{
        const ext = path.extname(file.originalname).toLowerCase().slice(1)
        let resourceType = "raw"

        //conditional check  for file types
        if(["jpg","jpeg","png","gif","webp"].includes(ext))
            resourceType = "image"
        if(["mp4","mp3","wav","webm","mov"].includes(ext))
            resourceType = "video"

        return{
            folder:"chat_uploads",
            resourceType:resourceType,
            allowed_formats:["jpg", "png", "pdf", "mp4", "docx","mp3", "wav","webm","jpeg", "webp","doc", "ppt", "pptx", "txt", "zip", "rar" ],
            use_filename:true


        }
    }
})
const upload = multer({storage})

module.exports = upload;
