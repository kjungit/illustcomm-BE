import { Router } from "express";
import { PostsController } from "../controller/PostsController";
import { upload } from "../middleware/uploadS3";

const routes = Router();

routes.get("/", PostsController.getPosts);
routes.post("/", upload.single("image"), PostsController.createPosts);
routes.get("/:id", PostsController.getPost);
routes.put("/:id", PostsController.updatePost);
routes.delete("/:id", PostsController.deletePost);

export default routes;
