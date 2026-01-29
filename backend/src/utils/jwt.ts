import jwt from 'jsonwebtoken';
import { promisify } from 'util';

const jwtSign = promisify(jwt.sign) as any;
const jwtVerify = promisify(jwt.verify) as any;

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: string;
  role: 'ADMIN' | 'STUDENT';
  email: string;
}

export const generateAccessToken = async (payload: TokenPayload): Promise<string> => {
  return await jwtSign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const generateRefreshToken = async (payload: TokenPayload): Promise<string> => {
  return await jwtSign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
};

export const verifyAccessToken = async (token: string): Promise<TokenPayload> => {
  try {
    return await jwtVerify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const verifyRefreshToken = async (token: string): Promise<TokenPayload> => {
  try {
    return await jwtVerify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

export const getTokenExpirationDate = (): Date => {
  const expiresIn = JWT_REFRESH_EXPIRES_IN;
  const match = expiresIn.match(/(\d+)([smhd])/);
  
  if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  
  return new Date(Date.now() + value * multipliers[unit]);
};
