import { verify } from "jsonwebtoken";
import * as dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import { tokenList } from "../app";

dotenv.config();

export interface TokenPayload {
  // token decode 하면 무엇이 들어가 있는지 작성
  email: string;
  username: string;
  id: number;
}

export interface JwtRequest extends Request {
  // payload 를 포함한 request 타입을 생성
  decoded?: TokenPayload;
}

export class AuthMiddleware {
  static verifyToken = (req: JwtRequest, res: Response, next: NextFunction) => {
    //  토큰이 있는지 확인
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    //  토큰이 없으면 403
    if (!token) {
      return res.status(403).send("토큰이 없습니다.");
    }
    try {
      const decoded = verify(token, process.env.SECRET_ATOKEN) as TokenPayload;
      // 타입 표명 (보통은 사용하지 않는 것이 좋지만, verify 함수 자체를 수정할 수 없고, 개발자가 타입을 더 정확히 알고 있으므로 사용)
      req.decoded = decoded;
    } catch (err) {
      return res.status(401).send("토큰이 유효하지 않습니다.");
    }
    return next(); // 다음 로직으로 넘어가라는 뜻
  };
  static verifyRefreshToken = (
    req: JwtRequest,
    res: Response,
    next: NextFunction
  ) => {
    const cookies = req.cookies;
    if (!cookies.refreshToken) {
      // 쿠키에 리프레시 토큰이 없다면 에러
      return res.status(403).json({ error: "No Refresh Token" });
    }

    if (!(cookies.refreshToken in tokenList)) {
      // 우리가 발급한게 아니라면 에러
      return res.status(401).json({ error: "Invalid Refresh Token" });
    }
    try {
      // 기존 리프레시 토큰 복호화
      const decoded = verify(
        cookies.refreshToken,
        process.env.SECRET_RTOKEN
      ) as TokenPayload;
      req.decoded = decoded;
    } catch (err) {
      // 복호화가 제대로 안된다면 에러
      return res.status(401).send("Invalid Refresh Token");
    }
    return next();
  };
}
