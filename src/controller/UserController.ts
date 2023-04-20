import * as bcrypt from "bcrypt";
import { Request, Response } from "express";
import { myDataBase } from "../db";
import { User } from "../entity/User";
import {
  generateAccessToken,
  generatePassword,
  generateRefreshToken,
  registerToken,
  removeToken,
} from "../util/Auth";
import { verify } from "jsonwebtoken";
import { JwtRequest } from "../middleware/AuthMiddleware";
import { Follow } from "../entity/Follow";

interface MulterS3Request extends Request {
  file: Express.MulterS3.File;
}

export class UserController {
  static emailDuplicateCheck = async (
    req: Request & MulterS3Request,
    res: Response
  ) => {
    const { email } = req.body;
    const exisuEmail = await myDataBase.getRepository(User).findOne({
      where: {
        email,
      },
    });

    // 이미 사용중인 이메일이면 400
    if (exisuEmail) {
      return res.status(400).send("이미 사용중인 이메일입니다.");
    }

    return res.status(200).send("사용 가능한 이메일입니다.");
  };

  static register = async (req: MulterS3Request, res: Response) => {
    const { email, username, password } = req.body;
    const { location } = req.file;
    const user = new User();
    user.email = email;
    user.username = username;
    user.password = await generatePassword(password);
    user.profileImage = location;

    const newUser = await myDataBase.getRepository(User).save(user);
    const accessToken = generateAccessToken(
      newUser.id,
      newUser.email,
      newUser.username
    );
    const refreshToken = generateRefreshToken(
      newUser.id,
      newUser.email,
      newUser.username
    );

    // 토큰 생성이 잘되었으면 -> registerToken 함수를 통해 토큰을 저장
    registerToken(refreshToken, accessToken);

    // 응답 > 어떤 유저인지 (엑세스토큰, 리프레시토큰)
    const decoded = verify(accessToken, process.env.SECRET_ATOKEN);
    res.cookie("refreshToken", refreshToken, {
      path: "/",
      httpOnly: true,
      maxAge: 3600 * 24 * 30 * 1000,
    });
    res.send({ content: decoded, accessToken });
  };

  static login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    // 이메일이 존재하는지 확인
    const user = await myDataBase.getRepository(User).findOne({
      where: {
        email,
      },
    });

    //  이메일이 존재하지 않으면 400
    if (!user) {
      return res.status(400).send("존재하지 않는 이메일입니다.");
    }

    // 비밀번호가 일치하는지 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);

    //  비밀번호가 일치하지 않으면 400
    if (!isPasswordValid) {
      return res.status(400).send("비밀번호가 일치하지 않습니다.");
    }

    const accessToken = generateAccessToken(user.id, user.email, user.username);
    const refreshToken = generateRefreshToken(
      user.id,
      user.email,
      user.username
    );

    registerToken(refreshToken, accessToken);

