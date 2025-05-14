const express = require("express");
const uploadrouter = express.Router();
const mongoose = require("mongoose");
const upload = require("../multer");
let gfs;

uploadrouter.post("/upload", upload.single("file"), (req, res) => {
  // res.status(200).json({filename:req.file.filename})
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    res.status(200).json({
      filename: req.file.path,
      originalname: req.file.originalname,
      url: req.file.path,
      size: req.file.size,
    });
  } catch (err) {
    const util = require("util");
    console.error(
      "Upload failed:",
      util.inspect(err, { showHidden: false, depth: null })
    );
    res.status(500).json({ error: "File upload failed." });
  }
});

uploadrouter.post("/file/:filename", async (req, res) => {
  try {
    const file = mongoose.connection.db
      .collection("uploads.files")
      .findOne({ filename: req.params.filename });
    if (!file) return res.status(404).send("File not found");

    const readStream = gfs.openDownloadStreamByName(req.params.filename);
    readStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = uploadrouter;
