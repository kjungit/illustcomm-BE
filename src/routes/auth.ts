import { Router } from "express";
import { UserController } from "../controller/UserController";
import { upload } from "../middleware/uploadS3";
import { AuthMiddleware } from "../middleware/AuthMiddleware";

const routes = Router();

routes.post(
  "/register",
  upload.single("profileImage"),
  UserController.register
);
routes.post("/login", UserController.login);
routes.post("/logout", AuthMiddleware.verifyToken, UserController.logout);
routes.post(
  "/withdrawel",
  AuthMiddleware.verifyToken,
  UserController.withdrawel
);
routes.post("/emailDuplicateCheck", UserController.emailDuplicateCheck);
routes.put(
  "/updateProfile/:id",
  upload.single("profileImage"),
  AuthMiddleware.verifyToken,
  UserController.updateProfile
);
routes.get("/users", UserController.getUsers);
routes.get("/users/:id", UserController.getUser);
routes.post(
  "/follow/:id",
  AuthMiddleware.verifyToken,
  UserController.followUser
);
routes.get("/followers/:id", UserController.getFollowers);
routes.get("/followings/:id", UserController.getFollowings);
routes.get(
  "/refresh",
  AuthMiddleware.verifyRefreshToken,
  UserController.refresh
);
export default routes;
