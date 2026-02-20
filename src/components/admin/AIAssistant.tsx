
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, Sparkles, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIAssistant = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI Analytics Assistant. I can analyze your request data, patient records, and operational metrics. Ask me anything — for example:\n\n• "Show me request trends for January 2025"\n• "How many requests per specialty this month?"\n• "What is the average approval time?"\n\nI have access to your system data and can search by date, doctor, hospital, MRN, and more.',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    "Analyze request trends by specialty",
    "Show overdue requests summary",
    "Average approval time by hospital",
    "Top doctors by request volume",
    "Monthly performance overview"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const gatherContextData = () => {
    try {
      const requests = JSON.parse(localStorage.getItem('medical_requests') || '[]');
      const users = JSON.parse(localStorage.getItem('enhancedUserManagementUsers') || '[]');
      const auditTrail = JSON.parse(localStorage.getItem('audit_trail') || '[]');

      return {
        totalRequests: requests.length,
        requestsSample: requests.slice(0, 50).map((r: any) => ({
          id: r.id,
          patientName: r.patientName,
          mrn: r.hospitalMRN,
          service: r.serviceDescription,
          hospital: r.hospitalName,
          doctor: r.doctorName,
          specialty: r.specialty,
          status: r.status,
          dateCreated: r.dateCreated,
          expectedSurgeryDate: r.expectedSurgeryDate,
          paymentStatus: r.paymentStatus,
        })),
        totalUsers: users.length,
        userCategories: users.reduce((acc: any, u: any) => {
          acc[u.category] = (acc[u.category] || 0) + 1;
          return acc;
        }, {}),
        recentAuditEntries: auditTrail.slice(0, 20),
        statusDistribution: requests.reduce((acc: any, r: any) => {
          acc[r.status || 'unknown'] = (acc[r.status || 'unknown'] || 0) + 1;
          return acc;
        }, {}),
        hospitalDistribution: requests.reduce((acc: any, r: any) => {
          const h = r.hospitalName || 'Unknown';
          acc[h] = (acc[h] || 0) + 1;
          return acc;
        }, {}),
      };
    } catch {
      return { error: "Could not load local data" };
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage("");
    setIsLoading(true);

    let assistantContent = "";

    try {
      const contextData = gatherContextData();
      const chatMessages = updatedMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-analytics`;

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: chatMessages, contextData }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${resp.status}`);
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant' && last.id.startsWith('stream-')) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
                }
                return [...prev, { id: 'stream-' + Date.now(), role: 'assistant', content: assistantContent, timestamp: new Date() }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw || raw.startsWith(":") || raw.trim() === "" || !raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant' && last.id.startsWith('stream-')) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
                }
                return [...prev, { id: 'stream-' + Date.now(), role: 'assistant', content: assistantContent, timestamp: new Date() }];
              });
            }
          } catch { /* ignore */ }
        }
      }

      if (!assistantContent) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'I received your request but couldn\'t generate a response. Please try again.',
          timestamp: new Date()
        }]);
      }
    } catch (err: any) {
      console.error("AI Assistant error:", err);
      toast({ title: "AI Error", description: err.message || "Failed to get AI response", variant: "destructive" });
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message}. Please try again.`,
        timestamp: new Date()
      }]);
    }

    setIsLoading(false);
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          AI Analytics Assistant
          <Badge className="ml-2" />
        </CardTitle>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Database className="w-3 h-3" /> Connected to local + database data
        </p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3 overflow-hidden">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4" ref={scrollRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-medium">AI Assistant</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && !messages[messages.length - 1]?.id.startsWith('stream-') && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    <span className="text-sm">Analyzing your data...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Suggested Prompts */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Quick queries:</p>
          <div className="flex flex-wrap gap-1">
            {suggestedPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setInputMessage(prompt)}
                className="text-xs h-7"
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about requests, trends, performance by date, doctor, hospital..."
            className="min-h-[40px] max-h-[80px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Small Badge component inline
const Badge = ({ className }: { className?: string }) => (
  <span className={`text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium ${className}`}>
    Live Data
  </span>
);

export default AIAssistant;
