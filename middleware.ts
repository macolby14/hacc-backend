/* eslint-disable import/prefer-default-export */
import { Request, Response, NextFunction } from 'express';

// EXPLAIN: Middleware for authorization on routes
export const authCheck = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({
      authenticated: false,
      message: 'user has not been authenticated',
    });
  } else {
    next();
  }
};
