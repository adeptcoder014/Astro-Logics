
const tabs = [
  { id: 'Trading', label: 'Market Orbit' },
  { id: 'Nativity', label: 'Origin Chart' },
  { id: 'Mundane', label: 'Mundane Logs' }
];
import { Layers } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import NativityChart from './tabs/NativityChart';
import MundaneChart from './tabs/MundaneChart';
import TradingChart from './tabs/TradingChart';
export const NavigationTab = () => {
  // ==========================================================================================
  const [activeTab, setActiveTab] = useState('Nativity');
  const [asset, setAsset] = useState('BTCUSDT');
  console.log('activeTab', activeTab)
  // ==========================================================================================
  return (

    <>
      <div className="flex items-center px-4 mb-3 gap-6 h-12">
        <div className="flex items-center text-[var(--color-ring-bronze)] mr-4">
          <Layers size={16} className="mr-2 opacity-50" />
          <span className="text-[10px] font-black uppercase tracking-widest">Modules</span>
        </div>

        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative group py-2"
          >
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === tab.id
              ? 'text-[var(--color-primary-light)]'
              : 'text-[var(--color-ring-bronze)]/40 group-hover:text-[var(--color-accent-glow)]'
              }`}>
              {tab.label}
            </span>

            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[var(--color-accent-orange)]"
              />
            )}
          </button>
        ))}
        {/* Dynamic Asset Label in the light theme */}
        <div className="absolute top-6 right-8 z-20">
          <div className="bg-[var(--color-primary-dark)] text-[var(--color-primary-light)] px-4 py-1.5 rounded-full text-[10px] font-black tracking-tighter flex items-center shadow-lg">
            <span className="w-1 h-1 bg-[var(--color-accent-orange)] rounded-full mr-2 animate-ping" />
            {activeTab === 'Trading' ? asset : activeTab.toUpperCase()}
          </div>
        </div>

      </div>
      <div className="relative z-10 h-full w-full text-[var(--color-primary-dark)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "circOut" }}
            className="h-full w-full p-4"
          >
            {activeTab === 'Trading' && <TradingChart />}
            {activeTab === 'Nativity' && <NativityChart />}
            {activeTab === 'Mundane' && <MundaneChart />}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  )
}

// ==========================================================================================
// ==========================================================================================
