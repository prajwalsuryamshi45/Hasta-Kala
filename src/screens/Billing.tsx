import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Product, Sale } from "../db";
import { Search, Plus, Minus, X, Check, ShoppingBag } from "lucide-react";
import { formatCurrency, cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Screen } from "../App";

interface BillingProps {
  onNavigate: (screen: Screen) => void;
}

export default function Billing({ onNavigate }: BillingProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const products = useLiveQuery(() => 
    db.products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    ).toArray()
  , [searchTerm]);

  const handleAddSale = async () => {
    if (!selectedProduct || !selectedProduct.id) return;
    
    if (selectedProduct.stockQuantity < quantity) {
      alert("Not enough stock!");
      return;
    }

    const totalAmount = selectedProduct.price * quantity;
    
    const sale: Sale = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantitySold: quantity,
      totalAmount,
      saleDate: Date.now()
    };

    await db.transaction('rw', db.products, db.sales, async () => {
      await db.sales.add(sale);
      await db.products.update(selectedProduct.id!, {
        stockQuantity: selectedProduct.stockQuantity! - quantity
      });
    });

    setShowSuccess(true);
    setSelectedProduct(null);
    setQuantity(1);
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-artisan-ink">Quick Billing</h1>
        <button onClick={() => onNavigate('dashboard')} className="p-3 bg-white rounded-2xl shadow-artisan text-artisan-muted border border-artisan-brown/5 active:scale-90 transition-transform">
          <X size={20} />
        </button>
      </header>

      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-artisan-muted" size={18} />
        <input 
          type="text" 
          placeholder="Search items by name or category..." 
          className="w-full bg-white rounded-[2rem] py-5 pl-14 pr-6 shadow-artisan border border-artisan-brown/5 focus:outline-none focus:ring-4 focus:ring-artisan-terracotta/5 text-sm font-bold text-artisan-ink placeholder:text-artisan-muted/50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {products?.map((product) => (
          <motion.button
            key={product.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (product.stockQuantity > 0) {
                setSelectedProduct(product);
                setQuantity(1);
              }
            }}
            className={cn(
                "bg-white rounded-[2.5rem] overflow-hidden shadow-artisan border border-artisan-brown/5 flex flex-col items-start relative group transition-all",
                product.stockQuantity === 0 && "opacity-50 grayscale"
            )}
          >
            <div className="w-full aspect-square bg-artisan-beige relative overflow-hidden">
              <img 
                src={product.imageUri || "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=200"} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                alt={product.name}
              />
              <div className="absolute top-3 right-3 bg-artisan-ink text-white px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-lg">
                STK: {product.stockQuantity}
              </div>
            </div>
            <div className="p-5 text-left w-full">
              <p className="text-[9px] text-artisan-terracotta font-bold uppercase tracking-[0.2em] mb-1">{product.category}</p>
              <h3 className="font-bold text-sm text-artisan-ink truncate leading-tight mb-2">{product.name}</h3>
              <p className="font-bold text-artisan-ink text-lg font-serif">{formatCurrency(product.price)}</p>
            </div>
            {product.stockQuantity === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-artisan-ink/40 backdrop-blur-[1px] text-white font-bold text-[10px] uppercase tracking-widest rotate-12">
                   Sold Out
                </div>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedProduct(null)}
               className="fixed inset-0 bg-artisan-ink/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-artisan-beige rounded-t-[3.5rem] p-10 z-[101] shadow-2xl max-w-md mx-auto border-t-2 border-artisan-terracotta/10"
            >
              <div className="w-12 h-1 bg-artisan-brown/20 rounded-full mx-auto mb-10" />
              
              <div className="flex items-center space-x-6 mb-10">
                <div className="w-28 h-28 rounded-[2rem] overflow-hidden flex-shrink-0 shadow-xl border-4 border-white">
                  <img 
                    src={selectedProduct.imageUri || "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=200"} 
                    className="w-full h-full object-cover" 
                    alt={selectedProduct.name}
                  />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-1 leading-tight text-artisan-ink">{selectedProduct.name}</h2>
                  <p className="text-artisan-terracotta font-bold uppercase tracking-widest text-[10px] mb-3">{selectedProduct.category} • {selectedProduct.color}</p>
                  <p className="text-3xl font-bold text-artisan-ink font-serif">{formatCurrency(selectedProduct.price)}</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between bg-white p-6 rounded-[2.5rem] shadow-artisan border border-artisan-brown/5">
                  <p className="font-bold text-[10px] uppercase tracking-widest text-artisan-muted">Select Units</p>
                  <div className="flex items-center space-x-8">
                    <button 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-12 h-12 rounded-full border-2 border-artisan-brown/10 flex items-center justify-center text-artisan-ink hover:bg-artisan-brown hover:text-white transition-all active:scale-90"
                    >
                      <Minus size={20} />
                    </button>
                    <span className="text-3xl font-bold w-6 text-center text-artisan-ink">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(q => Math.min(selectedProduct.stockQuantity!, q + 1))}
                      className="w-12 h-12 rounded-full bg-artisan-terracotta flex items-center justify-center text-white shadow-lg shadow-artisan-terracotta/30 active:scale-90 transition-all"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between px-4">
                    <span className="font-serif italic text-artisan-muted text-lg">Total Due</span>
                    <span className="text-4xl font-bold text-artisan-terracotta font-serif">{formatCurrency(selectedProduct.price * quantity)}</span>
                </div>

                <button 
                  onClick={handleAddSale}
                  className="w-full bg-artisan-ink text-white rounded-[2rem] py-6 font-bold text-lg shadow-2xl flex items-center justify-center space-x-3 active:scale-95 transition-transform"
                >
                  <ShoppingBag size={24} />
                  <span>Finalize Transaction</span>
                </button>
                <div className="h-4" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-28 left-4 right-4 bg-green-600 text-white p-4 rounded-3xl shadow-2xl flex items-center space-x-3 z-50 max-w-md mx-auto font-bold uppercase tracking-wider text-sm"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Check size={20} />
            </div>
            <span>Sale recorded successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