    const decoded = verify(accessToken, process.env.SECRET_ATOKEN);
    res.cookie("refreshToken", refreshToken, {
      path: "/",
      httpOnly: true,
      maxAge: 3600 * 24 * 30 * 1000,
    });
    res.send({ content: decoded, accessToken });
  };

  static logout = async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(400).send({ message: "로그인 상태가 아닙니다." });
    }
    removeToken(refreshToken);
    res.clearCookie("refreshToken");
    res.send({ message: "로그아웃 되었습니다." });
  };

  // 회원 탈퇴
  static withdrawel = async (req: JwtRequest, res: Response) => {
    // 해당 유저가 탈퇴 요청을 하는지 확인
    const { id: userId } = req.decoded;
    const { email, password } = req.body;
    const currentUser = await myDataBase.getRepository(User).findOne({
      where: { email },
    });
    const validPassword = await bcrypt.compare(password, currentUser.password);

    if (userId !== currentUser.id) {
      return res.status(401).send({ message: "접근 권한이 없습니다." });
    }
    if (email !== currentUser.email || !validPassword) {
      return res
        .status(400)
        .send({ message: "이메일 또는 비밀번호를 다시 확인하세요." });
    }
    await myDataBase.getRepository(User).remove(currentUser);
    res.send({ message: "탈퇴되었습니다." });
  };

  // 프로필 수정
  static updateProfile = async (
    req: JwtRequest & MulterS3Request,
    res: Response
  ) => {
    const { id: userId } = req.decoded;
    const currentUser = await myDataBase.getRepository(User).findOne({
      where: { id: Number(req.params.id) },
    });

    if (userId !== currentUser.id) {
      return res.status(401).send({ message: "접근 권한이 없습니다." });
    }

    const { username, password } = req.body;
    const { location } = req.file;
    const editedUser = new User();
    editedUser.profileImage = location;
    editedUser.username = username;
    editedUser.password = await generatePassword(password);
    const results = await myDataBase
      .getRepository(User)
      .update(userId, editedUser);
    res.status(200).send(results);
  };
  static getUsers = async (req: Request, res: Response) => {
    const users = await myDataBase.getRepository(User).find({
      select: ["id", "email", "username", "profileImage"],
    });
    return res.status(200).send(users);
  };

  static getUser = async (req: Request, res: Response) => {
    const user = await myDataBase.getRepository(User).findOne({
      where: { id: Number(req.params.id) },
      relations: ["followings", "followers"],
      select: {
        id: true,
        username: true,
        email: true,
        profileImage: true,
        followers: true,
        followings: true,
      },
    });
    return res.status(200).send(user);
  };

  static followUser = async (req: JwtRequest, res: Response) => {
    const { id: userId } = req.decoded;

    const follower = await myDataBase.getRepository(User).findOne({
      where: { id: Number(userId) },
    });

    if (!follower) {
      return res.status(400).send({ message: "존재하지 않는 유저입니다." });
    }

    const following = await myDataBase.getRepository(User).findOne({
      where: { id: Number(req.params.id) },
    });
    if (!following) {
      return res.status(400).send({ message: "존재하지 않는 유저입니다." });
    }
    // 이미 해당 유저를 팔로우하고 있는지 확인
    const isExist = await myDataBase.getRepository(Follow).findOne({
      where: {
        follower: {
          id: follower.id,
        },
        following: { id: following.id },
      },
    });

    if (isExist) {
      await myDataBase.getRepository(Follow).remove(isExist);
      return res.status(201).send({ message: "팔로우가 취소되었습니다." });
    }
    const newFollow = new Follow();
    newFollow.follower = follower;
    newFollow.following = following;

    const result = await myDataBase.getRepository(Follow).save(newFollow);
    return res.status(201).send({ message: "팔로우 되었습니다." });
  };

  static getFollowings = async (req: Request, res: Response) => {
    const { id: userId } = req.params;
    const user = await myDataBase.getRepository(User).findOne({
      where: { id: Number(userId) },
    });
    if (!user) {
      return res.status(400).send({ message: "존재하지 않는 유저입니다." });
    }
    const following = await myDataBase.getRepository(Follow).find({
      where: { follower: { id: Number(userId) } },
      relations: ["following"],
    });
    res.status(200).send({ following });
  };

  static getFollowers = async (req: Request, res: Response) => {
    const { id: userId } = req.params;
    const user = await myDataBase.getRepository(User).findOne({
      where: { id: Number(userId) },
      relations: ["followers"],
    });
    if (!user) {
      return res.status(400).send({ message: "존재하지 않는 유저입니다." });
    }

    const follower = await myDataBase.getRepository(Follow).find({
      where: { following: { id: Number(userId) } },
      relations: ["follower"],
    });
    res.status(200).send({ follower });
  };

  static refresh = async (req: JwtRequest, res: Response) => {
    const { id, username, email } = req.decoded;
    // 기존에 발급한 토큰은 메모리에서 삭제
    removeToken(req.cookies.refreshToken);
    // 액세스 토큰 및 리프레시 토큰 새롭게 발급
    const accessToken = generateAccessToken(id, username, email);
    const refreshToken = generateRefreshToken(id, username, email);
    // 새롭게 발급한 토큰 저장
    registerToken(refreshToken, accessToken);
    // 토큰을 복호화해서, 담겨있는 유저 정보 및 토큰 만료 정보도 함께 넘겨줌
    const decoded = verify(accessToken, process.env.SECRET_ATOKEN);

    res.cookie("refreshToken", refreshToken, {
      path: "/",
      httpOnly: true,
      maxAge: 3600 * 24 * 30 * 1000,
    });
    res.send({ content: decoded, accessToken });
  };
}
