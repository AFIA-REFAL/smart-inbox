import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Loader2, Sparkles, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PriorityBadge from "@/components/PriorityBadge";
import type { Priority, Platform } from "@/lib/mockData";

interface ClassifyResult {
  priority: Priority;
  confidence: number;
  hasDeadline: boolean;
  reasoning: string;
}

const MessageClassifier = () => {
  const [message, setMessage] = useState("");
  const [sender, setSender] = useState("");
  const [platform, setPlatform] = useState<Platform>("email");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClassifyResult | null>(null);

  const handleClassify = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("classify-message", {
        body: { message, sender: sender || undefined, platform },
      });

      if (error) throw error;
      setResult(data as ClassifyResult);
    } catch (err) {
      console.error("Classification error:", err);
      // Fallback local classification
      setResult(localClassify(message));
    } finally {
      setLoading(false);
    }
  };

  const localClassify = (text: string): ClassifyResult => {
    const lower = text.toLowerCase();
    const highWords = ["urgent", "deadline", "asap", "submit", "final", "exam", "immediately"];
    const medWords = ["meeting", "schedule", "call", "reminder", "tomorrow", "appointment"];
    const isHigh = highWords.some((w) => lower.includes(w));
    const isMed = medWords.some((w) => lower.includes(w));
    return {
      priority: isHigh ? "high" : isMed ? "medium" : "low",
      confidence: 75,
      hasDeadline: /deadline|due|submit|by \w+/i.test(text),
      reasoning: isHigh ? "Urgent keywords detected." : isMed ? "Scheduling keywords found." : "General informational content.",
    };
  };

  const priorityIcon = {
    high: <AlertTriangle className="w-5 h-5 text-priority-high" />,
    medium: <Clock className="w-5 h-5 text-priority-medium" />,
    low: <CheckCircle className="w-5 h-5 text-priority-low" />,
  };

  return (
    <Card className="border-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          AI Message Classifier
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Sender (optional)</Label>
            <Input placeholder="e.g., Prof. Smith" value={sender} onChange={(e) => setSender(e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Platform</Label>
            <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Paste your message</Label>
          <Textarea
            placeholder="Paste or type a message here to classify its priority..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        <Button onClick={handleClassify} disabled={!message.trim() || loading} className="w-full gap-2">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Classifying...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Classify Message
            </>
          )}
        </Button>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-lg border bg-card p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {priorityIcon[result.priority]}
                  <span className="font-semibold text-foreground capitalize">{result.priority} Priority</span>
                </div>
                <PriorityBadge priority={result.priority} />
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  Confidence: <strong className="text-foreground">{result.confidence}%</strong>
                </span>
                {result.hasDeadline && (
                  <span className="text-priority-high text-xs font-medium bg-priority-high/10 px-2 py-0.5 rounded-full">
                    ⏰ Deadline detected
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{result.reasoning}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default MessageClassifier;
