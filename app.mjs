import express from "express";
import connectionPool from "./utils/db.mjs"; //สำหรับทำ query
import cors from "cors"; //สำหรับ vercel
import postValidation from "./Middlewear/post.validation.mjs";
const app = express();
const port = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());
//-------------------------------------------------------

//DEMO API-----------------------------------------------
app.get("/demo", (req, res) => {
  return res.json("Sever is resopns");
});

//API for GET--------------------------------------------
app.get("/posts/:postId", async (req, res) => {
  //1.เข้าถึง req --------------------------------------------------
  const postIdFromClient = req.params.postId;
  //2. เขียน query -->>>>> database >>>>>--------------------------
  try {
    const result = await connectionPool.query("select * from posts where id=$1" , [postIdFromClient]);
  //3.return res -------------------------------------------------
    return res.status(200).json({ data: result.rows });
  } catch (error) {
    return res.status(500).json({ message: "Sever not response" });
  }
});
//get query params.......................................

app.get("/posts", async (req, res) => {
  //กำหนดตัวแปรสำหรับเงื่อนไขต่างๆ
  /**
   * "totalPosts": 30,
         "totalPages": 5,
         "currentPage": 1,
         "limit": 6,
         "posts": [{post_data_1},{post_data_2},
         <4 more posts...>],
         "nextPage": 2
      
page: (Optional) หมายเลขหน้าที่ต้องการจะแสดง, หากไม่ใส่ค่าเริ่มต้นคือ 1
limit: (Optional) จำนวนโพสต์ต่อหน้า, หากไม่ใส่เริ่มต้นคือ 6
category: (Optional) กรองโพสต์ตามหมวดหมู่
keyword: (Optional) ค้นหาบทความโดยใช้ Title, Description, หรือเนื้อหาของบทความ

เอาตัวแปรไปแทนที่ใน qurey.(qurey_function, value )
   */
  const category = req.query.category || "";
  const keyword = req.query.keyword || "";
  const page = req.query.page || 1;
  const PAGE_SIZE = 5;
  const offset = (page - 1) * PAGE_SIZE; //เอาไว้ช้ามข้อมูลในหน้าที่แล้ว เช่น ถ้าเข้าหน้า 2 ก็จะข้ามข้อมูล 5 ชุด ถ้าเป็นหน้า 3 ก็จะข้าม 10 ชุด

  // const totalPosts = 10; //มาจาก select count(*)
  // const totalPages = totalPosts / PAGE_SIZE;
  // const currentPage = page;
  // const nextPage = currentPage + 1;

  //1.ทำ default query หรือส่วนหัวของคิวรี่ เลือกข้อมูลที่เราจะส่งให้ client โดย values จะกำหนดเป็นอาเรย์เปล่า
  //+แก้ * ให้เป็นชุดข้อมูลที่เราจะให้
  let query =
    "select * from posts inner join categories on posts.category_id = categories.id";
  let values = [];
  //2.ทำ qurey สำหรับ parameter ที่ client ส่งมา โดยจะมีเงื่อนไขดักว่า client ส่งพารามิเตอร์ตัวไหนมาบ้าง จากนั้นจะนำคิวรี่พารามิเตอร์ไปต่อท้ายด้วย query += "_where..."
  //+ตรง _where ต้องเว้นว่างไว้เพื่อให้เวลาคิวรี่ไปต่อกันจะได้ไม่ผิด syntax ไม่อย่างนั้นจะเป็น ...categories.idwhere...
  //เงื่อนไขถามว่า มี keyword หรือ category หรือมีทั้งคู่ หรือไม่มีเลย จากนั้นจะส่งคิวรี่ใหม่ไปต่อท้ายตามเงื่อนไข
  if (keyword && category) {
    query +=
      " where categories.name ilike $1 and title ilike $2 limit $3 offset $4";
    values = [`%${category}%`, `%${keyword}%`, PAGE_SIZE, offset];
  } else if (keyword) {
    query += " where title ilike $1 limit $2 offset $3";
    values = [`%${keyword}%`, PAGE_SIZE, offset];
  } else if (category) {
    query += " where categories.name ilike $1 limit $2 offset $3";
    values = [`%${category}%`, PAGE_SIZE, offset];
  } else {
    query += " limit $1 offset $2";
    values = [PAGE_SIZE, offset];
  }
  //3.ทำคิวรี่สำหรับนับจำนวน posts ทั้งหมด เนื่องจาก requirement อยากให้เรานับ posts และเอามาคำนวนหา totalPage/
  //4.เอาคิวรี่ count มาคำนวนหาค่าต่างๆ

  try {
    const result = await connectionPool.query(query, values);
    //.query("select * form posts where id= $1", [targetId])
    return res.status(200).json({ data: result.rows });
  } catch (error) {
    console.log(error);
    return res.json({ message: error.message });
  }
});

//API for POST-------------------------------------------
app.post("/posts", [postValidation], async (req, res) => {
  //1. เข้าถึง req.body
  const newAssignment = {
    ...req.body,
  };
  //2. ทำ query post
  try {
    connectionPool.query(
      `insert into 
      posts (title, image, category_id, description, content, status_id) 
      values ($1,$2,$3,$4,$5,$6)`,
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
  return res.status(201).json({ message: "Create post successfully" });
});

//API for PUT--------------------------------------------
app.put("/posts/:postId",[postValidation], async (req, res) => {
  //ติด error: null value in column \"image\" of relation \"posts\" violates not-null constraint"
  const postIdFromClient = req.params.postId;
  const updatedPost = { ...req.boby };
  try {
    await connectionPool.query(
      `update posts set title=$1, image=$2, category_id=$3, description=$4, content=$5, status_id=$6 where id=$7`,
      [
        updatedPost.title,
        updatedPost.image,
        updatedPost.category_id,
        updatedPost.description,
        updatedPost.content,
        updatedPost.status_id,
        postIdFromClient,
      ]
    );
  } catch (error) {
    return res.status(500).json({
      message: `Server could not read post because database connection: ${error}`,
    });
  }

  return res.status(201).json({ message: "Update post successfully" });
});
//API for DELETE-----------------------------------------
app.delete("/posts/:postId", async (req, res) => {
  const postIdFromClient = req.params.postId;
  try {
    await connectionPool.query("delete from posts where id=$1", [
      postIdFromClient,
    ]);
  } catch (error) {
    return res.status(500).json({
      message: `Server could not delete post because database connection ${error}`,
    });
  }
  return res.status(201).json({ message: "Deleted post sucessfully" });
});

//sever status*******************************************
app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});

//Create Read Update Delete
