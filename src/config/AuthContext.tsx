import React, { useContext, useEffect, useRef, useState, createContext } from "react";
import { fetchAuthSession, signInWithRedirect, signOut, getCurrentUser, type AuthSession, type AuthUser } from "@aws-amplify/auth";

import { branch } from "./config";
import { ApiCaller } from "./api_caller"

type AuthContextType = {
  session: AuthSession,
  user: AuthUser,
  refreshCreds: (force: boolean) => Promise<void>,
  handleSignOut: () => Promise<void>,
  api: ApiCaller
};

const AuthContext = createContext<AuthContextType | null>(null);

function isSameSession(a?: AuthSession, b?: AuthSession) {
  if (a === undefined && b === undefined)
    return true
  if (a === undefined || b === undefined)
    return false
  if (a.credentials != b.credentials) {
    console.log("session.credentials changed", a.credentials, b.credentials)
    return false
  }
  if (a.tokens?.accessToken.toString() != b.tokens?.accessToken.toString()) {
    console.log("session.tokens.accessToken changed", a.tokens?.accessToken, b.tokens?.accessToken)
    return false
  }
  if (a.tokens?.idToken?.toString() != b.tokens?.idToken?.toString()) {
    console.log("session.tokens.idToken changed", a.tokens?.idToken, b.tokens?.idToken)
    return false
  }
  return true
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<AuthSession | undefined>(undefined)
  const [user, setUser] = useState<AuthUser | undefined>(undefined)
  const apiCallerRef = useRef<ApiCaller>(new ApiCaller(branch));

  const refreshCreds = async (force: boolean = true) => {
    try {
      const _session = await fetchAuthSession({ forceRefresh: force });
      if (!isSameSession(_session, session)) {
        console.log("session", _session)
        if (!_session.tokens) {
          // 未認証なら Hosted UI にリダイレクト
          console.log("redirect")
          await signInWithRedirect();
          console.error("here never called")
          return;
        }

        // 認証済み
        const user = await getCurrentUser()
        console.log("user", user)
        setSession(_session)
        setUser(user)
        apiCallerRef.current.setToken(_session.tokens?.accessToken.toString())

        const access_exp = _session.tokens?.accessToken?.payload?.exp!
        const id_exp = _session.tokens?.idToken?.payload?.exp
        const exp = id_exp ? Math.min(access_exp, id_exp) : access_exp
        const margin_sec = 10
        const sec = exp - (Date.now() / 1000) - margin_sec
        setTimeout(refreshCreds, sec * 1000)
      }
    } catch (err) {
      console.error("Error initializing app:", err);
    }
  };

  useEffect(() => {
    refreshCreds(false);
  }, []);

  const handleSignOut = async () => {
    await signOut({ global: true });
  };

  return (
    (session && user) ?
      <AuthContext.Provider value={{ session, user, refreshCreds, api: apiCallerRef.current, handleSignOut }}>
        {children}
      </AuthContext.Provider> :
      <div>
        <p>認証情報を取得中</p>
      </div>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within a AuthProvider");
  return context;
};