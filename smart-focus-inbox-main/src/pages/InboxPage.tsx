import { useState, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import { type Priority, type Platform, type Message } from "@/lib/mockData";
import { useMessages } from "@/lib/messageContext";
import PriorityBadge from "@/components/PriorityBadge";
import PlatformIcon from "@/components/PlatformIcon";
import MessageClassifier from "@/components/MessageClassifier";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const priorities: (Priority | "all")[] = ["all", "high", "medium", "low"];
const platforms: (Platform | "all")[] = ["all", "whatsapp", "email", "linkedin"];

const InboxPage = () => {
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { messages, isLoading, error } = useMessages();

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      const matchSearch = !search || m.sender.toLowerCase().includes(search.toLowerCase()) || m.subject.toLowerCase().includes(search.toLowerCase()) || m.preview.toLowerCase().includes(search.toLowerCase());
      const matchPriority = priorityFilter === "all" || m.priority === priorityFilter;
      const matchPlatform = platformFilter === "all" || m.platform === platformFilter;
      return matchSearch && matchPriority && matchPlatform;
    });
  }, [search, priorityFilter, platformFilter, messages]);

  const selected = filtered.find((m) => m.id === selectedId);

  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inbox</h1>
          <p className="text-muted-foreground">Your unified message center</p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search messages..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Filter className="w-3.5 h-3.5" />
              Priority:
            </div>
            {priorities.map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize",
                  priorityFilter === p ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {platforms.map((p) => (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize",
                  platformFilter === p ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* AI Classifier */}
        <MessageClassifier />

        {error && (
          <div className="flex items-center gap-2 bg-amber-50/50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground py-8">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading Gmail messages...</span>
          </div>
        )}

        <div className="grid md:grid-cols-5 gap-4">
          {/* Message list */}
          <div className="md:col-span-2 space-y-2 max-h-[70vh] overflow-auto pr-1">
            <AnimatePresence>
              {filtered.map((m) => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card
                    className={cn(
                      "cursor-pointer border transition-all hover:shadow-md",
                      selectedId === m.id && "ring-2 ring-primary",
                      !m.read && "border-l-4 border-l-primary"
                    )}
                    onClick={() => setSelectedId(m.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <PlatformIcon platform={m.platform} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-foreground truncate">{m.sender}</p>
                            <PriorityBadge priority={m.priority} />
                          </div>
                          <p className="text-xs font-medium text-foreground truncate mt-0.5">{m.subject}</p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{m.preview}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{format(m.timestamp, "MMM d, h:mm a")}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-12">No messages found</p>
            )}
          </div>

          {/* Detail pane */}
          <div className="md:col-span-3">
            {selected ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <PlatformIcon platform={selected.platform} />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground">{selected.sender}</h3>
                        <p className="text-sm text-muted-foreground">{format(selected.timestamp, "EEEE, MMMM d 'at' h:mm a")}</p>
                      </div>
                      <PriorityBadge priority={selected.priority} />
                    </div>
                    <h4 className="text-base font-semibold text-foreground">{selected.subject}</h4>
                    <p className="text-sm text-foreground/80 leading-relaxed">{selected.preview}</p>
                    {selected.hasDeadline && selected.deadlineDate && (
                      <div className="bg-priority-high/5 border border-priority-high/20 rounded-lg p-3 flex items-center gap-2">
                        <span className="text-priority-high text-sm font-medium">⏰ Deadline: {format(selected.deadlineDate, "MMMM d, yyyy")}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground capitalize px-2 py-1 bg-muted rounded-md">{selected.platform}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">AI classified as <strong className="capitalize">{selected.priority}</strong> priority</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Select a message to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default InboxPage;
