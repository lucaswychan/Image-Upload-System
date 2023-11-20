const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const UserModel = require("./model/user");
const imageSize = require("image-size");
const PNG = require("pngjs").PNG;
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();

const port = process.env.PORT || 8000;

// express app setup
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// multer setup
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(__dirname, "/public/Images"));
  },
  filename: (req, file, callback) => {
    callback(
      null,
      file.originalname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const mulUpload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array("images", 5);

// database connection
const dbUser = process.env.USER;
const dbPassword = process.env.PASSWORD;

mongoose.connect(
  `mongodb+srv://${dbUser}:${dbPassword}@cluster0.wajq3ft.mongodb.net/image-upload?retryWrites=true&w=majority`
);

// helper function
// const containTransparency = async (image) => {
//   // gm(image)
//   //   .stream('png')
//   //   .pipe(new PNG({}))
//   //   .on('metadata', meta => {
//   //     if (meta.alpha) {
//   //       return true
//   //     } else {
//   //       // image is not transparent
//   //       return false
//   //     }
//   //   }).on("error", err => console.log("Error appears in PNG : ", err));

//   function checkTransparency(png) {
//     for (let y = 0; y < png.height; y++) {
//       for (let x = 0; x < png.width; x++) {
//         const idx = (png.width * y + x) << 2; // Get the index of the current pixel
//         const alpha = png.data[idx + 3]; // Get the alpha value of the current pixel
//         if (alpha < 255) {
//           // If the alpha value is less than 255, it's transparent
//           return true;
//         }
//       }
//     }
//     return false;
//   }

//   await fs
//     .createReadStream(image)
//     .pipe(new PNG())
//     .on("parsed", function () {
//       const isTransparent = checkTransparency(this);
//       console.log("Image has transparent background:", isTransparent);
//       return isTransparent;
//     })
//     .on("error", function (error) {
//       console.error("Error reading image:", error);
//     });
// };

const containTransparency = (pngBuffer) => {
  const png = PNG.sync.read(pngBuffer);
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const idx = (png.width * y + x) << 2; // Get the index of the current pixel
      const alpha = png.data[idx + 3]; // Get the alpha value of the current pixel
      if (alpha < 255) {
        // If the alpha value is less than 255, it's transparent
        console.log("Image has transparent background:", true);
        return true;
      }
    }
  }
  console.log("Image has transparent background:", false);
  return false;
};

// API
app.post("/upload", async (req, res) => {
  // callback function
  mulUpload(req, res, async (err) => {
    // Error Handling
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      res
        .status(500)
        .send({ error: { message: `Multer uploading error: ${err.message}` } })
        .end();
      return;
    } else if (err) {
      // An unknown error occurred when uploading.
      if (err.name == "ExtensionError") {
        res
          .status(413)
          .send({ error: { message: err.message } })
          .end();
      } else {
        res
          .status(500)
          .send({
            error: { message: `unknown uploading error: ${err.message}` },
          })
          .end();
      }
      return;
    }

    // Everything went fine.
    const files = req.files;
    const warnings = [];
    const successMessages = [];

    files.forEach((file) => {
      const imagePath = path.join(__dirname, `/public/Images/${file.filename}`);
      const pngBuffer = fs.readFileSync(imagePath);
      const isTransparent = containTransparency(pngBuffer);
      if (!isTransparent) {
        console.log(
          `The background of image "${file.filename}" is not transparent`
        );
        warnings.push(
          `The background of image "${file.filename}" is not transparent`
        );
      } else {
        const dimension = imageSize(imagePath);
        console.log("dimension :", dimension.width, dimension.height);
        UserModel.create({
          name: file.filename,
          dimension: [dimension.height, dimension.width],
        });
        successMessages.push(
          `The image "${file.filename}" is successfully uploaded`
        );
      }
    });

    if (warnings.length > 0) {
      console.log("Warning in server : ", warnings);
      return res
        .status(400)
        .json({ warning: warnings, message: successMessages });
    }

    res.status(200).json({ message: successMessages });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
