import { Request, Response } from "express";
import { myDataBase } from "../db";
import { MainBanner } from "../entity/MainBanner";
import { EventBanner } from "../entity/EventBanner";
import { Collaboration } from "../entity/Collaboration";
import { ArtLabBanner } from "../entity/ArtLabBanner";

interface MulterS3Request extends Request {
  file: Express.MulterS3.File;
}

export class SourceController {
  static createBanner = async (
    req: MulterS3Request,
    res: Response,
    BannerClass: any
  ) => {
    const { title } = req.body;
    const { location } = req.file;
    const post = new BannerClass();
    post.title = title;
    post.image = location;

    const result = await myDataBase.getRepository(BannerClass).insert(post);
    return res.status(201).send(result);
  };

  static createMainBanner = async (req: MulterS3Request, res: Response) => {
    return await SourceController.createBanner(req, res, MainBanner);
  };

  static createEventBanner = async (req: MulterS3Request, res: Response) => {
    return await SourceController.createBanner(req, res, EventBanner);
  };

  static createArtLabBanner = async (req: MulterS3Request, res: Response) => {
    return await SourceController.createBanner(req, res, ArtLabBanner);
  };

  static createCollaboration = async (req: MulterS3Request, res: Response) => {
    return await SourceController.createBanner(req, res, Collaboration);
  };

  static getBanner = async (req: Request, res: Response, BannerClass: any) => {
    const result = await myDataBase.getRepository(BannerClass).find();
    return res.status(200).send(result);
  };

  static getMainBanner = async (req: Request, res: Response) => {
    return await SourceController.getBanner(req, res, MainBanner);
  };

  static getEventBanner = async (req: Request, res: Response) => {
    return await SourceController.getBanner(req, res, EventBanner);
  };

  static getArtLabBanner = async (req: Request, res: Response) => {
    return await SourceController.getBanner(req, res, ArtLabBanner);
  };

  static getCollaboration = async (req: Request, res: Response) => {
    return await SourceController.getBanner(req, res, Collaboration);
  };

  static deleteBanner = async (
    req: Request,
    res: Response,
    BannerClass: any
  ) => {
    const { id } = req.params;
    const result = await myDataBase.getRepository(BannerClass).delete(id);
    return res.status(200).send(result);
  };

  static deleteMainBanner = async (req: Request, res: Response) => {
    return await SourceController.deleteBanner(req, res, MainBanner);
  };

  static deleteEventBanner = async (req: Request, res: Response) => {
    return await SourceController.deleteBanner(req, res, EventBanner);
  };

  static deleteArtLabBanner = async (req: Request, res: Response) => {
    return await SourceController.deleteBanner(req, res, ArtLabBanner);
  };

  static deleteCollaboration = async (req: Request, res: Response) => {
    return await SourceController.deleteBanner(req, res, Collaboration);
  };
}
