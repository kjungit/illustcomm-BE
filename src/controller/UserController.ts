import * as bcrypt from "bcrypt";
import { Request, Response } from "express";
import { myDataBase } from "../db";
import { User } from "../entity/User";
import {
  generateAccessToken,
  generatePassword,
  generateRefreshToken,
  registerToken,
} from "../util/Auth";
import { verify } from "jsonwebtoken";

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

  static getUsers = async (req: Request, res: Response) => {
    const users = await myDataBase.getRepository(User).find();
    return res.status(200).send(users);
  };
}
