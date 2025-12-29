import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, AlertCircle, Bot, User } from "lucide-react";

// ✅ 1. Import all the new components we need
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// ✅ 2. Define the Message interface (crucial fix)
interface Message {
  sender: 'user' | 'bot';
  content: string;
}

// Define type for a single conversation
interface IConversation {
  _id: string;
  messages: Message[]; // ✅ 3. Use the correct Message interface
  updatedAt: string;
}

const History = () => {
  const [conversations, setConversations] = useState<IConversation[] | null>(null);
  const [loading, setLoading] = useState(true);
  // ✅ 4. We removed useNavigate, as we're not linking away anymore

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/history', {
          headers: { 'x-auth-token': token || '' }
        });
        if (!response.ok) throw new Error('Failed to fetch history');
        
        // This now correctly fetches the full conversation data
        const data: { conversations: IConversation[] } = await response.json();
        
        setConversations(data.conversations);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);
  
  // (Animation variants are unchanged)
  const containerVariants = { /* ... */ };
  const itemVariants = { /* ... */ };

  if (loading) {
    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold mb-4 flex items-center">
              <MessageSquare className="mr-3 h-8 w-8" /> Conversation History
            </h1>
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }

  return (
    <div>
        <h1 className="text-3xl font-bold mb-4 flex items-center">
          <MessageSquare className="mr-3 h-8 w-8" /> Conversation History
        </h1>
        
        <Card>
            <CardHeader>
                <CardTitle>Your Past Chats</CardTitle>
                <CardDescription>Click on a conversation to expand it and see the full chat.</CardDescription>
            </CardHeader>
            <CardContent>
                {conversations && conversations.length > 0 ? (
                  
                // ✅ 5. Replace the <motion.ul> with <Accordion>
                <Accordion type="single" collapsible className="w-full">
                    {conversations.map(convo => (
                      <AccordionItem value={convo._id} key={convo._id}>
                        <AccordionTrigger className="p-4 hover:bg-muted/50">
                          <div>
                            <p className="font-medium text-left truncate">"{convo.messages[0]?.content ?? 'Empty conversation'}"</p>
                            <p className="text-sm text-left text-muted-foreground">Last updated: {new Date(convo.updatedAt).toLocaleString()}</p>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-0">
                          {/* ✅ 6. Add a ScrollArea for the chat history */}
                          <ScrollArea className="h-72 w-full">
                            <div className="space-y-4 p-4">
                              
                              {/* ✅ 7. Map over messages and render chat bubbles */}
                              {convo.messages.map((message, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className={`flex items-end gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                  {message.sender === 'bot' && (
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback><Bot size={20} /></AvatarFallback>
                                    </Avatar>
                                  )}
                                  <div
                                    className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl ${
                                      message.sender === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-br-none'
                                        : 'bg-muted rounded-bl-none'
                                    }`}
                                  >
                                    {message.content}
                                  </div>
                                  {message.sender === 'user' && (
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback><User size={20} /></AvatarFallback>
                                    </Avatar>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </ScrollArea>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
                ) : <EmptyState message="No conversation history found." />}
            </CardContent>
        </Card>
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg bg-muted/20">
    <AlertCircle className="w-12 h-12 text-muted-foreground/50 mb-4" />
    <p className="text-muted-foreground">{message}</p>
  </div>
);

export default History;