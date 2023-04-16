import { Request, Response } from "express";
import { myDataBase } from "../db";
import { Post } from "../entity/Post";

interface MulterS3Request extends Request {
  file: Express.MulterS3.File;
}

export class PostsController {
  // 게시글 작성
  static createPosts = async (req: MulterS3Request, res: Response) => {
    const { title, body } = req.body;
    const { location } = req.file;

    const post = new Post();
    post.title = title;
    post.body = body;
    post.image = location;

    const result = await myDataBase.getRepository(Post).insert(post);
    return res.status(201).send(result);
  };

  // 게시글 가져오기
  static getPosts = async function (req: Request, res: Response) {
    const posts = await myDataBase.getRepository(Post).find({
      relations: ["comments"],
    });

    return res.status(200).send(posts);
  };

  // 게시글:id 가져오기
  static getPost = async function (req: Request, res: Response) {
    const post = await myDataBase.getRepository(Post).findOneBy({
      id: Number(req.params.id),
    });
    if (!post) {
      return res.status(404).send("해당 게시글이 없습니다.");
    }
    return res.status(200).send(post);
  };

  // 게시글 수정하기
  static updatePost = async function (req: Request, res: Response) {
    const result = await myDataBase
      .getRepository(Post)
      .update(Number(req.params.id), req.body);
    return res.status(201).send(result);
  };

  static deletePost = async function (req: Request, res: Response) {
    const result = await myDataBase
      .getRepository(Post)
      .delete(Number(req.params.id));
    return res.status(204).send(result);
  };
}
