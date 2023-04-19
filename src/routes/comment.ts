import { Router } from "express";
import { CommentController } from "../controller/CommentController";
import { AuthMiddleware } from "../middleware/AuthMiddleware";

const routes = Router();

routes.post(
  "/:id",
  AuthMiddleware.verifyToken,
  CommentController.createComment
);
routes.put("/:id", AuthMiddleware.verifyToken, CommentController.updateComment);
routes.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  CommentController.deleteComment
);

export default routes;
