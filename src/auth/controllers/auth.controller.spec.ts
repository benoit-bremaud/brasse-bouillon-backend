/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';

import { ThrottlerGuard } from '@nestjs/throttler';
import { UserRole } from '../../common/enums/role.enum';
import { CreateUserDto } from '../../user/dtos/create-user.dto';
import { UpdateUserDto } from '../../user/dtos/update-user.dto';
import { User } from '../../user/entities/user.entity';
import { UserService } from '../../user/services/user.service';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { LoginDto } from '../dtos/login.dto';
import { AuthService } from '../services/auth.service';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let userService: UserService;

  const mockUser: User = Object.assign(new User(), {
    id: '550e8400-e29b-41d4-a716-446655440200',
    email: 'john@example.com',
    username: 'john_doe',
    password_hash: 'hashed-password',
    first_name: 'John',
    last_name: 'Doe',
    role: UserRole.USER,
    is_active: true,
    created_at: new Date('2026-01-31T10:00:00.000Z'),
    updated_at: new Date('2026-01-31T10:00:00.000Z'),
  });

  const authResponse: AuthResponseDto = {
    access_token: 'jwt-access-token',
    user: {
      id: mockUser.id,
      email: mockUser.email,
      username: mockUser.username,
      first_name: mockUser.first_name,
      last_name: mockUser.last_name,
      role: mockUser.role,
      is_active: mockUser.is_active,
      created_at: mockUser.created_at,
      updated_at: mockUser.updated_at,
    },
  };

  const genericForgotPasswordMessage =
    'If an account exists for this email, a reset link has been sent.';

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            requestPasswordReset: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            changePassword: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    });

    moduleBuilder.overrideGuard(ThrottlerGuard).useValue({
      canActivate: jest.fn().mockReturnValue(true),
    });

    const module: TestingModule = await moduleBuilder.compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login() - POST /auth/login', () => {
    it('should authenticate user and return token payload', async () => {
      const dto: LoginDto = {
        email: mockUser.email,
        password: 'SecurePassword123!',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(authResponse);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(authResponse);
    });
  });

  describe('register() - POST /auth/register', () => {
    it('should create user and then log in immediately', async () => {
      const dto: CreateUserDto = {
        email: mockUser.email,
        username: mockUser.username,
        password: 'SecurePassword123!',
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
      };

      jest.spyOn(userService, 'create').mockResolvedValue(mockUser);
      jest.spyOn(authService, 'login').mockResolvedValue(authResponse);

      const result = await controller.register(dto);

      expect(userService.create).toHaveBeenCalledWith(dto);
      expect(authService.login).toHaveBeenCalledWith({
        email: dto.email,
        password: dto.password,
      });
      expect(result).toEqual(authResponse);
    });
  });

  describe('forgotPassword() - POST /auth/forgot-password', () => {
    it('should call AuthService and return generic success message', async () => {
      const dto: ForgotPasswordDto = {
        email: mockUser.email,
      };

      jest.spyOn(authService, 'requestPasswordReset').mockResolvedValue({
        message: genericForgotPasswordMessage,
      });

      const result = await controller.forgotPassword(dto);

      expect(authService.requestPasswordReset).toHaveBeenCalledWith(dto.email);
      expect(result).toEqual({
        message: genericForgotPasswordMessage,
      });
    });
  });

  describe('getMe() - GET /auth/me', () => {
    it('should return the current user profile', async () => {
      jest.spyOn(userService, 'findById').mockResolvedValue(mockUser);

      const result = await controller.getMe(mockUser);

      expect(userService.findById).toHaveBeenCalledWith(mockUser.id);
      expect(result.id).toEqual(mockUser.id);
    });
  });

  describe('updateMe() - PATCH /auth/me', () => {
    it('should update and return the user profile', async () => {
      const updateDto: UpdateUserDto = { first_name: 'Jane' };
      const updatedUser = { ...mockUser, first_name: 'Jane' } as User;

      jest.spyOn(userService, 'update').mockResolvedValue(updatedUser);

      const result = await controller.updateMe(mockUser, updateDto);

      expect(userService.update).toHaveBeenCalledWith(mockUser.id, updateDto);
      expect(result.first_name).toEqual('Jane');
    });
  });

  describe('changePassword() - POST /auth/me/change-password', () => {
    it('should change password successfully', async () => {
      const changePwDto: ChangePasswordDto = {
        old_password: 'old',
        new_password: 'new',
      };

      jest.spyOn(userService, 'changePassword').mockResolvedValue(mockUser);

      const result = await controller.changePassword(mockUser, changePwDto);

      expect(userService.changePassword).toHaveBeenCalledWith(
        mockUser.id,
        'old',
        'new',
      );
      expect(result.message).toBeDefined();
    });
  });

  describe('deleteMe() - DELETE /auth/me', () => {
    it('should delete current user account', async () => {
      jest.spyOn(userService, 'delete').mockResolvedValue();

      const result = await controller.deleteMe(mockUser);

      expect(userService.delete).toHaveBeenCalledWith(mockUser.id);
      expect(result.message).toBeDefined();
    });
  });
});
