import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { buildApi, endpoints } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState({
    accessToken: null,
    refreshToken: null,
  });
  const [loading, setLoading] = useState(true);

  const api = useMemo(
    () => buildApi(() => tokens.accessToken, setTokens),
    [tokens.accessToken],
  );

  useEffect(() => {
    // try to fetch current user
    (async () => {
      // console.log("hey there, you are in useEffect of Context ");

      try {
        // console.log("in try block before DB call ");
        // console.log(" DB call now");

        const res = await api.request(endpoints.me(), { method: "GET" });
        // console.log("got result of fetching if user was loggedin ", res);

        setUser(res?.data || null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async ({ username, email, password }) => {
    const res = await api.request(endpoints.login(), {
      method: "POST",
      body: { username, email, password },
    });
    const accessToken = res?.data?.accessToken;
    const refreshToken = res?.data?.refreshToken;
    if (accessToken) setTokens({ accessToken, refreshToken });
    setUser(res?.data?.user || null);
    return res;
  };

  const register = async ({
    userName,
    fullName,
    email,
    password,
    avatarFile,
    coverImageFile,
  }) => {
    const form = new FormData();
    form.append("userName", userName);
    form.append("fullName", fullName);
    form.append("email", email);
    form.append("password", password);
    if (avatarFile) form.append("avatar", avatarFile);
    if (coverImageFile) form.append("coverImage", coverImageFile);
    const res = await api.request(endpoints.register(), {
      method: "POST",
      body: form,
      isForm: true,
    });
    return res;
  };

  const logout = async () => {
    try {
      await api.request(endpoints.logout(), { method: "POST" });
      // console.log("Technically logged out");
    } finally {
      setTokens({ accessToken: null, refreshToken: null });
      setUser(null);
    }
  };

  const value = {
    user,
    tokens,
    setTokens,
    setUser,
    login,
    register,
    logout,
    api,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
