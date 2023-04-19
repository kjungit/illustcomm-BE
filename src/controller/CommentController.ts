import { Response } from "express";
import { Comment } from "../entity/Comment";
import { myDataBase } from "../db";
import { Post } from "../entity/Post";
import { JwtRequest } from "../middleware/AuthMiddleware";
import { User } from "../entity/User";

export class CommentController {
  static createComment = async (req: JwtRequest, res: Response) => {
    const { id: userId } = req.decoded;
    const author = await myDataBase.getRepository(User).findOne({
      where: { id: userId },
      relations: {
        posts: true,
      },
    });
    if (!author) {
      return res.status(404).send({ message: "해당 유저를 찾을 수 없습니다." });
    }
    const post = await myDataBase.getRepository(Post).findOne({
      where: { id: Number(req.params.id) },
    });
    if (!post) {
      return res
        .status(404)
        .send({ message: "해당 게시물을 찾을 수 없습니다." });
    }
    const { body } = req.body;
    const comment = new Comment();
    comment.body = body;
    comment.author = author;
    comment.post = post;

    const result = await myDataBase.getRepository(Comment).insert(comment);
    res.status(201).send(result);
  };

  static updateComment = async (req: JwtRequest, res: Response) => {
    const { id: userId } = req.decoded;

    const currentComment = await myDataBase.getRepository(Comment).findOne({
      where: { id: Number(req.params.id) },
      relations: { author: true },
    });

    if (!currentComment) {
      return res.status(404).send({ message: "해당 댓글을 찾을 수 없습니다." });
    }

    if (currentComment.author.id !== userId) {
      return res
        .status(401)
        .send({ message: "해당 댓글을 수정할 권한이 없습니다." });
    }
    const { body } = req.body;
    const newComment = new Comment();
    newComment.body = body;

    const results = await myDataBase
      .getRepository(Comment)
      .update(Number(req.params.id), newComment);
    return res.status(200).send(results);
  };

  static deleteComment = async (req: JwtRequest, res: Response) => {
    const { id: userId } = req.decoded;

    const currentComment = await myDataBase.getRepository(Comment).findOne({
      where: { id: Number(req.params.id) },
      relations: { author: true },
    });

    if (!currentComment) {
      return res.status(404).send({ message: "해당 댓글을 찾을 수 없습니다." });
    }

    if (currentComment.author.id !== userId) {
      return res
        .status(401)
        .send({ message: "해당 댓글을 삭제할 권한이 없습니다." });
    }

    const results = await myDataBase
      .getRepository(Comment)
      .delete(Number(req.params.id));
    return res.status(200).send(results);
  };
}
