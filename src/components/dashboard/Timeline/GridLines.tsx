interface GridLinesProps {
  count: number;
}

export function GridLines({ count }: GridLinesProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 w-[1px] bg-[#1e1e22] opacity-40"
          style={{ left: `${((i + 1) / (count + 1)) * 100}%` }}
        />
      ))}
    </div>
  );
}
