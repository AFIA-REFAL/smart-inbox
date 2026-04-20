import { useState } from "react";
import { useAuth } from "@/lib/authContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Lock, User, MessageSquare, Shield, Bell } from "lucide-react";
import { motion } from "framer-motion";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = isLogin ? login(email, password) : signup(name, email, password);
    if (success) {
      if (isLogin) {
        // For login, check if user already onboarded
        const saved = localStorage.getItem("user_" + email);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.onboarded) {
            navigate("/dashboard");
            return;
          }
        }
        navigate("/profile-setup");
      } else {
        // New signup always goes to profile setup
        navigate("/profile-setup");
      }
    }
  };

  const features = [
    { icon: MessageSquare, label: "Smart Inbox", desc: "Unified messages from all platforms" },
    { icon: Shield, label: "AI Priority", desc: "Auto-classify message urgency" },
    { icon: Bell, label: "Smart Reminders", desc: "Never miss a deadline again" },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12">
        <div className="max-w-md space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl font-extrabold text-primary-foreground leading-tight">
              AI Message Priority Classifier
            </h1>
            <p className="mt-3 text-primary-foreground/80 text-lg">
              Organize your messages intelligently with AI-powered priority classification and smart reminders.
            </p>
          </motion.div>
          <div className="space-y-4">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="flex items-center gap-4 bg-primary-foreground/10 rounded-lg p-4"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-primary-foreground">{f.label}</p>
                  <p className="text-sm text-primary-foreground/70">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <img src="/smart-inbox-logo.png" alt="Smart Inbox" className="h-12 w-auto object-contain" />
                <span className="text-lg font-semibold tracking-[0.12em] uppercase text-muted-foreground">Smart Inbox</span>
              </div>
              <CardTitle className="text-2xl font-bold">{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
              <CardDescription>{isLogin ? "Sign in to your account" : "Get started for free"}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" required />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required />
                </div>
                <Button type="submit" className="w-full font-semibold" size="lg">
                  {isLogin ? "Sign In" : "Create Account"}
                </Button>
              </form>
              <p className="text-center mt-4 text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-semibold hover:underline">
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
