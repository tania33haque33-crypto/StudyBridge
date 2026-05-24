import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import authService from '@/services/authService';

const useAuth = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, setAuth, logout: storeLogout } = useAuthStore();

  useEffect(() => {
    // Check if token is valid on mount
    if (token && !user) {
      authService
        .getCurrentUser()
        .then((response) => {
          setAuth(response.data, token, null);
        })
        .catch(() => {
          storeLogout();
          navigate('/login');
        });
    }
  }, [token, user, setAuth, storeLogout, navigate]);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.require2FA) {
        return { require2FA: true, tempToken: response.tempToken };
      }
      setAuth(response.data.user, response.data.token, response.data.refreshToken);
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      setAuth(response.data.user, response.data.token, response.data.refreshToken);
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      storeLogout();
      navigate('/login');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      setAuth({ ...user, ...response.data }, token, null);
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin' || user?.role === 'moderator';
  };

  const isStudent = () => {
    return user?.role === 'student';
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    isAdmin,
    isStudent,
  };
};

export default useAuth;