import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Delete } from "lucide-react";

interface CalculatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const buttons = [
  ["C", "⌫", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["00", "0", ".", "="],
];

export function CalculatorDialog({ open, onOpenChange }: CalculatorDialogProps) {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [resetNext, setResetNext] = useState(false);

  const handlePress = (key: string) => {
    if (key === "C") {
      setDisplay("0");
      setPrev(null);
      setOp(null);
      setResetNext(false);
      return;
    }

    if (key === "⌫") {
      setDisplay((d) => (d.length <= 1 ? "0" : d.slice(0, -1)));
      return;
    }

    if ("0123456789".includes(key) || key === "00") {
      if (resetNext) {
        setDisplay(key === "00" ? "0" : key);
        setResetNext(false);
      } else {
        setDisplay((d) => (d === "0" && key !== "00" ? key : d + key));
      }
      return;
    }

    if (key === ".") {
      if (resetNext) {
        setDisplay("0.");
        setResetNext(false);
      } else if (!display.includes(".")) {
        setDisplay((d) => d + ".");
      }
      return;
    }

    if (key === "%") {
      setDisplay(String(parseFloat(display) / 100));
      return;
    }

    if (["+", "−", "×", "÷"].includes(key)) {
      const current = parseFloat(display);
      if (prev !== null && op && !resetNext) {
        const result = calc(prev, current, op);
        setDisplay(formatNum(result));
        setPrev(result);
      } else {
        setPrev(current);
      }
      setOp(key);
      setResetNext(true);
      return;
    }

    if (key === "=") {
      if (prev !== null && op) {
        const current = parseFloat(display);
        const result = calc(prev, current, op);
        setDisplay(formatNum(result));
        setPrev(null);
        setOp(null);
        setResetNext(true);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px] p-4 rounded-2xl" dir="ltr">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">מחשבון</DialogTitle>
        </DialogHeader>

        {/* Display */}
        <div className="rounded-xl bg-secondary px-4 py-3 text-left min-h-[60px] flex flex-col justify-end">
          {prev !== null && op && (
            <p className="text-xs text-muted-foreground">{formatNum(prev)} {op}</p>
          )}
          <p className="text-3xl font-bold text-foreground truncate">{display}</p>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-4 gap-2 mt-2">
          {buttons.flat().map((key, i) => {
            const isOp = ["+", "−", "×", "÷"].includes(key);
            const isEquals = key === "=";
            const isClear = key === "C" || key === "⌫";

            return (
              <button
                key={`${key}-${i}`}
                onClick={() => handlePress(key)}
                className={`flex items-center justify-center rounded-xl text-lg font-bold h-14 transition-colors active:scale-95 ${
                  isEquals
                    ? "bg-primary text-primary-foreground hover:brightness-110"
                    : isOp
                    ? "bg-accent/20 text-accent-foreground hover:bg-accent/30"
                    : isClear
                    ? "bg-muted text-muted-foreground hover:bg-muted/80"
                    : "bg-card text-foreground hover:bg-secondary"
                }`}
                style={{ border: '1px solid var(--border-default)' }}
              >
                {key === "⌫" ? <Delete className="h-5 w-5" /> : key}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function calc(a: number, b: number, op: string): number {
  switch (op) {
    case "+": return a + b;
    case "−": return a - b;
    case "×": return a * b;
    case "÷": return b !== 0 ? a / b : 0;
    default: return b;
  }
}

function formatNum(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return parseFloat(n.toFixed(8)).toString();
}
