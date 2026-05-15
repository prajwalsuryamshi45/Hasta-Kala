import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import { 
  TrendingUp, 
  IndianRupee, 
  Award, 
  AlertTriangle,
  PlusCircle,
  Package,
  BarChart2,
  Calendar
} from "lucide-react";
import { formatCurrency } from "../lib/utils";
import { motion } from "motion/react";
import { Screen } from "../App";

interface DashboardProps {
  onNavigate: (screen: Screen) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const salesToday = useLiveQuery(
    () => db.sales.where("saleDate").above(startOfDay.getTime()).toArray()
  );

  const products = useLiveQuery(() => db.products.toArray());
  
  const lowStockCount = products?.filter(p => p.stockQuantity < 5).length || 0;
  
  const totalIncome = salesToday?.reduce((sum, s) => sum + s.totalAmount, 0) || 0;
  const totalItemsSold = salesToday?.reduce((sum, s) => sum + s.quantitySold, 0) || 0;

  // Best selling product calculation
  const bestSeller = useLiveQuery(async () => {
    const allSales = await db.sales.toArray();
    const productStats: Record<number, number> = {};
    allSales.forEach(s => {
      productStats[s.productId] = (productStats[s.productId] || 0) + s.quantitySold;
    });
    
    let bestId = -1;
    let maxQty = 0;
    for (const [id, qty] of Object.entries(productStats)) {
      if (qty > maxQty) {
        maxQty = qty;
        bestId = Number(id);
      }
    }
    
    if (bestId === -1) return null;
    return await db.products.get(bestId);
  }, []);

  const stats = [
    { label: "Sales Today", value: totalItemsSold, icon: TrendingUp, color: "bg-orange-50 text-artisan-terracotta" },
    { label: "Income Today", value: formatCurrency(totalIncome), icon: IndianRupee, color: "bg-brown-50 text-artisan-brown" },
    { label: "Best Seller", value: bestSeller?.name || "None", icon: Award, color: "bg-yellow-50 text-orange-600" },
    { label: "Low Stock", value: lowStockCount, icon: AlertTriangle, color: lowStockCount > 0 ? "bg-red-50 text-red-600" : "bg-gray-50 text-artisan-muted" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <header className="flex justify-between items-center">
        <div>
          <p className="text-artisan-muted font-bold text-[10px] uppercase tracking-widest">Good Morning, Artisan</p>
          <h1 className="text-4xl font-bold text-artisan-ink">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</h1>
        </div>
        <div className="w-12 h-12 rounded-full bg-artisan-terracotta border-2 border-white shadow-artisan flex items-center justify-center overflow-hidden">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Artisan" alt="avatar" />
        </div>
      </header>

      <section className="grid grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-5 rounded-[2rem] shadow-artisan border border-artisan-brown/5 flex flex-col items-start space-y-4"
          >
            <div className={`p-3 rounded-2xl ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-artisan-muted mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-artisan-ink truncate w-32 leading-none">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold px-1 text-artisan-brown">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-3">
            {[
                { label: 'Bill', icon: PlusCircle, screen: 'billing' },
                { label: 'Item', icon: Package, screen: 'products' },
                { label: 'Stats', icon: BarChart2, screen: 'analytics' },
                { label: 'Stock', icon: Calendar, screen: 'inventory' },
            ].map((action, i) => (
                <button 
                  key={action.label}
                  onClick={() => onNavigate(action.screen as Screen)}
                  className="bg-white p-4 rounded-2xl shadow-artisan border border-artisan-brown/5 flex flex-col items-center space-y-2 hover:bg-artisan-terracotta hover:text-white transition-all group active:scale-95"
                >
                    <action.icon size={22} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-bold uppercase tracking-tighter">{action.label}</span>
                </button>
            ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
            <h2 className="text-xl font-bold text-artisan-brown">Recent Sales</h2>
            <button 
                onClick={() => onNavigate('income-log')}
                className="text-artisan-terracotta text-xs font-bold uppercase tracking-widest hover:underline"
            >
                View Log
            </button>
        </div>
        
        <div className="space-y-3">
            {salesToday?.length === 0 ? (
                <div className="bg-white/50 border-2 border-dashed border-artisan-brown/10 rounded-[2.5rem] p-10 text-center text-artisan-muted">
                    <p className="font-serif italic text-lg leading-relaxed">No sales recorded today.<br/>Time to craft something special!</p>
                </div>
            ) : (
                salesToday?.slice(0, 5).reverse().map((sale, i) => (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={sale.id} 
                        className="bg-white p-4 rounded-3xl flex items-center justify-between shadow-artisan border border-artisan-brown/5"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-artisan-beige rounded-2xl flex items-center justify-center font-serif font-bold text-artisan-terracotta text-lg border border-artisan-brown/10">
                                {sale.quantitySold}
                            </div>
                            <div>
                                <p className="font-bold text-artisan-ink">{sale.productName}</p>
                                <p className="text-[10px] text-artisan-muted font-bold uppercase tracking-widest">{new Date(sale.saleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                        <p className="font-bold text-artisan-ink text-lg font-serif">{formatCurrency(sale.totalAmount)}</p>
                    </motion.div>
                ))
            )}
        </div>
      </section>
      
      {lowStockCount > 0 && (
        <section className="bg-white border-2 border-red-100 shadow-artisan rounded-[2.5rem] p-6 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
                <AlertTriangle size={24} />
                <h3 className="font-bold text-lg uppercase tracking-wider">Low Stock Inventory</h3>
            </div>
            <div className="space-y-3">
                {products?.filter(p => p.stockQuantity < 5).map(p => (
                    <div key={p.id} className="flex justify-between items-center p-3 bg-red-50 rounded-2xl">
                        <span className="font-bold text-sm text-red-900">{p.name} - {p.color}</span>
                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">Only {p.stockQuantity} Left</span>
                    </div>
                ))}
            </div>
            <button 
                onClick={() => onNavigate('inventory')}
                className="w-full bg-artisan-terracotta text-white rounded-[2rem] py-4 text-xs font-bold uppercase tracking-[0.2em] mt-2 shadow-lg active:scale-95 transition-transform"
            >
                Restock Inventory
            </button>
        </section>
      )}
    </div>
  );
}
