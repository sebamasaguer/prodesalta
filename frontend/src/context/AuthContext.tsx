import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getMe, hasToken, login, logout, register, verifyEmail } from "../api/auth";
import type {
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
  User,
  VerifyEmailPayload,
} from "../types/auth";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginUser: (payload: LoginPayload) => Promise<User>;
  registerUser: (payload: RegisterPayload) => Promise<RegisterResponse>;
  verifyEmailUser: (payload: VerifyEmailPayload) => Promise<User>;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loginUser(payload: LoginPayload) {
    const response = await login(payload);
    setUser(response.user);
    return response.user;
  }

  async function registerUser(payload: RegisterPayload) {
    return register(payload);
  }

  async function verifyEmailUser(payload: VerifyEmailPayload) {
    const response = await verifyEmail(payload);
    setUser(response.user);
    return response.user;
  }

  function logoutUser() {
    logout();
    setUser(null);
  }

  useEffect(() => {
    async function loadUser() {
      try {
        if (!hasToken()) {
          setUser(null);
          return;
        }

        const me = await getMe();
        setUser(me);
      } catch {
        logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      loginUser,
      registerUser,
      verifyEmailUser,
      logoutUser,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}