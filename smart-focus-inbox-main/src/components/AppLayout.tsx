import { ReactNode } from "react";
import { useAuth } from "@/lib/authContext";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { LayoutDashboard, Inbox, Bell, CalendarDays, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Inbox, label: "Inbox", path: "/inbox" },
  { icon: Bell, label: "Reminders", path: "/reminders" },
  { icon: CalendarDays, label: "Calendar", path: "/calendar" },
];

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-card border-r border-border p-4">
        <div className="mb-8 px-3 flex items-center gap-3">
          <img src="/smart-inbox-logo.png" alt="Smart Inbox" className="h-10 w-auto object-contain" />
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-border pt-4">
          <div className="px-3 mb-3">
            <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <nav className="flex justify-around py-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-colors",
                location.pathname === item.path ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
};

export default AppLayout;
