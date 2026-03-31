import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "../lib/api.js";

const AuthContext = createContext(null);

const TOKEN_KEY = "lms_token";
const USER_KEY = "lms_user";

const readStoredUser = () => {
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(() => readStoredUser());
  const [authChecked, setAuthChecked] = useState(false);

  const storeAuth = (authToken, authUser) => {
    window.localStorage.setItem(TOKEN_KEY, authToken);
    window.localStorage.setItem(USER_KEY, JSON.stringify(authUser));
    setToken(authToken);
    setUser(authUser);
  };

  const clearAuth = () => {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    setToken("");
    setUser(null);
  };

  useEffect(() => {
    if (!token) {
      setAuthChecked(true);
      return;
    }

    apiGet("/auth/me")
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        clearAuth();
      })
      .finally(() => {
        setAuthChecked(true);
      });
  }, [token]);

  const login = async (payload) => {
    const data = await apiPost("/auth/login", payload);
    storeAuth(data.token, data.user);
    return data;
  };

  const register = async (payload) => {
    const data = await apiPost("/auth/register", payload);
    storeAuth(data.token, data.user);
    return data;
  };

  const value = useMemo(
    () => ({
      token,
      user,
      authChecked,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout: clearAuth,
      setAuthFromApplication: (auth) => {
        if (auth?.token && auth?.user) {
          storeAuth(auth.token, auth.user);
        }
      }
    }),
    [token, user, authChecked]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
