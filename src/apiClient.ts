const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const apiClient = async <T>(input: RequestInfo | URL, init?: RequestInit) : Promise<T> => {
  const res = await fetch(`${BASE_URL}${input}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${input.toString()}`);
  }

  return (await res.json()) as T;
}

export { apiClient };