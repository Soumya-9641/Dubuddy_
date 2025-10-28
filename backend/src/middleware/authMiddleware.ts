import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = "your_secret_key";

export interface AuthenticatedRequest extends Request {
  user?: { id: number; username: string; role: string };
}

export const verifyToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ message: "Invalid token" });
  }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(403).json({ message: "Unauthorized" });
    if (!allowedRoles.includes(req.user.role))
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    next();
  };
};
