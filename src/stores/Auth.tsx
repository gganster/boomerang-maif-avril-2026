
import React, {useState, createContext, useContext, useEffect} from "react";
import type { User } from "../type";
import { apiClient } from "../apiClient";

const AuthContext = createContext<{
  user: User | null,
  isLoading: boolean,
  login: (email: string, password: string) => Promise<void>,
  logout: () => void,
  register: (email: string, password: string) => Promise<void>
}>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  register: async () => {console.log("void")}
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    (async () => {
      const jwt = localStorage.getItem("token");
      if (!jwt) return setIsLoading(false);

      try {
        const res = await apiClient<User>({url: "/me", method: "GET", body: undefined});
        setUser(res);
      } catch (e) {
        console.error(e);
      }
      setIsLoading(false);
    })()
  }, [])

  console.log(user);

  const login = async (email: string, password: string) => {
    try {
      const res = await apiClient<{user: User, token: string}>({
        url: "/login",
        method: "POST",
        body: {email, password}
      });

      setUser(res.user);
      localStorage.setItem("token", res.token);
    } catch (e) {
      console.error(e);
    }
  }

  const register = async (email: string, password: string) => {
    try {
      const res = await apiClient<{user: User, token: string}>({
        url: "/register",
        method: "POST",
        body: {email, password}
      });
      setUser(res.user);
      localStorage.setItem("token", res.token);
    } catch (e) {
      console.error(e);
    }
  }

  const logout = () => {
    setUser(null);
    localStorage.setItem("token", "")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading}}>
      {isLoading ? <p>Loading...</p> : children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);

  return ctx;
};