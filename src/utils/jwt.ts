import jwt from "jsonwebtoken";

export default {
  generateToken: (payload: object, secret: string, expiry: number) => {
    return jwt.sign(payload, secret, { expiresIn: expiry });
  },
  verifyToken: (token: string, secret: string) => {
    return jwt.verify(token, secret);
  },
};

// // utils/tokenManager.ts
// import jwt from 'jsonwebtoken';
// import config from '../config/config';

// const JWT_SECRET = config.TOKENS.ACCESS.SECRET;

// export const signToken = (payload: object, expiresIn = '1h') =>
//   jwt.sign(payload, JWT_SECRET, { expiresIn });

// export const verifyToken = (token: string) =>
//   jwt.verify(token, JWT_SECRET);
