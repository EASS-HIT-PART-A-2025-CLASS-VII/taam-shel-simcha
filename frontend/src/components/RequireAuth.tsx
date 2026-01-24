// RequireAuth.tsx
import { ReactNode, useEffect, useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Props = { children: ReactNode };

function decodeJwtPayload(token: string) {
  // JWT is base64url, not base64
  const base64Url = token.split(".")[1];
  if (!base64Url) return null;

  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  try {
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function isTokenExpired(token: string) {
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;
  if (!exp) return true;
  return Date.now() >= exp * 1000;
}

export default function RequireAuth({ children }: Props) {
  const location = useLocation();
  const { token, setToken } = useAuth();

  const isValid = useMemo(() => {
    if (!token) return false;
    return !isTokenExpired(token);
  }, [token]);

  // ✅ אם לא תקין – ננקה טוקן בצורה בטוחה (לא בזמן render)
  useEffect(() => {
    if (token && !isValid) {
      setToken(null);
    }
  }, [token, isValid, setToken]);

  // אם אין טוקן או שהוא לא תקין → לוגין
  if (!token || !isValid) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
