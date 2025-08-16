// src/services/hardcoverService.ts
import fetch from 'node-fetch';

const HARDCOVER_API = 'https://api.hardcover.app/v1/graphql';
const TOKEN = process.env.HARDCOVER_TOKEN as string;

export interface HardcoverEditionImage {
  id: number;
  image: { url: string | null } | null;
}

export interface HardcoverBook {
  id: number;
  title: string;
  slug: string;
  activities_count: number;
  editions: HardcoverEditionImage[];
}

interface HardcoverResponse {
  data?: { books: HardcoverBook[] };
  errors?: Array<{ message: string }>;
}

export async function getTrendingBooks(): Promise<HardcoverBook[]> {
  if (!TOKEN) {
    throw new Error(
      'HARDCOVER_TOKEN no definido. Agregá HARDCOVER_TOKEN=<tu_token> en .env'
    );
  }

  const query = `
    query {
      books(order_by: { activities_count: desc }, limit: 10) {
        id
        title
        slug
        activities_count
        editions(limit: 1) {
          id
          image {
            url
          }
        }
      }
    }
  `;

  const res = await fetch(HARDCOVER_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${TOKEN}`,  // 🔹 formato correcto
    },
    body: JSON.stringify({ query }),
  });

  let json: HardcoverResponse;
  try {
    json = (await res.json()) as HardcoverResponse;
  } catch (err) {
    throw new Error(`No se pudo parsear la respuesta de Hardcover: ${err}`);
  }

  // GraphQL puede devolver 200 pero con "errors"
  if (!res.ok || json.errors) {
    console.error('Hardcover API error:', json.errors || res.statusText);
    const msg =
      json?.errors?.map((e) => e.message).join(' | ') ||
      `${res.status} ${res.statusText}`;
    throw new Error(`Hardcover GraphQL error: ${msg}`);
  }

  return json.data!.books;
}
