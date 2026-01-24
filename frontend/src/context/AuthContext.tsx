import React, { createContext, useContext, useMemo, useState } from "react";

type AuthCtx = {
  token: string | null;
  isAuthed: boolean;
  setToken: (t: string | null) => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tokenState, setTokenState] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });

  const setToken = (t: string | null) => {
    if (t) localStorage.setItem("token", t);
    else localStorage.removeItem("token");
    setTokenState(t); // ✅ גורם לרינדור מחדש בלי רענון
  };

  const value = useMemo(
    () => ({ token: tokenState, isAuthed: !!tokenState, setToken }),
    [tokenState]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
