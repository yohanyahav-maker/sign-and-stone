import { useState, useRef, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2 } from "lucide-react";
import { useMessages } from "@/hooks/useMessages";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

interface ChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  clientName: string;
}

export function ChatDrawer({ open, onOpenChange, projectId, clientName }: ChatDrawerProps) {
  const { messages, isLoading, sendMessage } = useMessages(projectId);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage.mutate(trimmed);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl flex flex-col p-0" dir="rtl">
        <SheetHeader className="px-4 pt-4 pb-2 border-b">
          <SheetTitle className="text-right">צ׳אט – {clientName}</SheetTitle>
        </SheetHeader>

        {/* Messages area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : messages && messages.length > 0 ? (
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col items-end"
                >
                  <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary text-primary-foreground px-4 py-2 text-sm whitespace-pre-wrap">
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 ml-1">
                    {format(new Date(msg.created_at), "dd/MM HH:mm", { locale: he })}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <p className="text-center text-muted-foreground py-10 text-sm">
              אין הודעות עדיין. התחל לכתוב!
            </p>
          )}
        </div>

        {/* Input area */}
        <div className="border-t px-4 py-3 flex gap-2 items-end bg-background">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="כתוב הודעה..."
            className="min-h-[44px] max-h-[120px] resize-none text-sm rounded-xl"
            rows={1}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!text.trim() || sendMessage.isPending}
            className="shrink-0 h-11 w-11 rounded-xl"
          >
            {sendMessage.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
