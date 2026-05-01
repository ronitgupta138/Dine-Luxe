import { getBrowserSupabase } from "./supabase-client";
 
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";
 
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}
 
interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { page: number; limit: number; total: number; pages: number };
  message?: string;
}
 
interface ApiErrorResponse {
  success: false;
  error: { code: string; message: string; field?: string };
}
 
async function getAuthHeaders(): Promise<HeadersInit> {
  const supabase = await getBrowserSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }
  return headers;
}
 
async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
 
  if (!res.ok) {
    const errBody: ApiErrorResponse = await res.json().catch(() => ({
      success: false,
      error: { code: "UNKNOWN", message: "Unknown error occurred" },
    }));
    throw new ApiError(
      res.status,
      errBody.error?.code ?? "UNKNOWN",
      errBody.error?.message ?? "Request failed",
      errBody.error?.field
    );
  }
 
  if (res.status === 204) return undefined as unknown as T;
  const json: ApiResponse<T> = await res.json();
  return json.data;
}
 
export const apiClient = {
  get:    <T>(path: string)              => request<T>("GET",    path),
  post:   <T>(path: string, body: unknown) => request<T>("POST",   path, body),
  patch:  <T>(path: string, body: unknown) => request<T>("PATCH",  path, body),
  put:    <T>(path: string, body: unknown) => request<T>("PUT",    path, body),
  delete: <T>(path: string)              => request<T>("DELETE", path),
};
