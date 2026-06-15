import { authService } from './auth.service';
import { axiosInstance } from '@/lib/axios';

jest.mock('@/lib/axios', () => ({
  axiosInstance: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

describe('authService', () => {
  const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('maps a successful login response to AuthSession', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          user: {
            id: 'user-1',
            email: 'parent@example.com',
            role: 'PARENT',
          },
        },
      });

      const session = await authService.login({
        email: 'parent@example.com',
        password: 'password123',
        role: 'parent',
      });

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/login', {
        email: 'parent@example.com',
        password: 'password123',
      });
      expect(session.token).toBe('access-token');
      expect(session.user.role).toBe('parent');
    });

    it('throws a normalized error when login fails', async () => {
      mockedAxios.post.mockRejectedValue({
        message: 'Invalid credentials',
        code: 'UNAUTHORIZED',
        statusCode: 401,
      });

      await expect(
        authService.login({
          email: 'parent@example.com',
          password: 'wrong',
          role: 'parent',
        }),
      ).rejects.toMatchObject({
        message: 'Invalid credentials',
        code: 'UNAUTHORIZED',
        statusCode: 401,
      });
    });
  });

  describe('logout', () => {
    it('resolves without calling the API', async () => {
      await expect(authService.logout()).resolves.toBeUndefined();
      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });
  });
});
