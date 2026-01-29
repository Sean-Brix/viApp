import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, getTokenExpirationDate } from '../utils/jwt';
import { AppError } from '../utils/response';

const prisma = new PrismaClient();

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'STUDENT';
  firstName: string;
  lastName: string;
  birthdate?: Date;
  gender?: 'MALE' | 'FEMALE';
  gradeLevel?: string;
  section?: string;
  position?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    studentId?: string;
    adminId?: string;
  };
}

export class AuthService {
  async register(data: RegisterData): Promise<AuthTokens> {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: data.username },
          { email: data.email },
        ],
      },
    });

    if (existingUser) {
      throw new AppError('Username or email already exists', 400);
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user with related student/admin record
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash,
        role: data.role,
        ...(data.role === 'STUDENT' && {
          student: {
            create: {
              firstName: data.firstName,
              lastName: data.lastName,
              birthdate: data.birthdate || new Date(),
              gender: data.gender || 'MALE',
              gradeLevel: data.gradeLevel || '',
              section: data.section,
            },
          },
        }),
        ...(data.role === 'ADMIN' && {
          admin: {
            create: {
              firstName: data.firstName,
              lastName: data.lastName,
              position: data.position,
            },
          },
        }),
      },
      include: {
        student: true,
        admin: true,
      },
    });

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      role: user.role,
      email: user.email,
    };

    const accessToken = await generateAccessToken(tokenPayload);
    const refreshToken = await generateRefreshToken(tokenPayload);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getTokenExpirationDate(),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        studentId: user.student?.id,
        adminId: user.admin?.id,
      },
    };
  }

  async login(data: LoginData): Promise<AuthTokens> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { username: data.username },
      include: {
        student: true,
        admin: true,
      },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403);
    }

    // Verify password
    const isPasswordValid = await comparePassword(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      role: user.role,
      email: user.email,
    };

    const accessToken = await generateAccessToken(tokenPayload);
    const refreshToken = await generateRefreshToken(tokenPayload);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getTokenExpirationDate(),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        studentId: user.student?.id,
        adminId: user.admin?.id,
      },
    };
  }

  async refreshAccessToken(token: string): Promise<{ accessToken: string }> {
    // Verify refresh token
    const decoded = await verifyRefreshToken(token);

    // Check if token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Generate new access token
    const tokenPayload = {
      userId: storedToken.user.id,
      role: storedToken.user.role,
      email: storedToken.user.email,
    };

    const accessToken = await generateAccessToken(tokenPayload);

    return { accessToken };
  }

  async logout(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}
