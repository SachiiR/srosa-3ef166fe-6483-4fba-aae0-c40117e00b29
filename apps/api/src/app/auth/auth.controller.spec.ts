import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { UnauthorizedException } from '@nestjs/common';

const mockAuthService = {
  login: jest.fn()
};

const mockUserService = {
  create: jest.fn()
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService }
      ]
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => jest.clearAllMocks());

  // --- login ---
  describe('login', () => {
    it('should return a token on successful login', async () => {
      mockAuthService.login.mockResolvedValue({ token: 'mock.jwt.token' });

      const result = await controller.login({ email: 'admin@test.com', password: 'password123' });

      expect(result).toEqual({ token: 'mock.jwt.token' });
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'admin@test.com',
        password: 'password123'
      });
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      mockAuthService.login.mockRejectedValue(new UnauthorizedException());

      await expect(
        controller.login({ email: 'wrong@test.com', password: 'wrongpassword' })
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // --- register ---
  describe('register', () => {
    it('should create a viewer user and return success message', async () => {
      mockUserService.create.mockResolvedValue(undefined);

      const result = await controller.register({
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123'
      });

      expect(result).toEqual({ message: 'success' });
      expect(mockUserService.create).toHaveBeenCalledWith(
        'testuser',
        'password123',
        'Viewer',  // always registered as Viewer
        2,         // default orgId
        'test@test.com'
      );
    });

    it('should always register user as Viewer role', async () => {
      mockUserService.create.mockResolvedValue(undefined);

      await controller.register({
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123'
      });

      expect(mockUserService.create).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        'Viewer',  // role is hardcoded to Viewer
        expect.anything(),
        expect.anything()
      );
    });
  });
});