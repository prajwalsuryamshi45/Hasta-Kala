import { motion } from "motion/react";
import { 
  Home, 
  ShoppingCart, 
  BarChart3, 
  Package, 
  Settings as SettingsIcon
} from "lucide-react";
import { Screen } from "../../App";
import { cn } from "../../lib/utils";

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export default function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'billing', icon: ShoppingCart, label: 'Sales' },
    { id: 'analytics', icon: BarChart3, label: 'Charts' },
    { id: 'inventory', icon: Package, label: 'Stock' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-24 bg-white border-t border-artisan-brown/5 flex items-center justify-around px-4 z-50 shadow-[0_-8px_30px_rgba(139,69,19,0.05)] rounded-t-[2.5rem]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentScreen === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as Screen)}
            className={cn(
              "flex flex-col items-center justify-center relative w-16 h-16 rounded-2xl transition-all",
              isActive ? "text-artisan-terracotta" : "text-artisan-muted hover:text-artisan-brown"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="nav-bg"
                className="absolute inset-x-0 -bottom-2 h-1 bg-artisan-terracotta rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Icon size={24} className={cn("relative z-10 transition-all", isActive && "scale-110 -translate-y-1")} />
            <span className={cn(
              "text-[8px] font-bold mt-1 uppercase tracking-[0.2em] relative z-10 transition-all",
              isActive ? "opacity-100" : "opacity-40"
            )}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
