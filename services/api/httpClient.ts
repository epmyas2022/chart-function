/**
 * Define la interfaz base para clientes HTTP.
 * Esto permite inyección de dependencias y facilita pruebas (mocks).
 */
export interface HttpClient {
  post<T>(url: string, body: unknown, headers?: Record<string, string>): Promise<T>;
}

/**
 * Implementación concreta usando la API Fetch nativa.
 */
export class FetchHttpClient implements HttpClient {
  async post<T>(url: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return response.json() as Promise<T>;
  }
}
