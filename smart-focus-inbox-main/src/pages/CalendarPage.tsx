import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useMessages } from "@/lib/messageContext";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

const CalendarPage = () => {
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const { messages } = useMessages();

  const reminders = messages.filter((m) => m.hasDeadline && m.deadlineDate);
  const eventDates = reminders.map((r) => r.deadlineDate as Date);
  const selectedReminders = selected
    ? reminders.filter((r) => isSameDay(r.deadlineDate as Date, selected))
    : [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
          <p className="text-muted-foreground">View deadlines and scheduled events</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-4 flex justify-center">
              <Calendar
                mode="single"
                selected={selected}
                onSelect={setSelected}
                className="pointer-events-auto"
                modifiers={{ event: eventDates }}
                modifiersClassNames={{ event: "bg-primary/20 font-bold text-primary rounded-full" }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {selected ? format(selected, "MMMM d, yyyy") : "Select a date"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedReminders.length > 0 ? (
                selectedReminders.map((r) => (
                  <div key={r.id} className="p-3 rounded-lg bg-accent/50 border border-border">
                    <p className="text-sm font-medium text-foreground">{r.subject}</p>
                    <p className="text-xs text-muted-foreground">From {r.sender} via {r.platform}</p>
                    <p className="text-xs text-primary mt-1">{format(r.deadlineDate as Date, "h:mm a")}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-6 text-center">No events on this date</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default CalendarPage;
