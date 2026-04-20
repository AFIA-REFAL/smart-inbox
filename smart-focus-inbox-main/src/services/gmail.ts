import { Message } from "@/lib/mockData";

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  internalDate: string;
  payload?: {
    headers: Array<{ name: string; value: string }>;
    parts?: Array<{ body?: { data?: string } }>;
  };
}

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

/**
 * Get the value of a header from Gmail message
 */
function getHeader(headers: Array<{ name: string; value: string }>, headerName: string): string {
  return headers.find((h) => h.name === headerName)?.value || "";
}

/**
 * Decode Gmail body content
 */
function decodeGmailBody(payload: any): string {
  try {
    // Check if there's a direct body
    if (payload.body?.data) {
      return decodeURIComponent(escape(atob(payload.body.data)));
    }

    // Check parts for text/plain or text/html
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === "text/plain" && part.body?.data) {
          return decodeURIComponent(escape(atob(part.body.data)));
        }
      }
      for (const part of payload.parts) {
        if (part.mimeType === "text/html" && part.body?.data) {
          return decodeURIComponent(escape(atob(part.body.data))).substring(0, 200);
        }
      }
    }
  } catch (e) {
    console.error("Error decoding Gmail body:", e);
  }
  return "No preview available";
}

/**
 * Classify message priority based on content
 */
function classifyPriority(subject: string, snippet: string): "high" | "medium" | "low" {
  const highPriorityKeywords = ["urgent", "asap", "important", "deadline", "immediate", "critical"];
  const text = (subject + " " + snippet).toLowerCase();

  if (highPriorityKeywords.some((keyword) => text.includes(keyword))) {
    return "high";
  }

  const mediumPriorityKeywords = ["meeting", "review", "feedback", "please check", "awaiting"];
  if (mediumPriorityKeywords.some((keyword) => text.includes(keyword))) {
    return "medium";
  }

  return "low";
}

/**
 * Fetch Gmail messages
 */
export async function fetchGmailMessages(accessToken: string): Promise<Message[]> {
  try {
    // Fetch list of message IDs
    const listResponse = await fetch(
      "https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=20&q=in:inbox",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!listResponse.ok) {
      throw new Error(`Gmail API error: ${listResponse.status}`);
    }

    const listData = (await listResponse.json()) as { messages?: Array<{ id: string }> };
    const messageIds = listData.messages || [];

    if (messageIds.length === 0) {
      return [];
    }

    // Fetch full message details for each message
    const messagePromises = messageIds.map((msg) =>
      fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null)
    );

    const messages = await Promise.all(messagePromises);

    // Transform Gmail messages to our Message format
    return messages
      .filter((msg) => msg !== null)
      .map((fullMsg: GmailMessage): Message => {
        const headers = fullMsg.payload?.headers || [];
        const from = getHeader(headers, "From");
        const subject = getHeader(headers, "Subject");
        const preview = fullMsg.snippet || "No preview available";

        // Extract sender name from email
        const senderMatch = from.match(/^"?([^"<]+)"?/);
        const senderName = senderMatch ? senderMatch[1].trim() : from;

        return {
          id: fullMsg.id,
          sender: senderName,
          subject: subject || "(No subject)",
          preview: preview.substring(0, 150),
          platform: "email" as const,
          priority: classifyPriority(subject, preview),
          timestamp: new Date(parseInt(fullMsg.internalDate)),
          read: !fullMsg.labelIds?.includes("UNREAD"),
        };
      });
  } catch (error) {
    console.error("Error fetching Gmail messages:", error);
    throw error;
  }
}

/**
 * Get Gmail user profile
 */
export async function getGmailProfile(accessToken: string): Promise<GmailProfile> {
  const response = await fetch("https://www.googleapis.com/gmail/v1/users/me/profile", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Gmail API error: ${response.status}`);
  }

  return response.json() as Promise<GmailProfile>;
}

/**
 * Initialize Gmail OAuth flow
 * Open Google OAuth consent screen
 */
export function initializeGmailOAuth(clientId: string, redirectUri: string, state: string): void {
  const scopes = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
  ];

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes.join(" "),
    access_type: "offline",
    prompt: "consent",
    state,
  });

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 * This should be called from backend to keep secret safe
 */
export async function exchangeCodeForToken(code: string, clientId: string, clientSecret: string, redirectUri: string): Promise<{ access_token: string; refresh_token: string }> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange code for token: ${response.status}`);
  }

  return response.json();
}
