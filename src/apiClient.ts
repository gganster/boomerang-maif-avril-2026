const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
import type { Task } from './type';

type ApiRequest = (
  {url: "/tasks", method: "GET", body: undefined} |
  {url: "/tasks", method: "POST", body: Omit<Task, "id">} |
  {url: `/tasks/${string}`, method: "PUT", body: Omit<Task, "id">} |
  {url: `/tasks/${string}`, method: "DELETE", body: undefined} |
  {url: "/register", method: "POST", body: {email: string, password: string}} |
  {url: "/login", method: "POST", body: {email: string, password: string}} |
  {url: "/me", method: "GET", body: undefined}
);

const apiClient = async <T>({url, method, body} : ApiRequest) : Promise<T> => {
  const jwt = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}${url}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(jwt ? {"authorization": `Bearer ${jwt}`} : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url.toString()}`);
  }

  return (await res.json()) as T;
}

export { apiClient };