// src/Servicios/authService.ts

export const saveTokens = (token: string, refreshToken?: string) => {
  localStorage.setItem('accessToken', token);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
};

export const getAccessToken = () => localStorage.getItem('accessToken');

export const getNewAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available, please login again');
  }

  const response = await fetch('http://localhost:3000/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await response.json();

  if (response.ok) {
    const newToken = data.token;
    // Update the stored access token
    localStorage.setItem('accessToken', newToken);
    return newToken;
  } else {
    throw new Error(data.error || 'Failed to refresh token');
  }
};

export const login = async (email: string, password: string): Promise<void> => {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (response.ok) {
    saveTokens(data.token, data.refreshToken);
  } else {
    throw new Error(data.error || 'Error al iniciar sesión');
  }
};

export const register = async (username: string, email: string, password: string): Promise<void> => {
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await response.json();

  if (response.ok) {
    saveTokens(data.token, data.refreshToken);
  } else {
    throw new Error(data.error || 'Error al registrarse');
  }
};

export const getToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

export const removeTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const logoutUser = (): void => {
  removeTokens();
  // acá podrías agregar redirección u otras limpiezas si querés
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const updateCurrentUser = async (data: any): Promise<void> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch('http://localhost:3000/api/usuarios/me', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Error updating user profile');
  }
};

export const checkUserExists = async (username?: string, email?: string): Promise<{ usernameExists?: boolean; emailExists?: boolean }> => {
  const response = await fetch('http://localhost:3000/api/usuarios/check-exists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email }),
  });

  const data = await response.json();

  if (response.ok) {
    return data;
  } else {
    throw new Error(data.error || 'Error checking user existence');
  }
};

// Axios interceptor for automatic token refresh
export const setupAxiosInterceptors = (axiosInstance: any) => {
  axiosInstance.interceptors.request.use(
    (config: any) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response: any) => {
      return response;
    },
    async (error: any) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const newToken = await getNewAccessToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // If refresh fails, logout user
          logoutUser();
          window.location.href = '/LoginPage';
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};
