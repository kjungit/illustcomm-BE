import { Request, Response } from "express";
import { Comment } from "../entity/Comment";
import { myDataBase } from "../db";
import { Post } from "../entity/Post";

export class CommentController {
  static createComment = async (req: Request, res: Response) => {
    const { postId, body } = req.body;
    const post = await myDataBase.getRepository(Post).findOneBy({
      id: Number(postId),
    });
    if (!post) {
      return res.status(404).send("해당 게시글이 없습니다.");
    }
    const comment = new Comment();
    comment.post = postId;
    comment.body = body;
    const result = await myDataBase.getRepository(Comment).insert(comment);
    return res.status(201).send(result);
  };

  static getComments = async (req: Request, res: Response) => {
    const comments = await myDataBase.getRepository(Comment).find();
    return res.status(200).send(comments);
  };

  static putComment = async (req: Request, res: Response) => {
    const { postId, body } = req.body;
    const post = await myDataBase.getRepository(Post).findOneBy({
      id: Number(postId),
    });
    if (!post) {
      return res.status(404).send("해당 게시글이 없습니다.");
    }
    const result = await myDataBase
      .getRepository(Comment)
      .update(Number(req.params.id), { body });
    return res.status(201).send(result);
  };
}
