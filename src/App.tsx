/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { AnimatePresence, motion } from "motion/react";
import { db, seedDatabase } from "./db";
import { 
  Home, 
  ShoppingCart, 
  BarChart3, 
  Package, 
  Settings as SettingsIcon,
  Plus
} from "lucide-react";

// Screens
import Dashboard from "./screens/Dashboard";
import Billing from "./screens/Billing";
import Analytics from "./screens/Analytics";
import Inventory from "./screens/Inventory";
import Products from "./screens/Products";
import Settings from "./screens/Settings";
import Splash from "./screens/Splash";

// Components
import BottomNav from "./components/layout/BottomNav";

import IncomeLog from "./screens/IncomeLog";

export type Screen = 'dashboard' | 'billing' | 'analytics' | 'inventory' | 'products' | 'settings' | 'splash' | 'income-log';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      await seedDatabase();
      setIsInitialized(true);
      // Wait for splash animation
      setTimeout(() => {
        setCurrentScreen('dashboard');
      }, 2500);
    };
    init();
  }, []);

  if (!isInitialized) return <div className="h-screen w-screen bg-artisan-beige" />;

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentScreen} />;
      case 'billing': return <Billing onNavigate={setCurrentScreen} />;
      case 'analytics': return <Analytics />;
      case 'inventory': return <Inventory />;
      case 'products': return <Products />;
      case 'settings': return <Settings />;
      case 'income-log': return <IncomeLog onNavigate={setCurrentScreen} />;
      default: return <Dashboard onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-artisan-beige pb-24 text-artisan-ink relative overflow-x-hidden">
      <AnimatePresence mode="wait">
        {currentScreen === 'splash' ? (
          <Splash key="splash" />
        ) : (
          <motion.main
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md mx-auto px-4 pt-8"
          >
            {renderScreen()}
          </motion.main>
        )}
      </AnimatePresence>

      {currentScreen !== 'splash' && (
        <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />
      )}
      
      {/* Quick Add Floating Button (optional, but requested for Quick Billing) */}
      {currentScreen === 'dashboard' && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setCurrentScreen('billing')}
          className="fixed right-6 bottom-28 w-14 h-14 bg-artisan-terracotta text-white rounded-full shadow-lg flex items-center justify-center z-40 hover:bg-artisan-brown transition-colors"
        >
          <Plus size={28} />
        </motion.button>
      )}
    </div>
  );
}
