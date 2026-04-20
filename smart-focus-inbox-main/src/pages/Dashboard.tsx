import AppLayout from "@/components/AppLayout";
import { mockReminders } from "@/lib/mockData";
import { useMessages } from "@/lib/messageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Inbox, AlertTriangle, Bell, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import PriorityBadge from "@/components/PriorityBadge";
import PlatformIcon from "@/components/PlatformIcon";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const { messages } = useMessages();
  const total = messages.length;
  const high = messages.filter((m) => m.priority === "high").length;
  const medium = messages.filter((m) => m.priority === "medium").length;
  const low = messages.filter((m) => m.priority === "low").length;
  const upcoming = mockReminders.filter((r) => r.dateTime > new Date()).length;

  const stats = [
    { icon: Inbox, label: "Total Messages", value: total, color: "text-primary" },
    { icon: AlertTriangle, label: "High Priority", value: high, color: "text-priority-high" },
    { icon: Bell, label: "Upcoming Reminders", value: upcoming, color: "text-priority-medium" },
    { icon: CheckCircle, label: "Low Priority", value: low, color: "text-priority-low" },
  ];

  const barData = [
    { name: "WhatsApp", count: messages.filter((m) => m.platform === "whatsapp").length },
    { name: "Email", count: messages.filter((m) => m.platform === "email").length },
    { name: "LinkedIn", count: messages.filter((m) => m.platform === "linkedin").length },
  ];

  const pieData = [
    { name: "High", value: high, color: "hsl(0, 72%, 51%)" },
    { name: "Medium", value: medium, color: "hsl(38, 92%, 50%)" },
    { name: "Low", value: low, color: "hsl(142, 71%, 45%)" },
  ];

  const recentMessages = messages.slice(0, 5);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your message analytics</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{s.label}</p>
                      <p className="text-3xl font-bold text-foreground mt-1">{s.value}</p>
                    </div>
                    <s.icon className={`w-8 h-8 ${s.color} opacity-70`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Messages by Platform</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(217, 91%, 60%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Priority Distribution</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={4}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent messages */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Messages</CardTitle>
            <button onClick={() => navigate("/inbox")} className="text-sm text-primary font-medium hover:underline">View all</button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentMessages.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <PlatformIcon platform={m.platform} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{m.sender}</p>
                  <p className="text-xs text-muted-foreground truncate">{m.subject}</p>
                </div>
                <PriorityBadge priority={m.priority} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
