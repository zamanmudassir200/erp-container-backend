import { NextFunction, Request, Response } from 'express';
import { Client } from '../APIs/client/models/clientModel';
import jwt from '../utils/jwt';
import httpError from '../handlers/errorHandler/httpError';
import responseMessage from '../constant/responseMessage';
import asyncHandler from '../handlers/async';
import config from '../config/config';
declare global {
  namespace Express {
    interface Request {
      authenticatedUser?: any;
    }
  }
}

export default asyncHandler(
  async (request: Request, _response: Response, next: NextFunction) => {
    try {
      const token: any = request.headers.token;
      // console.log("token hy yeh " + token);

      if (token) {
        const userId: any = jwt.verifyToken(token, config.TOKENS.ACCESS.SECRET);
        // console.log(userId);
        const user = await Client.findById(userId);
        // console.log("user", user);
        if (user) {
          request.authenticatedUser = user;
          return next();
        }
      }
      httpError(next, new Error(responseMessage.UNAUTHORIZED), request, 401);
    } catch (error) {
      httpError(next, error, request, 500);
    }
  }
);
