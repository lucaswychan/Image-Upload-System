const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const UserModel = require("./model/user")
const imageSize = require('image-size');;
const gm = require('gm');
const PNG = require('pngjs').PNG;

const port = process.env.PORT || 8000

// express app setup
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// multer setup
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(__dirname, '/public/Images'));
  },
  filename: (req, file, callback) => {
    callback(null, file.filename + "-" + Date.now() + path.extname(file.originalname));
  },
})

const mulUpload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array("images", 5);

// database connection
const dbUser = process.env.USER
const dbPassword = process.env.PASSWORD

mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.wajq3ft.mongodb.net/image-upload?retryWrites=true&w=majority`)

// helper function
const containTransparency = (image) => {
  gm(image)
    .stream('png')
    .pipe(new PNG({}))
    .on('metadata', meta => {
      if (meta.alpha) {
        return true
      } else {
        // image is not transparent
        return false
      }
    }).on("error", err => console.log("Error appears in PNG : ", err));
};

// API
app.post("/upload", async (req, res) => {
  // callback function
  mulUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      res.status(500).send({ error: { message: `Multer uploading error: ${err.message}` } }).end();
      return;
    } else if (err) {
      // An unknown error occurred when uploading.
      if (err.name == 'ExtensionError') {
        res.status(413).send({ error: { message: err.message } }).end();
      } else {
        res.status(500).send({ error: { message: `unknown uploading error: ${err.message}` } }).end();
      }
      return;
    }

    // Everything went fine.
    const files = req.files;
    const warnings = [];

    files.forEach(async (file) => {
      const imagePath = path.join(__dirname, `/public/Images/${file.filename}`);
      if (!containTransparency(imagePath)) {
        console.log(`The background of image ${file.filename} is not transparent`);
        warnings.push(`The background of image ${file.filename} is not transparent`);
      }
      else {
        const dimension = imageSize();
        console.log("dimension : ", dimension.width, dimension.height);
        UserModel.create({ name: file.filename, dimension: [dimension.height, dimension.width] });
      }
    });

    if (warnings.length > 0) {
      console.log("Warning in server : ", warnings);
      return res.status(400).json({ message: warnings });
    }

    res.status(200).json({ message: "Upload successful." });
  })
});

// app.get("/getImage", (req, res) => {

// });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});