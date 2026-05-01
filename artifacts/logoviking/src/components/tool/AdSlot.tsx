interface AdSlotProps {
  position: "top" | "mid" | "bottom";
}

export function AdSlot({ position }: AdSlotProps) {
  const heights = { top: "h-20", mid: "h-28", bottom: "h-20" } as const;
  return (
    <div className={`w-full ${heights[position]} my-6 rounded-lg border border-dashed border-border/60 bg-muted/20 flex items-center justify-center text-xs uppercase tracking-widest text-muted-foreground/60 select-none`}>
      Advertisement
    </div>
  );
}
