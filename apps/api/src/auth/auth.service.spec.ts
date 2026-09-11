import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as argon from 'argon2';

jest.mock('argon2', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
}));

jest.mock('../database/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const prisma = {
    client: {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    },
  };

  const jwtService = {
    sign: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const configService = {
    getOrThrow: jest.fn((key: string) => `${key}-value`),
    get: jest.fn((_key: string, fallback: string) => fallback),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new AuthService(
      prisma as any,
      jwtService as any,
      configService as any,
    );
  });

  describe('register', () => {
    it('hashes the password before saving the user', async () => {
      prisma.client.user.create.mockResolvedValue(null);

      prisma.client.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
      });

      jest.mocked(argon.hash).mockResolvedValue('hashed-password');

      const result = await service.register({
        email: 'test@example.com',
        name: 'Test User',
        password: 'plain-password',
      });

      expect(argon.hash).toHaveBeenCalledWith('plain-password');

      expect(prisma.client.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'test@example.com',
            name: 'Test User',
            password: 'hashed-password',
          }),
        }),
      );

      expect(result).not.toHaveProperty('password');
    });

    it('throws ConflictException when email already exists', async () => {
      prisma.client.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
      });

      await expect(
        service.register({
          email: 'test@example.com',
          name: 'Test User',
          password: 'plain-password',
        }),
      ).rejects.toThrow(ConflictException);

      expect(prisma.client.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('return a JWT for valid credentials', async () => {
      prisma.client.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed-password',
      });

      jest.mocked(argon.verify).mockResolvedValue(true);

      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login({
        email: 'test@example.com',
        password: 'plain-password',
      });

      expect(argon.verify).toHaveBeenCalledWith(
        'hashed-password',
        'plain-password',
      );

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'user-1',
          email: 'test@example.com',
          type: 'access',
        }),
      );
      expect(result).toEqual({
        accessToken: 'jwt-token',
        refreshToken: 'jwt-token',
      });
    });

    it('rejects invalid credentials', async () => {
      prisma.client.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed-password',
      });

      jest.mocked(argon.verify).mockResolvedValue(false);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});
