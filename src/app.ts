import * as express from "express";
import { Request, Response } from "express";
import { myDataBase } from "./db";
import PostsRouter from "./routes/posts";
import CommentsRouter from "./routes/comment";
import { upload } from "./middleware/uploadS3";
import { PostsController } from "./controller/PostsController";
myDataBase
  .initialize() // 데이터베이스 연결
  .then(() => {
    console.log("Database is connected");
  })
  .catch((err) => {
    console.log("Database connection failed. Error: ", err);
  });

const app = express();
// find : 모든 데이터를 가져옴
// findOne : 조건에 맞는 데이터를 가져옴 - where : 조건을 설정
// findById : id에 맞는 데이터를 가져옴
// insert : 데이터를 생성
// update : 데이터를 수정
// delete : 데이터를 삭제
app.use(express.json()); // json 형태의 데이터를 받을 수 있게 해줌

app.use("/posts", PostsRouter);
app.use("/comments", CommentsRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
