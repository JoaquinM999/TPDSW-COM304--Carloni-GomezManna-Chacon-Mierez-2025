// src/Servicios/authService.ts

export const saveTokens = (token: string, refreshToken: string) => {
  localStorage.setItem('accessToken', token);
  localStorage.setItem('refreshToken', refreshToken);
};

export const getAccessToken = () => localStorage.getItem('accessToken');

export const getNewAccessToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    throw new Error('No refresh token disponible');
  }

  const response = await fetch('http://localhost:3000/api/auth/refresh-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await response.json();
  if (response.ok) {
    localStorage.setItem('accessToken', data.token); // 👈 el backend devuelve "token"
    return data.token;
  } else {
    throw new Error('No se pudo refrescar el token');
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
