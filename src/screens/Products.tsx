import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Product } from "../db";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Camera,
  X,
  ChevronDown
} from "lucide-react";
import { cn, formatCurrency } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

export default function Products() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const products = useLiveQuery(() => {
    let collection = db.products.toCollection();
    if (searchTerm) {
      collection = db.products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return collection.toArray().then(arr => {
      if (filterCategory !== "All") {
        return arr.filter(p => p.category === filterCategory);
      }
      return arr;
    });
  }, [searchTerm, filterCategory]);

  const categories = ["All", ...Array.from(new Set(products?.map(p => p.category) || []))];

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this product? All related sales data will remain but product details will be gone.")) {
      await db.products.delete(id);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Product Catalog</h1>
        <button 
            onClick={() => setShowAddModal(true)}
            className="w-12 h-12 bg-artisan-terracotta text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>
      </header>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search catalog..." 
            className="w-full bg-white rounded-2xl py-4 pl-12 pr-4 shadow-sm border border-artisan-brown/5 focus:outline-none text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={cn(
                        "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                        filterCategory === cat 
                            ? "bg-artisan-terracotta border-artisan-terracotta text-white shadow-md shadow-artisan-terracotta/20" 
                            : "bg-white border-artisan-brown/5 text-gray-500 hover:border-artisan-terracotta/20"
                    )}
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {products?.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-[2rem] p-4 shadow-sm border border-artisan-brown/5 flex space-x-4 items-center group"
          >
            <div className="w-20 h-20 rounded-2xl bg-artisan-beige flex-shrink-0 overflow-hidden relative">
              <img 
                src={p.imageUri || "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=200"} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                alt={p.name}
              />
              {p.stockQuantity < 5 && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg px-1.5 py-0.5 text-[8px] font-bold uppercase">Low</div>
              )}
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-[10px] text-artisan-terracotta font-bold uppercase tracking-widest truncate">{p.category} • {p.color}</p>
              <h3 className="font-bold text-base text-artisan-ink truncate mb-1">{p.name}</h3>
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg">{formatCurrency(p.price)}</span>
                <span className="text-[10px] font-bold bg-artisan-beige px-2 py-0.5 rounded-full text-gray-500">{p.stockQuantity} in stock</span>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
                <button 
                  onClick={() => setEditingProduct(p)}
                  className="p-2.5 bg-artisan-beige rounded-xl text-artisan-brown hover:bg-artisan-brown hover:text-white transition-colors"
                >
                    <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => p.id && handleDelete(p.id)}
                  className="p-2.5 bg-red-50 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                >
                    <Trash2 size={16} />
                </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {(showAddModal || editingProduct) && (
          <ProductFormModal 
            product={editingProduct} 
            onClose={() => {
                setShowAddModal(false);
                setEditingProduct(null);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductFormModal({ product, onClose }: { product: Product | null, onClose: () => void }) {
    const [formData, setFormData] = useState<Partial<Product>>(product || {
        name: "",
        category: "",
        color: "",
        price: 0,
        stockQuantity: 0,
        description: "",
        imageUri: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (product?.id) {
                await db.products.update(product.id, formData);
            } else {
                await db.products.add(formData as Product);
            }
            onClose();
        } catch (err) {
            console.error(err);
            alert("Error saving product.");
        }
    };

    return (
        <>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={onClose}
               className="fixed inset-0 bg-artisan-ink/60 backdrop-blur-sm z-[200]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-12 bottom-12 bg-artisan-beige rounded-[3rem] p-8 z-[201] shadow-2xl overflow-y-auto max-w-md mx-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">{product ? "Edit Item" : "Add New Item"}</h2>
                <button onClick={onClose} className="p-2 bg-white rounded-xl shadow-sm"><X size={20}/></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 pb-4">
                <div className="space-y-4">
                    <div className="w-full aspect-[4/3] bg-white rounded-3xl border-2 border-dashed border-artisan-brown/10 flex flex-col items-center justify-center text-gray-400 overflow-hidden relative group">
                        {formData.imageUri ? (
                            <img src={formData.imageUri} className="w-full h-full object-cover" alt="preview" />
                        ) : (
                            <>
                                <Camera size={32} className="mb-2" />
                                <span className="text-xs font-bold uppercase">Upload Image</span>
                            </>
                        )}
                        <input 
                            type="text" 
                            placeholder="Image URL" 
                            className="absolute bottom-4 left-4 right-4 bg-white/90 rounded-xl p-2 text-xs text-artisan-ink focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity"
                            value={formData.imageUri}
                            onChange={(e) => setFormData({...formData, imageUri: e.target.value})}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-2">Product Name</label>
                        <input 
                            required
                            type="text" 
                            className="w-full bg-white rounded-2xl py-3 px-4 shadow-sm border border-artisan-brown/5 focus:outline-none" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-2">Category</label>
                            <input 
                                required
                                type="text" 
                                className="w-full bg-white rounded-2xl py-3 px-4 shadow-sm border border-artisan-brown/5 focus:outline-none" 
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-2">Color/Style</label>
                            <input 
                                required
                                type="text" 
                                className="w-full bg-white rounded-2xl py-3 px-4 shadow-sm border border-artisan-brown/5 focus:outline-none" 
                                value={formData.color}
                                onChange={(e) => setFormData({...formData, color: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-2">Price (₹)</label>
                            <input 
                                required
                                type="number" 
                                className="w-full bg-white rounded-2xl py-3 px-4 shadow-sm border border-artisan-brown/5 focus:outline-none" 
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-2">Stock units</label>
                            <input 
                                required
                                type="number" 
                                className="w-full bg-white rounded-2xl py-3 px-4 shadow-sm border border-artisan-brown/5 focus:outline-none" 
                                value={formData.stockQuantity}
                                onChange={(e) => setFormData({...formData, stockQuantity: Number(e.target.value)})}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-2">Description</label>
                        <textarea 
                            rows={3}
                            className="w-full bg-white rounded-2xl py-3 px-4 shadow-sm border border-artisan-brown/5 focus:outline-none resize-none" 
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>
                </div>

                <div className="flex space-x-3 pt-2">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="flex-1 bg-white text-gray-400 py-4 rounded-2xl font-bold uppercase tracking-widest text-sm shadow-sm"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className="flex-2 bg-artisan-terracotta text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-sm shadow-lg"
                    >
                        Save Product
                    </button>
                </div>
              </form>
            </motion.div>
        </>
    );
}
