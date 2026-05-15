import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import { 
  ArrowLeft,
  Calendar,
  FileText,
  Download,
  Filter
} from "lucide-react";
import { formatCurrency, cn } from "../lib/utils";
import { motion } from "motion/react";
import { Screen } from "../App";
import { subDays, subWeeks, subMonths, isAfter } from "date-fns";

interface IncomeLogProps {
  onNavigate: (screen: Screen) => void;
}

export default function IncomeLog({ onNavigate }: IncomeLogProps) {
  const [filter, setFilter] = useState<'today' | 'week' | 'month'>('today');
  
  const sales = useLiveQuery(() => {
    let since = new Date();
    if (filter === 'today') since.setHours(0,0,0,0);
    else if (filter === 'week') since = subWeeks(new Date(), 1);
    else if (filter === 'month') since = subMonths(new Date(), 1);
    
    return db.sales.filter(s => s.saleDate >= since.getTime()).toArray();
  }, [filter]);

  const totalIncome = sales?.reduce((sum, s) => sum + s.totalAmount, 0) || 0;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <header className="flex items-center space-x-4">
        <button 
          onClick={() => onNavigate('dashboard')}
          className="p-2 bg-white rounded-xl shadow-sm text-gray-400"
        >
            <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold">Income Log</h1>
      </header>

      <section className="bg-artisan-brown text-white p-6 rounded-[2.5rem] shadow-xl shadow-artisan-brown/20">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Total {filter} Income</p>
        <p className="text-4xl font-bold">{formatCurrency(totalIncome)}</p>
      </section>

      <div className="flex space-x-2">
        {(['today', 'week', 'month'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "flex-1 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest border transition-all",
              filter === f 
                ? "bg-artisan-terracotta border-artisan-terracotta text-white shadow-md shadow-artisan-terracotta/20" 
                : "bg-white border-artisan-brown/5 text-gray-400"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {sales?.length === 0 ? (
          <div className="py-12 text-center text-gray-400 font-serif italic">
            No sales recorded for this period.
          </div>
        ) : (
          sales?.slice().reverse().map((sale, i) => (
            <motion.div 
              key={sale.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-4 rounded-2xl flex items-center justify-between border border-artisan-brown/5 shadow-sm"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-artisan-beige rounded-xl flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase leading-none">{new Date(sale.saleDate).toLocaleDateString('en-IN', { month: 'short' })}</span>
                    <span className="text-lg font-bold text-artisan-terracotta leading-none mt-1">{new Date(sale.saleDate).getDate()}</span>
                </div>
                <div>
                    <h3 className="font-bold text-sm">{sale.productName}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Qty: {sale.quantitySold} • {new Date(sale.saleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <p className="font-bold text-artisan-ink">{formatCurrency(sale.totalAmount)}</p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
