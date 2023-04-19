import { Router } from "express";
import { PostsController } from "../controller/PostsController";
import { upload } from "../middleware/uploadS3";
import { AuthMiddleware } from "../middleware/AuthMiddleware";

const routes = Router();

routes.get("/", PostsController.getPosts);
routes.get("/:id", PostsController.getPost);
routes.post(
  "/",
  upload.single("image"),
  AuthMiddleware.verifyToken,
  PostsController.createPosts
);
routes.put(
  "/:id",
  upload.single("image"),
  AuthMiddleware.verifyToken,
  PostsController.updatePost
);
routes.delete("/:id", AuthMiddleware.verifyToken, PostsController.deletePost);
routes.post("/like/:id", AuthMiddleware.verifyToken, PostsController.likePost);

export default routes;
