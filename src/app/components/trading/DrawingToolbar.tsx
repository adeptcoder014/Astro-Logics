// --- SUB-COMPONENT: DRAWING TOOLS ---
export default function DrawingToolbar({ activeTool, setActiveTool }: { activeTool: string; setActiveTool: (t: string) => void }) {
  const tools = [
    { id: "cursor", icon: MousePointer, tooltip: "Crosshair" },
    { id: "trend", icon: TrendingUp, tooltip: "Trend Line" },
    { id: "fib", icon: LineChart, tooltip: "Fibonacci" },
    { id: "channels", icon: Layers, tooltip: "Channels" },
    { id: "indicators", icon: Activity, tooltip: "Indicators" },
  ];

  return (
    <div className="w-11 border-r border-zinc-800 bg-[#1c1c1e] flex flex-col items-center py-2 justify-between h-full z-20">
      <div className="flex flex-col gap-1 w-full px-1">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              title={t.tooltip}
              className={`w-full aspect-square flex items-center justify-center rounded transition relative group ${activeTool === t.id ? "bg-zinc-800 text-sky-400" : "text-zinc-400 hover:bg-zinc-800"
                }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
      <button onClick={() => alert("Canvas cleared")} className="text-zinc-500 hover:text-rose-400 p-2">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}