import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { tokenList } from "../app";

// 비밀번호를 암호화하는 함수
export const generatePassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10); // 10자리의 salt를 생성
  const passwordHash = await bcrypt.hash(password, salt);
  return passwordHash;
};

//  userPayload를 기반으로 엑세스 토큰 생성을 위한 함수
export const generateAccessToken = (
  id: number,
  email: string,
  username: string
) => {
  return jwt.sign(
    {
      id,
      email,
      username,
    }, // 토큰의 내용(payload)
    process.env.SECRET_ATOKEN, // 비밀 키
    {
      expiresIn: "1h",
    } // 유효 시간은 1시간
  );
};

// 리프레시 토큰 생성을 위한 함수
export const generateRefreshToken = (
  id: number,
  email: string,
  username: string
) => {
  return jwt.sign(
    {
      id,
      email,
      username,
    }, // 토큰의 내용(payload)
    process.env.SECRET_RTOKEN, // 비밀 키
    {
      expiresIn: "30d",
    } // 유효 시간은 30일
  );
};
// 발급한 토큰을 tokenList에 등록하는 함수
export const registerToken = (refreshToken: string, accessToken: string) => {
  tokenList[refreshToken] = {
    accessToken,
    refreshToken,
  };
};

// 리프레시 혹은 로그아웃된다면 해당 토큰을 tokenList에서 삭제하는 함수
export const removeToken = (refreshToken: string) => {
  delete tokenList[refreshToken];
};
