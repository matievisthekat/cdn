import express from "express";
import multer from "multer";
import { nanoid } from "nanoid";
import { resolve } from "path";
import { readdir } from "fs-extra";
import cors from "cors";

const publicDir = resolve("public");
const app = express();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, publicDir);
  },
  filename: function (req, file, cb) {
    const date = new Date();
    cb(null, `${nanoid()}_${nanoid()}.${file.originalname.split(".").pop()}`);
  },
});
const upload = multer({
  dest: publicDir,
  preservePath: true,
  storage,
});

app.set("json spaces", 2);
app.use(express.static(resolve("public")));
app.use(cors());

app.get("/", async (req, res) => {
  const files = await readdir(publicDir);
  res.status(200).json({ files: files.filter((f) => !f.startsWith(".")) });
});

app.post("/upload", upload.any(), (req, res) => {
  res.status(201).json({ files: req.files });
});

app.listen(3000, () => console.log("Listening on http://localhost:3000"));
