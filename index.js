import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan  from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { error } from "console";
import {register} from "./controllers/auth.js";
import { verifyToken } from "./middleware/auth.js";
import {createPost} from "./controllers/posts.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";

const __filename= fileURLToPath(import.meta.url );
const __dirname=path.dirname(__filename);

dotenv.config();
const app=express();
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"}));
app.use(morgan("common"));
app.use(bodyParser.json({limit:"30mb", extended:true}));
app.use(bodyParser.urlencoded({limit:"30mb", extended:true}));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });


app.post("/auth/register", upload.single("picture"),register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);

app.use("/auth",authRoutes);
app.use("/users",userRoutes);
app.use("/posts",postRoutes);



app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});




const PORT=process.env.PORT || 4000;
mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(()=>{
    app.listen(PORT,()=>console.log(`Server Port: ${PORT}`));
    // User.insertMany(users);
    // User.insertMany(posts);

})
.catch((error)=>console.log(`${error} did not connect`));