import { motion } from "motion/react";
import { Hammer, ShoppingBag, Palette } from "lucide-react";

export default function Splash() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-artisan-beige p-6"
    >
      <div className="relative mb-8">
         <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-32 h-32 bg-artisan-terracotta rounded-full flex items-center justify-center text-white shadow-2xl"
         >
            <Palette size={64} strokeWidth={1.5} />
         </motion.div>
         
         <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -right-4 w-12 h-12 bg-artisan-orange rounded-full flex items-center justify-center text-white shadow-lg"
         >
            <ShoppingBag size={24} />
         </motion.div>
         
         <motion.div
             animate={{ 
              x: [0, 10, 0],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-2 -left-6 w-14 h-14 bg-artisan-brown rounded-full flex items-center justify-center text-white shadow-lg"
         >
            <Hammer size={24} />
         </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <h1 className="text-5xl font-bold text-artisan-ink mb-2">Hasta-Kala</h1>
        <p className="text-artisan-terracotta text-sm font-bold tracking-[0.3em] uppercase">Smart Sales for Smart Artisans</p>
      </motion.div>

      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 200 }}
        transition={{ delay: 0.8, duration: 1.5 }}
        className="h-1 bg-artisan-brown/10 mt-12 rounded-full overflow-hidden"
      >
        <motion.div
          animate={{ x: [-200, 200] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-1/2 h-full bg-artisan-terracotta"
        />
      </motion.div>
    </motion.div>
  );
}
