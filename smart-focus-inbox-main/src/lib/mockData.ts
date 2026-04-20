export type Priority = "high" | "medium" | "low";
export type Platform = "whatsapp" | "email" | "linkedin";

export interface Message {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  platform: Platform;
  priority: Priority;
  timestamp: Date;
  read: boolean;
  hasDeadline?: boolean;
  deadlineDate?: Date;
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  dateTime: Date;
  messageId: string;
  completed: boolean;
}

const now = new Date();
const d = (daysOffset: number, hours = 10) => {
  const date = new Date(now);
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hours, 0, 0, 0);
  return date;
};

export const mockMessages: Message[] = [
  { id: "1", sender: "Prof. Smith", subject: "Final Project Submission", preview: "Please submit your final project by April 10th. Late submissions will not be accepted.", platform: "email", priority: "high", timestamp: d(-1, 9), read: false, hasDeadline: true, deadlineDate: d(8) },
  { id: "2", sender: "Team WhatsApp", subject: "Group Meeting Tomorrow", preview: "Hey everyone, don't forget our group meeting tomorrow at 3 PM in the library.", platform: "whatsapp", priority: "high", timestamp: d(0, 8), read: false, hasDeadline: true, deadlineDate: d(1, 15) },
  { id: "3", sender: "LinkedIn", subject: "New connection request", preview: "You have a new connection request from John Doe.", platform: "linkedin", priority: "low", timestamp: d(-2, 14), read: true },
  { id: "4", sender: "Recruiter - TCS", subject: "Job Opportunity", preview: "Hi, we have an exciting role matching your profile. Interested?", platform: "linkedin", priority: "medium", timestamp: d(-1, 16), read: true },
  { id: "5", sender: "Dr. Johnson", subject: "Research Paper Review", preview: "I've reviewed your paper. Please address the comments and resubmit by Friday.", platform: "email", priority: "high", timestamp: d(0, 11), read: false, hasDeadline: true, deadlineDate: d(3) },
  { id: "6", sender: "Mom", subject: "Call me back", preview: "Hey, give me a call when you're free. Nothing urgent.", platform: "whatsapp", priority: "medium", timestamp: d(0, 7), read: false },
  { id: "7", sender: "Career Services", subject: "Job Fair Next Week", preview: "Don't miss our annual job fair on April 15th. Register now!", platform: "email", priority: "medium", timestamp: d(-3, 10), read: true, hasDeadline: true, deadlineDate: d(13) },
  { id: "8", sender: "Study Group", subject: "Exam prep materials", preview: "Uploaded the study notes for the upcoming midterm. Check the shared drive.", platform: "whatsapp", priority: "medium", timestamp: d(-1, 20), read: false },
  { id: "9", sender: "Netflix", subject: "New releases this week", preview: "Check out what's new on Netflix this week!", platform: "email", priority: "low", timestamp: d(-4, 12), read: true },
  { id: "10", sender: "Project Partner", subject: "Code Review Needed", preview: "Can you review my PR before the deadline? It's due April 8th.", platform: "whatsapp", priority: "high", timestamp: d(0, 14), read: false, hasDeadline: true, deadlineDate: d(6) },
  { id: "11", sender: "LinkedIn Group", subject: "Discussion on AI trends", preview: "New discussion in your AI & ML group about latest trends in NLP.", platform: "linkedin", priority: "low", timestamp: d(-2, 18), read: true },
  { id: "12", sender: "Advisor", subject: "Schedule appointment", preview: "Please schedule your advising appointment for course registration before April 12th.", platform: "email", priority: "medium", timestamp: d(-1, 8), read: false, hasDeadline: true, deadlineDate: d(10) },
];

export const mockReminders: Reminder[] = mockMessages
  .filter((m) => m.hasDeadline && m.deadlineDate)
  .map((m) => ({
    id: `rem-${m.id}`,
    title: m.subject,
    description: `From ${m.sender} via ${m.platform}`,
    dateTime: m.deadlineDate!,
    messageId: m.id,
    completed: false,
  }));
