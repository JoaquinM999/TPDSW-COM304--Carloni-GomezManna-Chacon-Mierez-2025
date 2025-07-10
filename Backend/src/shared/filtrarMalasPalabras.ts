// src/shared/filtrarMalasPalabras.ts
import axios from 'axios';

export const contieneMalasPalabras = async (texto: string): Promise<boolean> => {
  const userId = process.env.NEUTRINO_USER_ID!;
  const apiKey = process.env.NEUTRINO_API_KEY!;

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
      }
    );

    // response.data es tipo: { 'is-bad': boolean, 'censored-content': string, ... }
    return response.data['is-bad'];
  } catch (error) {
    console.error('Error al verificar malas palabras:', error);
    // Si falla la verificación, preferimos no bloquear el flujo y asumir que no tiene malas palabras.
    return false;
  }
};
