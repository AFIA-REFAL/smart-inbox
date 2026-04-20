import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { initializeGmailOAuth } from "@/services/gmail";
import { toast } from "sonner";

interface GmailOAuthButtonProps {
  isConnected?: boolean;
  onConnectStart?: () => void;
}

/**
 * Button to initiate Gmail OAuth flow
 */
export const GmailOAuthButton = ({ isConnected = false, onConnectStart }: GmailOAuthButtonProps) => {
  const handleGmailLogin = () => {
    try {
      const clientId = import.meta.env.VITE_GMAIL_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_GMAIL_REDIRECT_URI || `${window.location.origin}/gmail-callback`;

      if (!clientId) {
        toast.error("Gmail client ID not configured. Please check your environment variables.");
        return;
      }

      // Generate and save a random state for security
      const state = Math.random().toString(36).substring(7);
      sessionStorage.setItem("gmail_oauth_state", state);
      localStorage.setItem("gmail_oauth_state", state);
      console.debug("Gmail OAuth state saved", state, {
        session: sessionStorage.getItem("gmail_oauth_state"),
        local: localStorage.getItem("gmail_oauth_state"),
      });

      onConnectStart?.();

      // Redirect to Gmail OAuth
      initializeGmailOAuth(clientId, redirectUri, state);
    } catch (error) {
      console.error("Error initiating Gmail OAuth:", error);
      toast.error("Failed to initiate Gmail login");
    }
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
          <Mail className="w-4 h-4 text-green-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-green-900">✓ Gmail Connected</p>
          <p className="text-xs text-green-700">Your messages are syncing automatically</p>
        </div>
      </div>
    );
  }

  return (
    <Button
      type="button"
      onClick={handleGmailLogin}
      variant="outline"
      className="w-full h-11 flex items-center justify-center gap-2 border-red-200 hover:bg-red-50"
    >
      <Mail className="w-4 h-4 text-red-500" />
      <span>Connect Gmail</span>
    </Button>
  );
};

export default GmailOAuthButton;
