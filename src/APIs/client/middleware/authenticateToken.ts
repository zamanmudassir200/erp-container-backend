// // middleware/authMiddleware.ts
// import jwt from "jsonwebtoken";
// import config from "../../../config/config";
// import { Request, Response, NextFunction } from "express";

// const JWT_SECRET = config.TOKENS.ACCESS.SECRET;

// export const authenticateToken = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const token = req.header("Authorization")?.replace("Bearer ", "");

//   if (!token) {
//     return res.status(401).json({ error: "Access denied. No token provided." });
//   }

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET || "secretKey");
//     req.user = decoded; // Attach decoded user info to the request object
//     next();
//   } catch (err) {
//     res.status(400).json({ error: "Invalid token." });
//   }
// };
