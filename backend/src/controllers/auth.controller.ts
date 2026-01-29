import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

const authService = new AuthService();

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array()[0].msg, 400);
    }

    const result = await authService.register(req.body);
    sendSuccess(res, result, 'Registration successful', 201);
  } catch (error: any) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array()[0].msg, 400);
    }

    const result = await authService.login(req.body);
    sendSuccess(res, result, 'Login successful');
  } catch (error: any) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, 'Refresh token is required', 400);
    }

    const result = await authService.refreshAccessToken(refreshToken);
    sendSuccess(res, result);
  } catch (error: any) {
    next(error);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    await authService.logout(req.user.userId);
    sendSuccess(res, null, 'Logout successful');
  } catch (error: any) {
    next(error);
  }
};
