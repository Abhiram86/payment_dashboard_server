import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);
        req.user = decodedToken as { id: number };
        return next();
      } catch (error) {
        console.error(error);
        return res.status(401).json({ message: 'Unauthorized' });
      }
    }
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
