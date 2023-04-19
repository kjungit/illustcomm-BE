import { Router } from "express";
import { SourceController } from "../controller/SourceController";
import { upload } from "../middleware/uploadS3";

const routes = Router();

routes.post("/main", upload.single("image"), SourceController.createMainBanner);
routes.post(
  "/event",
  upload.single("image"),
  SourceController.createEventBanner
);
routes.post(
  "/artlab",
  upload.single("image"),
  SourceController.createArtLabBanner
);
routes.post(
  "/collaboration",
  upload.single("image"),
  SourceController.createCollaboration
);
routes.get("/main", SourceController.getMainBanner);
routes.get("/event", SourceController.getEventBanner);
routes.get("/artlab", SourceController.getArtLabBanner);
routes.get("/collaboration", SourceController.getCollaboration);

routes.delete("/main/:id", SourceController.deleteMainBanner);
routes.delete("/event/:id", SourceController.deleteEventBanner);
routes.delete("/artlab/:id", SourceController.deleteArtLabBanner);
routes.delete("/collaboration/:id", SourceController.deleteCollaboration);

export default routes;
