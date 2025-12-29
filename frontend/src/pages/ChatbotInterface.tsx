import { useState, useEffect, useRef } from "react";
// Import useParams and useNavigate from react-router-dom
import { useParams, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// --- ✅ CORRECTED LINES ---
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
// --- END OF FIX ---

import { Send, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

// Define the structure for a single message
interface Message {
  sender: 'user' | 'bot';
  content: string;
}

const ChatbotInterface = () => {
  // Get URL param and navigate function
  const { conversationId: paramId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize state from the URL parameter
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(paramId || null);
  
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  // Add new useEffect to load conversation from URL
  useEffect(() => {
    const fetchConversation = async (id: string) => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5000/api/history/chat/${id}`, {
          headers: { "x-auth-token": token || "" }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch conversation.");
        }

        const conversation: { messages: Message[] } = await response.json();
        setMessages(conversation.messages); // Load the messages
        setCurrentConversationId(id); // Set the active ID
      } catch (error: any) {
        console.error("Fetch conversation error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load the selected conversation.",
        });
        navigate("/chat"); // Redirect to new chat on error
      } finally {
        setIsLoading(false);
      }
    };

    if (paramId) {
      // If there's an ID in the URL, fetch it
      fetchConversation(paramId);
    } else {
      // Otherwise, it's a new chat. Clear messages and ID.
      setMessages([]);
      setCurrentConversationId(null);
    }
  }, [paramId, navigate, toast]); // Re-run if the URL param changes

  // This function is for your history saving
  const saveChatHistory = async (userMessage: Message, botMessage: Message) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No auth token found, skipping history save");
      return;
    }
    try {
      // NOTE: This URL is for your history server
      const response = await fetch("http://localhost:5000/api/history/chat", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token
        },
        body: JSON.stringify({
          // Use the state variable
          conversationId: currentConversationId, 
          messages: [userMessage, botMessage]
        })
      });
      if (!response.ok) {
        console.error("Failed to save chat history:", response.status);
        return;
      }
      const data = await response.json();
      
      if (data._id) {
        // Always set the ID from the response
        setCurrentConversationId(data._id);
      
      }
    } catch (error) {
      console.error("Failed to save chat history:", error);
    }
  };

  // --- API CALL with your NGROK URL ---
  const handleSendMessage = async () => {
    if (inputText.trim() === "" || isLoading) return;

    const userMessage: Message = { sender: 'user', content: inputText };
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      // --- YOUR NGROK URL IS PASTED HERE ---
      const backendUrl = " https://pockier-jaquelyn-uncoordinately.ngrok-free.dev";
      const chatEndpoint = `${backendUrl}/chat`;
      
      console.log("📤 Sending prompt to Llama 2 (Colab) backend:", chatEndpoint);

      const formData = new FormData();
      formData.append("prompt", userMessage.content);

      const response = await fetch(chatEndpoint, {
        method: "POST",
        body: formData,
      });

      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("📦 Raw backend response:", data);

      const botResponse = data.response || "I apologize, but I couldn't generate a response.";
      const botMessage: Message = { sender: 'bot', content: botResponse };

      setMessages(prev => [...prev, botMessage]);
      saveChatHistory(userMessage, botMessage);

    } catch (error: any) {
      console.error("❌ Chat error:", error);

      const errorMessage: Message = {
        sender: 'bot',
        content: "⚠️ I'm having trouble connecting to the chat model. Please make sure the Colab server is running and the ngrok URL is correct."
      };
      setMessages(prev => [...prev, errorMessage]);

      toast({
        variant: "destructive",
        title: "Connection Error",
        description: error.message || "Unable to reach the chatbot service.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // --- UI remains the same ---
  return (
    <div className="h-full flex flex-col">
      <Card className="flex-grow flex flex-col shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Bot className="mr-3 text-primary" /> AI Assistant
          </CardTitle>
          <CardDescription>Ask me anything about skin conditions.</CardDescription>
        </CardHeader>

        <CardContent className="flex-grow p-0">
          <ScrollArea className="h-full px-4 py-2">
            <div className="space-y-4">
              {messages.length === 0 && !isLoading && ( // Hide intro if loading
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Hello! I'm your AI dermatology assistant.</p>
                  <p className="text-sm mt-2">Ask me anything about skin conditions.</p>
                </div>
              )}
              
              {messages.map((message, index) => (
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

              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-end gap-2 justify-start"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback><Bot size={20} /></AvatarFallback>
                    </Avatar>
                    <div className="p-3 rounded-2xl bg-muted rounded-bl-none">
                      <div className="flex items-center space-x-1">
                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* This empty div is the target for the auto-scroller */}
            <div ref={scrollAreaRef} />
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-4 border-t">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="flex w-full items-center space-x-2"
          >
            <Input
              type="text"
              placeholder="Type your message..."
              className="flex-grow"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !inputText.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ChatbotInterface;