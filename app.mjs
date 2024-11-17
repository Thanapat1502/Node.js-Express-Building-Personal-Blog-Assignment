import express from "express";
import connectionPool from "./utils/db.mjs"; //สำหรับทำ query
import cors from "cors"; //สำหรับ vercel
import postValidation from "./Middlewear/post.validation.mjs";
import postsRouter from "./router/post.mjs";


const app = express();
const port = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());
//API FOR POSTS-------------------------------------------------------
app.use("/posts", postsRouter);
//DEMO API-----------------------------------------------
app.get("/demo", (req, res) => {
  return res.json("Sever is resopns");
});
//sever status*******************************************
app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});

//Create Read Update Delete
