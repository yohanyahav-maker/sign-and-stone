import { useState, useRef, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Mic, Square, X, Play, Pause } from "lucide-react";
import { useMessages } from "@/hooks/useMessages";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface ChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  clientName: string;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function VoiceMessage({ url }: { url: string }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.addEventListener("loadedmetadata", () => setAudioDuration(audio.duration));
    audio.addEventListener("timeupdate", () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    });
    audio.addEventListener("ended", () => { setPlaying(false); setProgress(0); });
    return () => { audio.pause(); audio.src = ""; };
  }, [url]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); } else { audio.play(); }
    setPlaying(!playing);
  };

  return (
    <div className="flex items-center gap-2 min-w-[180px]">
      <button onClick={toggle} className="shrink-0 h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      <div className="flex-1 space-y-1">
        <div className="h-1.5 rounded-full bg-primary-foreground/20 overflow-hidden">
          <div className="h-full bg-primary-foreground/60 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-[10px] opacity-70">
          {audioDuration > 0 ? formatDuration(Math.round(audioDuration)) : "0:00"}
        </span>
      </div>
    </div>
  );
}

export function ChatDrawer({ open, onOpenChange, projectId, clientName }: ChatDrawerProps) {
  const { messages, isLoading, sendMessage, sendVoiceMessage } = useMessages(projectId);
  const { isRecording, duration, startRecording, stopRecording, cancelRecording } = useVoiceRecorder();
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch {
      toast.error("לא ניתן לגשת למיקרופון");
    }
  };

  const handleStopRecording = async () => {
    const blob = await stopRecording();
    if (blob && blob.size > 0) {
      sendVoiceMessage.mutate({ blob, projectId });
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
                    {msg.type === "voice" && msg.file_url ? (
                      <VoiceMessage url={msg.file_url} />
                    ) : (
                      msg.content
                    )}
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
          {isRecording ? (
            <div className="flex-1 flex items-center gap-3">
              <Button size="icon" variant="ghost" onClick={cancelRecording} className="shrink-0 h-11 w-11 rounded-xl text-destructive">
                <X className="h-5 w-5" />
              </Button>
              <div className="flex-1 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />
                <span className="text-sm font-medium text-foreground">{formatDuration(duration)}</span>
              </div>
              <Button
                size="icon"
                onClick={handleStopRecording}
                disabled={sendVoiceMessage.isPending}
                className="shrink-0 h-11 w-11 rounded-xl bg-destructive hover:bg-destructive/90"
              >
                {sendVoiceMessage.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Square className="h-4 w-4 fill-current" />
                )}
              </Button>
            </div>
          ) : (
            <>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="כתוב הודעה..."
                className="min-h-[44px] max-h-[120px] resize-none text-sm rounded-xl"
                rows={1}
              />
              {text.trim() ? (
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
              ) : (
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={handleStartRecording}
                  className="shrink-0 h-11 w-11 rounded-xl"
                >
                  <Mic className="h-5 w-5" />
                </Button>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
