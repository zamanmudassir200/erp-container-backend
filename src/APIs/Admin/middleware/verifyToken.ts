import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface DecodedToken extends JwtPayload {
  userId: string;
}

// Extend the Request type within the function scope
export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ success: false, message: 'Unauthorized - no token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as DecodedToken;

    if (!decoded || !decoded.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized - invalid token' });
      return;
    }

    // Cast req to a more specific type that includes userId
    (req as Request & { userId?: string }).userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Error in verifyToken', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
