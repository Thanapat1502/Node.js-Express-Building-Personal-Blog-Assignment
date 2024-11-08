import express from "express";
import connectionPool from "./utils/db.mjs"; //สำหรับทำ query
import cors from "cors"; //สำหรับ vercel
const app = express();
const port = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());
//-------------------------------------------------------

//API for GET
app.get("/demo", (req, res) => {
  return res.json("Sever is resopns");
});

app.get("/posts", async (req, res) => {
  let result;
  try {
    result = await connectionPool.query("select * from posts"); //จุดสำคัญคือ query
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Server not respons: ${error}` });
  }
  return res.status(200).json({ data: result.rows });
});

//API for POST
app.post("/assignments", async (req, res) => {
  //1. เข้าถึง req.body
  const newAssignment = {
    ...req.body,
  };
  //2. ทำ query post
  try {
    connectionPool.query(
      `insert into posts (title, image, category_id, description, content, status_id) values ($1,$2,$3,$4,$5,$6)`,
      [
        newAssignment.title,
        newAssignment.image,
        newAssignment.category_id,
        newAssignment.description,
        newAssignment.content,
        newAssignment.status_id,
      ]
    );
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message:
        "Server could not create post because there are missing data from client",
    });
  }
  //3. รีเทิร์น res
  return res.status(201).json({ message: "Create post successfully" });
});

//sever status
app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
