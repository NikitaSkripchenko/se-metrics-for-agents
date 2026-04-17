import type { QueryShape } from "./types.js";

export type ApiResponse<T = unknown> = {
  status: number;
  text: string;
  body: T | undefined;
  headers: Headers;
};

type RequestOptions = {
  body?: unknown;
  rawBody?: string;
  query?: QueryShape;
  headers?: Record<string, string>;
};

export class ApiClient {
  constructor(readonly baseUrl: string) {}

  get<T>(path: string, query?: QueryShape): Promise<ApiResponse<T>> {
    return this.request<T>("GET", path, { query });
  }

  post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>("POST", path, { body });
  }

  patch<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>("PATCH", path, { body });
  }

  delete<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>("DELETE", path);
  }

  malformedJson<T>(path: string, rawBody = "{"): Promise<ApiResponse<T>> {
    return this.request<T>("POST", path, {
      rawBody,
      headers: {
        "content-type": "application/json"
      }
    });
  }

  private async request<T>(
    method: string,
    path: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = new URL(path, this.baseUrl);

    if (options.query !== undefined) {
      for (const [key, value] of Object.entries(options.query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const headers = new Headers(options.headers);
    let body: string | undefined;

    if (options.rawBody !== undefined) {
      body = options.rawBody;
    } else if (options.body !== undefined) {
      headers.set("content-type", "application/json");
      body = JSON.stringify(options.body);
    }

    const response = await fetch(url, {
      method,
      headers,
      body,
      signal: AbortSignal.timeout(5_000)
    });

    const text = await response.text();
    const json = parseJson(text, response.headers.get("content-type"));

    return {
      status: response.status,
      text,
      body: json as T | undefined,
      headers: response.headers
    };
  }
}

function parseJson(text: string, contentType: string | null): unknown {
  if (text.length === 0) {
    return undefined;
  }

  if (contentType === null || !contentType.includes("application/json")) {
    return undefined;
  }

  return JSON.parse(text);
}
