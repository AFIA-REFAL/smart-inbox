import React, { createContext, useContext, useState, ReactNode } from "react";

export interface GmailAccount {
  accessToken: string;
  refreshToken?: string;
  email: string;
  expiresAt: number;
}

interface LinkedAccounts {
  gmail?: GmailAccount;
  whatsapp?: string;
  linkedin?: string;
}

interface User {
  name: string;
  email: string;
  onboarded: boolean;
  linkedAccounts?: LinkedAccounts;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  saveLinkedAccounts: (accounts: LinkedAccounts) => void;
  saveGmailCredentials: (credentials: GmailAccount) => void;
  isGmailConnected: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email: string, _password: string) => {
    const saved = localStorage.getItem("user_" + email);
    if (saved) {
      const u = JSON.parse(saved);
      setUser(u);
      localStorage.setItem("user", JSON.stringify(u));
    } else {
      const u = { name: email.split("@")[0], email, onboarded: false };
      setUser(u);
      localStorage.setItem("user", JSON.stringify(u));
    }
    return true;
  };

  const signup = (name: string, email: string, _password: string) => {
    const u: User = { name, email, onboarded: false };
    setUser(u);
    localStorage.setItem("user", JSON.stringify(u));
    return true;
  };

  const saveLinkedAccounts = (accounts: LinkedAccounts) => {
    if (!user) return;
    const updated = { ...user, linkedAccounts: accounts, onboarded: true };
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
    localStorage.setItem("user_" + user.email, JSON.stringify(updated));
  };

  const saveGmailCredentials = (credentials: GmailAccount) => {
    if (!user) return;
    const linkedAccounts = user.linkedAccounts || {};
    const updated = {
      ...user,
      linkedAccounts: {
        ...linkedAccounts,
        gmail: credentials,
      },
    };
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
    localStorage.setItem("user_" + user.email, JSON.stringify(updated));
  };

  const isGmailConnected = () => {
    if (!user?.linkedAccounts?.gmail) return false;
    const gmail = user.linkedAccounts.gmail as GmailAccount;
    return gmail.accessToken && gmail.expiresAt > Date.now();
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, saveLinkedAccounts, saveGmailCredentials, isGmailConnected }}>
      {children}
    </AuthContext.Provider>
  );
};
