const express = require("express");
const morgan = require("morgan");
const multer = require("multer");
const shortid = require("shortid");
const fs = require("fs/promises");
const { join } = require("path");
const fileTypes = ["png", "zip", "jpg", "jpeg"];

fs.access(join(__dirname, "../public/")).catch(async () => await fs.mkdir(join(__dirname, "../public/")))

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, join(__dirname, "../public/"));
  },
  filename: function (req, file, cb) {
    const date = new Date();
    cb(null, `${file.originalname.split(".")[0]}_${shortid.generate()}.${file.originalname.split(".").pop()}`);
  },
});
const upload = multer({
  dest: join(__dirname, "../public/"),
  preservePath: true,
  fileFilter,
  storage,
});
const app = express();
const port = 3000;

app.use(morgan("dev"));
app.use(express.static(join(__dirname, "../public/")));

app.set("view engine", "ejs");
app.set("views", join(__dirname, "../views"));
app.set("json spaces", 2);

app.get("/", (req, res) => {
  const uploaded = req.query.uploaded;
  if (uploaded) return res.render("uploaded", { uploaded });
  res.render("index");
});

app.post("/upload", upload.single("upload"), async (req, res) => {
  const file = req.file;
  const jsonFile = join(__dirname, "../public/json.json");
  const content = await fs
    .readFile(jsonFile, {
      encoding: "utf-8",
    })
    .catch(() => {});
  const json = JSON.parse(content || '{ "data":[] }');
  json.data.push(`/${file.filename}`);
  await fs.writeFile(jsonFile, JSON.stringify(json));

  if (req.body.sharex) return res.status(200).send(`https://cdn.matievisthekat.dev/${file.filename}`);
  else return res.redirect(`/?uploaded=${file.filename}`);
});

app.listen(port, () => console.log(`Listening on port ${port}`));

function fileFilter(req, file, cb) {
  if (!fileTypes.includes(file.originalname.split(".")[1])) return cb(null, false);

  cb(null, true);
}
