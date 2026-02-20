import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

const mockUser = {
  id: 1,
  email: 'admin@test.com',
  password: 'hashedpassword',
  role: 'Admin',
  organization: { id: 1 }
};

const mockUserService = {
  findByUsername: jest.fn()
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock.jwt.token')
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService }
      ]
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  // --- validateUser ---
  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      mockUserService.findByUsername.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.validateUser('admin@test.com', 'password123');

      expect(result).toBeDefined();
      expect(result.password).toBeUndefined(); // password stripped
      expect(result.email).toBe('admin@test.com');
    });

    it('should return null if password is wrong', async () => {
      mockUserService.findByUsername.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const result = await service.validateUser('admin@test.com', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should return null if user does not exist', async () => {
      mockUserService.findByUsername.mockResolvedValue(null);

      const result = await service.validateUser('nobody@test.com', 'password123');

      expect(result).toBeNull();
    });
  });

  // --- login ---
  describe('login', () => {
    it('should return a JWT token on successful login', async () => {
      mockUserService.findByUsername.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.login({ email: 'admin@test.com', password: 'password123' });

      expect(result).toEqual({ token: 'mock.jwt.token' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        role: mockUser.role,
        orgId: mockUser.organization.id
      });
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      mockUserService.findByUsername.mockResolvedValue(null);

      await expect(
        service.login({ email: 'wrong@test.com', password: 'wrongpassword' })
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});