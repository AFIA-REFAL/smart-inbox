import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { type Reminder } from "@/lib/mockData";
import { useMessages } from "@/lib/messageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Check, Clock } from "lucide-react";
import { format, isPast, isFuture } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const RemindersPage = () => {
  const { messages } = useMessages();
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    const derived = messages
      .filter((m) => m.hasDeadline && m.deadlineDate)
      .map((m) => ({
        id: `rem-${m.id}`,
        title: m.subject,
        description: `From ${m.sender} via ${m.platform}`,
        dateTime: m.deadlineDate!,
        messageId: m.id,
        completed: false,
      }));

    setReminders((prev) =>
      derived.map((rem) => ({
        ...rem,
        completed: prev.find((item) => item.id === rem.id)?.completed ?? rem.completed,
      }))
    );
  }, [messages]);

  const toggleComplete = (id: string) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r)));
  };

  const upcoming = reminders.filter((r) => !r.completed && isFuture(r.dateTime)).sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
  const overdue = reminders.filter((r) => !r.completed && isPast(r.dateTime));
  const completed = reminders.filter((r) => r.completed);

  const Section = ({ title, items, icon: Icon }: { title: string; items: typeof reminders; icon: typeof Bell }) => (
    items.length > 0 ? (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title} ({items.length})</h2>
        </div>
        {items.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={cn("border transition-all hover:shadow-md", r.completed && "opacity-60")}>
              <CardContent className="p-4 flex items-center gap-4">
                <button
                  onClick={() => toggleComplete(r.id)}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
                    r.completed ? "bg-secondary border-secondary" : "border-border hover:border-primary"
                  )}
                >
                  {r.completed && <Check className="w-3.5 h-3.5 text-secondary-foreground" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium text-foreground", r.completed && "line-through")}>{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={cn(
                    "text-xs font-medium",
                    isPast(r.dateTime) && !r.completed ? "text-priority-high" : "text-muted-foreground"
                  )}>
                    {format(r.dateTime, "MMM d")}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{format(r.dateTime, "h:mm a")}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    ) : null
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Smart Reminders</h1>
          <p className="text-muted-foreground">Auto-generated from your messages</p>
        </div>
        <Section title="Overdue" items={overdue} icon={Bell} />
        <Section title="Upcoming" items={upcoming} icon={Clock} />
        <Section title="Completed" items={completed} icon={Check} />
        {reminders.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No reminders yet</p>
        )}
      </div>
    </AppLayout>
  );
};

export default RemindersPage;
