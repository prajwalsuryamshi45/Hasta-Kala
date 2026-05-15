import { useState } from "react";
import { 
  FileText, 
  Download, 
  Moon, 
  Sun, 
  Database, 
  Info, 
  User,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Share2
} from "lucide-react";
import { db } from "../db";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import { formatCurrency } from "../lib/utils";
import { motion } from "motion/react";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);

  const exportPDF = async () => {
    const doc = new jsPDF();
    const sales = await db.sales.toArray();
    
    doc.setFont("helvetica", "bold");
    doc.text("Hasta-Kala Shop - Sales Report", 14, 20);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    const tableData = sales.map(s => [
      new Date(s.saleDate).toLocaleDateString(),
      s.productName,
      s.quantitySold.toString(),
      formatCurrency(s.totalAmount)
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Date', 'Product', 'Qty', 'Amount']],
      body: tableData,
    });

    doc.save(`Sales_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportCSV = async () => {
    const sales = await db.sales.toArray();
    const csvData = sales.map(s => ({
      Date: new Date(s.saleDate).toLocaleDateString(),
      Product: s.productName,
      Quantity: s.quantitySold,
      Amount: s.totalAmount
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Sales_Data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const menuItems = [
    { label: "Account & Profile", icon: User, category: "Profile" },
    { label: "Language", icon: Info, subtext: "English", category: "App" },
    { label: "Notifications", icon: HelpCircle, category: "App" },
    { label: "Privacy & Security", icon: Shield, category: "Security" },
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-artisan-ink">Settings</h1>
        <p className="text-artisan-muted text-sm font-medium">Preferences & Tools</p>
      </header>

      <section className="bg-white rounded-[2.5rem] p-8 shadow-artisan border border-artisan-brown/5 space-y-8">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-artisan-beige rounded-2xl text-artisan-brown flex items-center justify-center border border-artisan-brown/10">
                    {darkMode ? <Moon size={24} /> : <Sun size={24} />}
                </div>
                <div>
                    <p className="font-bold text-artisan-ink">Dark Mode</p>
                    <p className="text-[10px] text-artisan-muted font-bold uppercase tracking-widest">Toggle night theme</p>
                </div>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`w-14 h-7 rounded-full relative transition-colors duration-300 ${darkMode ? 'bg-artisan-terracotta' : 'bg-artisan-beige border border-artisan-brown/10'}`}
            >
                <motion.div 
                    animate={{ x: darkMode ? 32 : 4 }}
                    className="absolute top-1 left-0 w-5 h-5 bg-white rounded-full shadow-md"
                />
            </button>
        </div>

        <div className="flex items-center justify-between group active:scale-95 transition-transform">
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-artisan-beige rounded-2xl text-artisan-brown flex items-center justify-center border border-artisan-brown/10">
                    <Database size={24} />
                </div>
                <div>
                    <p className="font-bold text-artisan-ink">Local Storage</p>
                    <p className="text-[10px] text-artisan-muted font-bold uppercase tracking-widest">Manage Database</p>
                </div>
            </div>
            <ChevronRight size={20} className="text-artisan-muted opacity-40 group-hover:opacity-100 transition-opacity" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold px-1 text-artisan-brown">Reports & Data</h2>
        <div className="grid grid-cols-2 gap-4">
            <button 
                onClick={exportPDF}
                className="bg-white p-6 rounded-[2rem] shadow-artisan border border-artisan-brown/5 flex flex-col items-center space-y-3 hover:bg-artisan-brown group transition-all active:scale-95"
            >
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center group-hover:bg-white/20 group-hover:text-white transition-colors">
                    <FileText size={24} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest group-hover:text-white">Export PDF</span>
            </button>
            <button 
                onClick={exportCSV}
                className="bg-white p-6 rounded-[2rem] shadow-artisan border border-artisan-brown/5 flex flex-col items-center space-y-3 hover:bg-green-600 group transition-all active:scale-95"
            >
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center group-hover:bg-white/20 group-hover:text-white transition-colors">
                    <Download size={24} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest group-hover:text-white">Export CSV</span>
            </button>
        </div>
      </section>

      <section className="bg-white rounded-[2.5rem] overflow-hidden shadow-artisan border border-artisan-brown/5">
        <div className="p-2">
            {menuItems.map((item, i) => (
                <button key={item.label} className="w-full flex items-center justify-between p-5 hover:bg-artisan-beige/40 transition-all rounded-2xl group active:scale-[0.98]">
                    <div className="flex items-center space-x-4">
                        <div className="text-artisan-muted opacity-40 group-hover:opacity-100 transition-all"><item.icon size={22} /></div>
                        <div className="text-left">
                            <p className="font-bold text-sm text-artisan-ink">{item.label}</p>
                            {item.subtext && <p className="text-[9px] text-artisan-muted font-bold uppercase tracking-widest mt-0.5">{item.subtext}</p>}
                        </div>
                    </div>
                    <ChevronRight size={18} className="text-artisan-muted opacity-20 group-hover:opacity-100 transition-all" />
                </button>
            ))}
        </div>
      </section>

      <button className="w-full bg-white text-red-500 py-6 rounded-[2rem] font-bold uppercase tracking-[0.2em] text-xs shadow-artisan border border-red-100 flex items-center justify-center space-x-3 active:scale-95 transition-transform">
          <LogOut size={20} />
          <span>Sign Out</span>
      </button>

      <div className="text-center pb-8 space-y-2">
          <div className="flex items-center justify-center space-x-2 text-artisan-muted opacity-30">
            <div className="h-[1px] w-8 bg-current" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Hasta-Kala v1.0.0</span>
            <div className="h-[1px] w-8 bg-current" />
          </div>
          <p className="text-[10px] font-serif italic text-artisan-muted/60">Handcrafted with love for Indian Artisans</p>
      </div>
    </div>
  );
}
