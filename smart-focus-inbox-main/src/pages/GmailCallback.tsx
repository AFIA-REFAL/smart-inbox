import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth, type GmailAccount } from "@/lib/authContext";
import { exchangeCodeForToken } from "@/services/gmail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Gmail OAuth callback page
 * Called after user authorizes Gmail in Google OAuth consent screen
 */
const GmailCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { saveGmailCredentials, user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const errorParam = searchParams.get("error");

        // Check for user rejection
        if (errorParam) {
          setError(`Authorization failed: ${errorParam}`);
          setIsProcessing(false);
          return;
        }

        if (!code) {
          setError("No authorization code received");
          setIsProcessing(false);
          return;
        }

        // Verify state parameter (optional but recommended for security)
        const savedState = sessionStorage.getItem("gmail_oauth_state") || localStorage.getItem("gmail_oauth_state");
        console.debug("Gmail callback state check", { state, savedState });
        if (state !== savedState) {
          if (!savedState && state) {
            console.warn("No saved OAuth state found, continuing in development mode.");
          } else {
            setError(
              `Invalid state parameter - possible CSRF attack. received=${state ?? "none"}, saved=${savedState ?? "none"}`
            );
            setIsProcessing(false);
            return;
          }
        }

        // Exchange code for tokens
        // NOTE: In production, this should be done on your backend server
        // to keep your client secret secure. For now, we're doing it client-side.
        const clientId = import.meta.env.VITE_GMAIL_CLIENT_ID;
        const clientSecret = import.meta.env.VITE_GMAIL_CLIENT_SECRET;
        const redirectUri = import.meta.env.VITE_GMAIL_REDIRECT_URI || `${window.location.origin}/gmail-callback`;

        const tokens = await exchangeCodeForToken(
          code,
          clientId,
          clientSecret,
          redirectUri
        );

        // Save Gmail credentials
        const gmailAccount: GmailAccount = {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          email: user?.email || "unknown",
          expiresAt: Date.now() + (tokens.expires_in ? tokens.expires_in * 1000 : 3600000),
        };

        saveGmailCredentials(gmailAccount);
        setSuccess(true);
        setIsProcessing(false);

        // Redirect to inbox after 2 seconds
        setTimeout(() => {
          navigate("/inbox");
        }, 2000);
      } catch (err) {
        console.error("Error processing Gmail callback:", err);
        setError(err instanceof Error ? err.message : "Failed to authenticate with Gmail");
        setIsProcessing(false);
      } finally {
        // Clear stored state
        sessionStorage.removeItem("gmail_oauth_state");
        localStorage.removeItem("gmail_oauth_state");
      }
    };

    processCallback();
  }, [searchParams, navigate, saveGmailCredentials, user?.email]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isProcessing && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
            {success && <CheckCircle2 className="w-5 h-5 text-green-500" />}
            {error && <AlertCircle className="w-5 h-5 text-red-500" />}
            Gmail Authorization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isProcessing && (
            <>
              <p className="text-muted-foreground">Processing your authorization...</p>
              <p className="text-sm text-muted-foreground">Please wait while we set up your Gmail integration.</p>
            </>
          )}

          {success && (
            <>
              <p className="text-green-700 font-medium">✓ Gmail connected successfully!</p>
              <p className="text-sm text-muted-foreground">Redirecting to your inbox...</p>
            </>
          )}

          {error && (
            <>
              <p className="text-red-700 font-medium">Authorization failed</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={() => navigate("/profile-setup")} className="w-full">
                Back to Setup
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GmailCallback;
