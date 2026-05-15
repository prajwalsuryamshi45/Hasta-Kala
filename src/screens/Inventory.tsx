import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Product } from "../db";
import { 
  Package, 
  History, 
  ArrowUpCircle, 
  AlertCircle,
  Plus,
  ChevronRight
} from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

export default function Inventory() {
  const [showRestock, setShowRestock] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState(1);
  const products = useLiveQuery(() => db.products.toArray());
  const logs = useLiveQuery(() => db.inventoryLogs.orderBy('date').reverse().limit(10).toArray());

  const totalStock = products?.reduce((sum, p) => sum + p.stockQuantity, 0) || 0;

  const handleRestock = async () => {
    if (!showRestock || !showRestock.id) return;
    
    const newStock = showRestock.stockQuantity + restockQty;
    
    await db.transaction('rw', db.products, db.inventoryLogs, async () => {
      await db.products.update(showRestock.id!, { stockQuantity: newStock });
      await db.inventoryLogs.add({
        productId: showRestock.id!,
        type: 'restock',
        quantityDelta: restockQty,
        previousStock: showRestock.stockQuantity,
        newStock,
        date: Date.now()
      });
    });

    setShowRestock(null);
    setRestockQty(1);
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold">Inventory</h1>
        <p className="text-artisan-brown/60 text-sm font-medium">Manage your craft stock</p>
      </header>

      <section className="bg-artisan-brown text-white p-6 rounded-[2.5rem] shadow-artisan flex justify-between items-center">
        <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-1">Total Stock</p>
            <p className="text-5xl font-bold font-serif">{totalStock}</p>
        </div>
        <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center border border-white/20">
            <Package size={32} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold px-1 text-artisan-brown">Stock Health</h2>
        <div className="space-y-4">
          {products?.map(p => {
            const percentage = Math.min(100, (p.stockQuantity / 20) * 100);
            const isLow = p.stockQuantity < 5;
            
            return (
              <div key={p.id} className="bg-white p-6 rounded-[2rem] shadow-artisan border border-artisan-brown/5 space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg text-artisan-ink">{p.name}</h3>
                        <p className="text-[10px] text-artisan-muted font-bold uppercase tracking-widest">{p.category} • {p.color}</p>
                    </div>
                    <button 
                      onClick={() => setShowRestock(p)}
                      className="w-10 h-10 bg-artisan-beige rounded-2xl text-artisan-terracotta flex items-center justify-center hover:bg-artisan-terracotta hover:text-white transition-all shadow-sm active:scale-90"
                    >
                        <Plus size={20} />
                    </button>
                </div>
                
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1">
                        <span className={cn(isLow ? "text-red-500" : "text-artisan-muted")}>
                            {isLow ? "Low Stock Warning" : "Healthy Level"}
                        </span>
                        <span className="text-artisan-ink">{p.stockQuantity} Left</span>
                    </div>
                    <div className="h-2.5 w-full bg-artisan-beige rounded-full overflow-hidden border border-artisan-brown/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            p.stockQuantity === 0 ? "bg-red-400" : 
                            isLow ? "bg-red-500" : 
                            percentage < 50 ? "bg-artisan-orange" : "bg-artisan-terracotta"
                          )}
                        />
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center space-x-2 px-1">
            <History size={18} className="text-artisan-brown" />
            <h2 className="text-xl font-bold text-artisan-brown">Activity Log</h2>
        </div>
        <div className="space-y-2">
            {logs?.map((log, i) => (
                <div key={log.id} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-artisan-brown/5 shadow-artisan">
                    <div className="flex items-center space-x-3">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center border",
                            log.type === 'restock' ? "bg-green-50 border-green-100 text-green-600" : "bg-orange-50 border-orange-100 text-artisan-terracotta"
                        )}>
                            {log.type === 'restock' ? <ArrowUpCircle size={18} /> : <ChevronRight size={18} />}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-artisan-ink leading-tight mb-0.5">
                                {log.type === 'restock' ? "Stock Added" : "Inventory Sold"}
                            </p>
                            <p className="text-[9px] text-artisan-muted font-bold uppercase tracking-widest">{new Date(log.date).toLocaleDateString()} • {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className={cn(
                            "font-bold text-sm",
                            log.type === 'restock' ? "text-green-600" : "text-artisan-terracotta"
                        )}>
                            {log.type === 'restock' ? `+${log.quantityDelta}` : `-${Math.abs(log.quantityDelta)}`}
                        </p>
                        <p className="text-[8px] font-bold text-artisan-muted uppercase">Units</p>
                    </div>
                </div>
            ))}
        </div>
      </section>

      <AnimatePresence>
        {showRestock && (
          <>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowRestock(null)}
               className="fixed inset-0 bg-artisan-ink/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 bg-artisan-beige rounded-t-[3rem] p-8 z-[101] shadow-2xl max-w-md mx-auto border-t-2 border-artisan-terracotta/10 px-10"
            >
              <div className="w-12 h-1 bg-artisan-brown/20 rounded-full mx-auto mb-10" />
              <h2 className="text-3xl font-bold mb-8 text-center text-artisan-ink">Restock Units</h2>
              
              <div className="flex items-center justify-center space-x-10 mb-10">
                <button 
                  onClick={() => setRestockQty(q => Math.max(1, q - 1))}
                  className="w-14 h-14 rounded-full border-2 border-artisan-brown/10 flex items-center justify-center text-artisan-ink text-2xl font-bold hover:bg-artisan-brown hover:text-white transition-colors"
                >
                  -
                </button>
                <div className="text-center">
                    <p className="text-6xl font-bold text-artisan-ink font-serif">{restockQty}</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-artisan-muted mt-2">New Units</p>
                </div>
                <button 
                  onClick={() => setRestockQty(q => q + 1)}
                  className="w-14 h-14 rounded-full bg-artisan-terracotta flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-artisan-terracotta/20"
                >
                  +
                </button>
              </div>

              <button 
                onClick={handleRestock}
                className="w-full bg-artisan-terracotta text-white rounded-[2rem] py-6 font-bold text-lg shadow-xl shadow-artisan-terracotta/20 active:scale-95 transition-transform"
              >
                Confirm Inventory Update
              </button>
              <div className="h-6" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
