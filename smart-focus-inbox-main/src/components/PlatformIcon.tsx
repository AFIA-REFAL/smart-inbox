import { MessageCircle, Mail, Linkedin } from "lucide-react";
import type { Platform } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const platforms: Record<Platform, { icon: typeof Mail; className: string }> = {
  whatsapp: { icon: MessageCircle, className: "bg-secondary/10 text-secondary" },
  email: { icon: Mail, className: "bg-primary/10 text-primary" },
  linkedin: { icon: Linkedin, className: "bg-blue-100 text-blue-600" },
};

const PlatformIcon = ({ platform }: { platform: Platform }) => {
  const p = platforms[platform];
  return (
    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", p.className)}>
      <p.icon className="w-4 h-4" />
    </div>
  );
};

export default PlatformIcon;
