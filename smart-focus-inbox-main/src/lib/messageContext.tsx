import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { mockMessages, type Message } from "./mockData";
import { useAuth } from "./authContext";
import { fetchGmailMessages } from "@/services/gmail";

interface MessageContextType {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  refreshMessages: () => Promise<void>;
}

const MessageContext = createContext<MessageContextType | null>(null);

export const useMessages = () => {
  const ctx = useContext(MessageContext);
  if (!ctx) throw new Error("useMessages must be used within MessageProvider");
  return ctx;
};

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const { user, isGmailConnected } = useAuth();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = async () => {
    if (!isGmailConnected() || !user?.linkedAccounts?.gmail) {
      setMessages(mockMessages);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const gmailAccount = user.linkedAccounts.gmail;
      const gmailMessages = await fetchGmailMessages(gmailAccount.accessToken);
      const otherMessages = mockMessages.filter((m) => m.platform !== "email");
      setMessages([...gmailMessages, ...otherMessages]);
    } catch (err) {
      console.error("Error loading Gmail messages:", err);
      setError("Failed to load Gmail messages. Using mock data.");
      setMessages(mockMessages);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [isGmailConnected, user?.linkedAccounts?.gmail]);

  return (
    <MessageContext.Provider value={{ messages, isLoading, error, refreshMessages: loadMessages }}>
      {children}
    </MessageContext.Provider>
  );
};
