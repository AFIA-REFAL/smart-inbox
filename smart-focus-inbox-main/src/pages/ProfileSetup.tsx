import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/authContext";
import GmailOAuthButton from "@/components/GmailOAuthButton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Phone, Linkedin, ArrowRight, CheckCircle2, Link2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const ProfileSetup = () => {
  const { user, isGmailConnected } = useAuth();
  const navigate = useNavigate();
  const [whatsapp, setWhatsapp] = useState("");
  const [linkedin, setLinkedin] = useState("");

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isGmailConnected() && !whatsapp && !linkedin) {
      toast.error("Please link at least one account");
      return;
    }
    toast.success("Accounts linked successfully! Syncing & classifying messages...");
    navigate("/dashboard");
  };

  const handleSkip = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4"
          >
            <Link2 className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground">Link Your Accounts</h1>
          <p className="text-muted-foreground mt-1">
            Welcome, <span className="font-semibold text-foreground">{user.name}</span>! Connect your messaging platforms to get started.
          </p>
        </div>

        <Card className="border-primary/10 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Connect Platforms
            </CardTitle>
            <CardDescription>
              Enter your account IDs so we can sync and classify your messages using AI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Label className="flex items-center gap-2 text-sm font-medium mb-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-red-500" />
                  </div>
                  Gmail
                </Label>
                <GmailOAuthButton isConnected={isGmailConnected()} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="whatsapp" className="flex items-center gap-2 text-sm font-medium">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-green-500" />
                  </div>
                  WhatsApp Number
                </Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="h-11"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <Label htmlFor="linkedin" className="flex items-center gap-2 text-sm font-medium">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Linkedin className="w-4 h-4 text-blue-600" />
                  </div>
                  LinkedIn Profile URL
                </Label>
                <Input
                  id="linkedin"
                  placeholder="linkedin.com/in/yourprofile"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="h-11"
                />
              </motion.div>

              <div className="pt-2 space-y-3">
                <Button type="submit" className="w-full h-11 text-base font-semibold gap-2">
                  Link & Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSkip}
                  className="w-full text-muted-foreground"
                >
                  Skip for now
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Your data is stored locally for demo purposes only.
        </p>
      </motion.div>
    </div>
  );
};

export default ProfileSetup;
