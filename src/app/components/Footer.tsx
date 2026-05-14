export default function Footer() {
  return (
    <footer className="h-8 border-t border-rose-200 bg-gradient-to-r from-purple-100 to-rose-100 flex items-center px-4 justify-between text-[10px] font-mono text-gray-600">
      <div className="flex gap-6">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Server: Mars-1</span>
        <span>Delay: 12ms</span>
      </div>
      <div className="flex gap-4 uppercase font-bold tracking-tighter">
        <span className="text-amber-600">Ascendant: Leo</span>
        <span className="text-purple-600">Midheaven: Scorpio</span>
      </div>
    </footer>
  );
}
