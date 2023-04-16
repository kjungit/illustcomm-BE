import { Router } from "express";
import { CommentController } from "../controller/CommentController";

const routes = Router();

routes.post("/", CommentController.createComment);
routes.get("/", CommentController.getComments);
routes.put("/:id", CommentController.putComment);

export default routes;
