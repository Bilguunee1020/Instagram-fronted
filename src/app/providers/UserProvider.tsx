"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { User } from "../types";
import { useRouter } from "next/navigation";

type UserContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  setToken: (token: string | null) => void;
  logout: () => void;
};

export const UserContext = createContext<UserContextType>({
  user: null,
  token: null,
  loading: true,
  setToken: () => {},
  logout: () => {},
});

export const UserContextProvider = ({ children }: React.PropsWithChildren) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  const authenticateUser = async () => {
    setLoading(true);
    const response = await fetch("http://localhost:5500/me", {
      headers: { Authorization: "Bearer " + token },
    });
    if (response.status !== 200) {
      setUser(null);
      setToken(null);
      localStorage.setItem("authToken", "null");
      setLoading(false);
      return;
    }
    const data = await response.json();
    setUser(data.body);
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
  };

  useEffect(() => {
    const localToken = localStorage.getItem("authToken");
    if (localToken && localToken !== "null") setToken(JSON.parse(localToken));
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem("authToken", JSON.stringify(token));
      authenticateUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  return (
    <UserContext.Provider value={{ user, token, loading, setToken, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
