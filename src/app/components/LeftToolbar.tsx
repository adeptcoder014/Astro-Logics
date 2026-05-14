import { MousePointer2, Crosshair, LineChart, BarChart3, Moon, Sparkles, Orbit } from 'lucide-react';

export default function LeftToolbar() {
  return (
    <aside className="w-14 border-r border-rose-200 bg-gradient-to-b from-purple-50 to-rose-50 flex flex-col items-center py-4 gap-6">
      <div className="p-2 bg-gradient-to-r from-amber-400 to-rose-400 rounded-lg mb-4 shadow-[0_0_15px_rgba(251,146,60,0.3)]">
        <Orbit size={20} className="text-white" />
      </div>
      <div className="flex flex-col gap-4 text-gray-500">
        <MousePointer2 size={18} className="cursor-pointer hover:text-amber-600 transition" />
        <Crosshair size={18} className="text-amber-600" />
        <LineChart size={18} className="cursor-pointer hover:text-amber-600 transition" />
        <BarChart3 size={18} className="cursor-pointer hover:text-amber-600 transition" />
        <div className="h-px w-6 bg-rose-200 my-2" />
        <Moon size={18} className="cursor-pointer hover:text-purple-600 transition" />
        <Sparkles size={18} className="cursor-pointer hover:text-purple-600 transition" />
      </div>
    </aside>
  );
}
