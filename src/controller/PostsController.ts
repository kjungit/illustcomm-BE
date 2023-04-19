import { Request, Response } from "express";
import { myDataBase } from "../db";
import { Post } from "../entity/Post";
import { JwtRequest } from "../middleware/AuthMiddleware";
import { User } from "../entity/User";
import { Like } from "../entity/Like";

interface MulterS3Request extends Request {
  file: Express.MulterS3.File;
}

export class PostsController {
  // 게시글 작성
  static createPosts = async (
    req: JwtRequest & MulterS3Request,
    res: Response
  ) => {
    const { id: userId } = req.decoded;

    // db에 게시글 작성자가 존재하는지 확인
    const user = await myDataBase.getRepository(User).findOneBy({
      id: userId,
    });
    const { title, body } = req.body;
    const { location } = req.file;

    const post = new Post();
    post.title = title;
    post.body = body;
    post.image = location;
    post.author = user;

    const result = await myDataBase.getRepository(Post).insert(post);
    return res.status(201).send(result);
  };

  // 게시글 가져오기
  static getPosts = async function (req: Request, res: Response) {
    const posts = await myDataBase.getRepository(Post).find({
      relations: ["author", "likes", "likes.user", "comments"],
      select: {
        author: {
          id: true,
          email: true,
          username: true,
        },
        comments: {
          id: true,
          body: true,
          createdAt: true,
          author: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        likes: {
          id: true,
          user: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
      },
    });
    return res.status(200).send(posts);
  };

  // 게시글:id 가져오기
  static getPost = async function (req: Request, res: Response) {
    const post = await myDataBase.getRepository(Post).findOne({
      where: { id: Number(req.params.id) },
      relations: ["author", "comments", "comments.author", "likes"],
      select: {
        author: {
          id: true,
          username: true,
          profileImage: true,
        },
        comments: {
          id: true,
          body: true,
          createdAt: true,
          author: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        likes: {
          id: true,
          user: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
      },
    });
    if (!post) {
      return res.status(404).send("해당 게시글이 없습니다.");
    }
    return res.status(200).send(post);
  };

  // 게시글 수정하기
  static updatePost = async function (
    req: JwtRequest & MulterS3Request,
    res: Response
  ) {
    const { id: userId } = req.decoded;

    const currentPost = await myDataBase.getRepository(Post).findOne({
      where: { id: Number(req.params.id) },
      relations: { author: true },
    });

    if (!currentPost) {
      return res.status(404).send({ message: "해당 게시글이 없습니다." });
    }

    if (userId !== currentPost.author.id) {
      return res
        .status(401)
        .send({ message: "해당 게시물을 수정할 권한이 없습니다." });
    }

    const { title, body } = req.body;
    const { location } = req.file;

    const post = new Post();
    post.title = title;
    post.body = body;
    post.image = location;

    const result = await myDataBase
      .getRepository(Post)
      .update(Number(req.params.id), post);

    return res.status(200).send(result);
  };

  // 게시글 삭제하기
  static deletePost = async function (req: JwtRequest, res: Response) {
    const { id: userId } = req.decoded;

    const currentPost = await myDataBase.getRepository(Post).findOne({
      where: { id: Number(req.params.id) },
      relations: { author: true },
    });
    if (userId !== currentPost.author.id) {
      return res.status(401).send("권한이 없습니다.");
    }

    const result = await myDataBase
      .getRepository(Post)
      .delete(Number(req.params.id));
    return res.status(204).send(result);
  };

  // 게시글 좋아요
  static likePost = async (req: JwtRequest, res: Response) => {
    const { id: userId } = req.decoded;
    // 좋아요를 누른적이 있는지 확인
    const isExist = await myDataBase.getRepository(Like).findOne({
      where: {
        posts: { id: Number(req.params.id) },
        user: { id: userId }, // {id: 유저아이디} 가 요청 시에 필요
      },
    });

    // 이미 좋아요를 누른게 아니라면
    if (!isExist) {
      // 해당 게시글, 유저를 토대로 Like 생성
      const post = await myDataBase.getRepository(Post).findOneBy({
        id: Number(req.params.id),
      });
      const user = await myDataBase.getRepository(User).findOneBy({
        id: userId,
      });

      const like = new Like();
      like.posts = post;
      like.user = user;
      await myDataBase.getRepository(Like).insert(like);
    } else {
      // 좋아요를 이미 누른 상황이라면 해당 좋아요 삭제
      await myDataBase.getRepository(Like).remove(isExist);
    }
    return res.send({ message: "success" });
  };
}
