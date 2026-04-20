import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/authContext";
import { MessageProvider } from "@/lib/messageContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import InboxPage from "./pages/InboxPage";
import RemindersPage from "./pages/RemindersPage";
import CalendarPage from "./pages/CalendarPage";
import ProfileSetup from "./pages/ProfileSetup";
import GmailCallback from "./pages/GmailCallback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <MessageProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile-setup" element={<ProfileSetup />} />
              <Route path="/gmail-callback" element={<GmailCallback />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inbox" element={<InboxPage />} />
              <Route path="/reminders" element={<RemindersPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </MessageProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
