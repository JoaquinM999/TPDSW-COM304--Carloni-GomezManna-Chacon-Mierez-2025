// src/shared/filtrarMalasPalabras.ts
import axios from 'axios';

export const contieneMalasPalabras = async (texto: string): Promise<boolean> => {
  const userId = process.env.NEUTRINO_USER_ID;
  const apiKey = process.env.NEUTRINO_API_KEY;

  // Si no hay credenciales configuradas, saltar verificación silenciosamente
  if (!userId || !apiKey) {
    // Solo mostrar advertencia en desarrollo, no en tests
    if (process.env.NODE_ENV !== 'test') {
      console.warn('⚠️ Credenciales de NeutrinoAPI no configuradas. Saltando verificación de malas palabras.');
    }
    return false;
  }

  try {
    const response = await axios.post(
      'https://neutrinoapi.net/bad-word-filter',
      new URLSearchParams({
        content: texto,
        'censor-character': '*', // opcional, pero requerido por la API
      }),
      {
        auth: {
          username: userId,
          password: apiKey,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 5000, // 5 segundos timeout
      }
    );

    // response.data es tipo: { 'is-bad': boolean, 'censored-content': string, ... }
    return response.data['is-bad'];
  } catch (error: any) {
    // Solo loguear errores en desarrollo, no en tests
    if (process.env.NODE_ENV !== 'test') {
      if (error.response?.status === 403) {
        console.warn('⚠️ NeutrinoAPI: Credenciales inválidas o límite de API excedido');
      } else if (error.code === 'ECONNABORTED') {
        console.warn('⚠️ NeutrinoAPI: Timeout de conexión');
      } else {
        console.warn('⚠️ NeutrinoAPI: Error de conexión, saltando verificación');
      }
    }
    // Si falla la verificación, preferimos no bloquear el flujo y asumir que no tiene malas palabras.
    return false;
  }
};
