import { useEffect, useRef } from "react";
import { formatCurrency } from "@/lib/utils";

interface TotalCounterProps {
  totalAmount: number;
}

export default function TotalCounter({ totalAmount }: TotalCounterProps) {
  const previousAmount = useRef(0);
  const counterElement = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    if (counterElement.current) {
      animateCounter(previousAmount.current, totalAmount);
      previousAmount.current = totalAmount;
    }
  }, [totalAmount]);
  
  const animateCounter = (start: number, end: number) => {
    if (!counterElement.current) return;
    
    const duration = 1500;
    const startTime = performance.now();
    
    const updateCounter = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = start + (end - start) * easeOutExpo(progress);
      
      if (counterElement.current) {
        counterElement.current.textContent = formatCurrency(value);
      }
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };
    
    requestAnimationFrame(updateCounter);
  };
  
  const easeOutExpo = (x: number) => {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
  };

  return (
    <div className="flex justify-center my-6">
      <div className="bg-card dark:bg-card-foreground rounded-xl p-5 md:p-6 shadow-md border-2 border-transparent hover:border-primary transition-all duration-300 w-80 flex items-center justify-between">
        <div className="text-left">
          <span className="text-muted-foreground text-lg font-semibold">Totaal Boetes</span>
          <span
            ref={counterElement}
            className="text-3xl md:text-4xl font-extrabold text-primary dark:text-secondary block"
          >
            {formatCurrency(totalAmount)}
          </span>
        </div>
        <i className="fas fa-coins text-3xl md:text-4xl text-secondary"></i>
      </div>
    </div>
  );
}
