import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { MapPin, Settings, Calculator } from "lucide-react"
import type { ReactNode } from "react"

interface TabItem {
  id: string
  icon: ReactNode
  label: string
}

interface NavigationBarProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
  showDivider?: boolean
}

export function NavigationBar({
  tabs,
  activeTab,
  onTabChange,
  className,
  showDivider = true,
}: NavigationBarProps) {
  return (
    <motion.div
      className={cn(
        "fixed bottom-4 left-1/2 z-20 w-full max-w-sm -translate-x-1/2 px-4",
        className
      )}
      initial={{ y: 120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 22, stiffness: 220, delay: 0.3 }}
    >
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/65 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center justify-around p-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id

            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl p-2 transition-colors",
                  isActive ? "text-white" : "text-white/40 hover:text-white/70"
                )}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", damping: 15, stiffness: 300 }}
                >
                  {tab.icon}
                </motion.div>
                <span className="text-[10px]">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-1 h-0.5 w-8 rounded-full bg-white"
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  />
                )}
              </motion.button>
            )
          })}
          {showDivider && <div className="h-8 w-px bg-white/10" />}
        </div>
      </div>
    </motion.div>
  )
}

export const DEFAULT_TABS: TabItem[] = [
  {
    id: "map",
    icon: <MapPin size={20} />,
    label: "Mapa",
  },
  {
    id: "calculator",
    icon: <Calculator size={20} />,
    label: "Calculadora",
  },
  {
    id: "settings",
    icon: <Settings size={20} />,
    label: "Ajustes",
  },
]
