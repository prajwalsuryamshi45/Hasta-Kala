import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import { 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { formatCurrency } from "../lib/utils";
import { 
  TrendingUp, 
  Award, 
  PieChart as PieIcon, 
  BarChart as BarIcon, 
  Calendar,
  Layers
} from "lucide-react";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, subDays, startOfMonth, eachMonthOfInterval, subMonths } from "date-fns";

export default function Analytics() {
  const sales = useLiveQuery(() => db.sales.toArray());
  const products = useLiveQuery(() => db.products.toArray());

  // Pie Chart Data: Best Selling Products
  const pieData = useMemo(() => {
    if (!sales) return [];
    const stats: Record<string, number> = {};
    sales.forEach(s => {
      stats[s.productName] = (stats[s.productName] || 0) + s.quantitySold;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [sales]);

  // Bar Chart Data: Weekly Sales
  const barData = useMemo(() => {
    if (!sales) return [];
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });

    return last7Days.map(date => {
      const dayStr = format(date, 'EEE');
      const dayStart = new Date(date).setHours(0, 0, 0, 0);
      const dayEnd = new Date(date).setHours(23, 59, 59, 999);
      
      const daySales = sales.filter(s => s.saleDate >= dayStart && s.saleDate <= dayEnd);
      const totalAmount = daySales.reduce((sum, s) => sum + s.totalAmount, 0);
      
      return { name: dayStr, amount: totalAmount };
    });
  }, [sales]);

  // Line Chart Data: Monthly Trend
  const lineData = useMemo(() => {
    if (!sales) return [];
    const last12Months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date()
    });

    return last12Months.map(month => {
      const monthStr = format(month, 'MMM');
      const start = startOfMonth(month).getTime();
      const end = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59).getTime();

      const monthSales = sales.filter(s => s.saleDate >= start && s.saleDate <= end);
      const income = monthSales.reduce((sum, s) => sum + s.totalAmount, 0);

      return { name: monthStr, income };
    });
  }, [sales]);

  const COLORS = ['#8B4513', '#E2725B', '#EF6C00', '#8D8172', '#2D2926'];

  const mostProfitable = useMemo(() => {
      if (!sales) return null;
      const stats: Record<string, number> = {};
      sales.forEach(s => {
          stats[s.productName] = (stats[s.productName] || 0) + s.totalAmount;
      });
      const entries = Object.entries(stats).sort((a,b) => b[1] - a[1]);
      return entries.length > 0 ? { name: entries[0][0], amount: entries[0][1] } : null;
  }, [sales]);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-artisan-ink">Analytics</h1>
        <p className="text-artisan-muted text-sm font-medium">Business health & trends</p>
      </header>

      <section className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-[2rem] shadow-artisan border border-artisan-brown/5">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-artisan-terracotta flex items-center justify-center mb-3">
                < Award size={20} />
            </div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-artisan-muted mb-1">Most Profitable</p>
            <p className="font-bold text-artisan-ink truncate">{mostProfitable?.name || "None"}</p>
            <p className="text-sm font-bold text-artisan-terracotta mt-1">{mostProfitable ? formatCurrency(mostProfitable.amount) : "N/A"}</p>
        </div>
        <div className="bg-white p-5 rounded-[2rem] shadow-artisan border border-artisan-brown/5">
            <div className="w-10 h-10 rounded-2xl bg-brown-50 text-artisan-brown flex items-center justify-center mb-3">
                < Layers size={20} />
            </div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-artisan-muted mb-1">Total Products</p>
            <p className="font-bold text-artisan-ink text-lg font-serif">{products?.length || 0} Items</p>
            <p className="text-xs font-bold text-artisan-brown/60 mt-1">{products?.filter(p => p.stockQuantity > 0).length || 0} In Stock</p>
        </div>
      </section>

      {/* Pie Chart */}
      <section className="bg-white p-6 rounded-[2.5rem] shadow-artisan border border-artisan-brown/5 space-y-6">
        <div className="flex items-center space-x-2">
            <div className="w-1 h-6 bg-artisan-terracotta rounded-full" />
            <h2 className="font-bold uppercase tracking-widest text-sm text-artisan-brown">Best Selling Products</h2>
        </div>
        <div className="h-64 w-full">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '12px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
              </RePieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-artisan-muted font-serif italic text-sm">No sales data yet</div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
            {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center space-x-2 bg-artisan-beige/30 p-2 rounded-xl">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] font-bold truncate uppercase tracking-tight text-artisan-ink">{d.name}</span>
                </div>
            ))}
        </div>
      </section>

      {/* Bar Chart */}
      <section className="bg-white p-6 rounded-[2.5rem] shadow-artisan border border-artisan-brown/5 space-y-6">
        <div className="flex items-center space-x-2">
            <div className="w-1 h-6 bg-artisan-brown rounded-full" />
            <h2 className="font-bold uppercase tracking-widest text-sm text-artisan-brown">Weekly Revenue</h2>
        </div>
        <div className="h-48 w-full pt-4">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={barData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F5E6D3" />
               <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: '700', fill: '#8D8172' }} 
                />
               <Tooltip 
                 cursor={{ fill: '#FDFBF7' }}
                 contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                 formatter={(value: number) => [formatCurrency(value), 'Revenue']}
               />
               <Bar dataKey="amount" fill="#E2725B" radius={[6, 6, 0, 0]} barSize={24} />
             </BarChart>
           </ResponsiveContainer>
        </div>
      </section>

      {/* Area Chart */}
      <section className="bg-white p-6 rounded-[2.5rem] shadow-artisan border border-artisan-brown/5 space-y-6">
        <div className="flex items-center space-x-2">
            <div className="w-1 h-6 bg-artisan-ink rounded-full" />
            <h2 className="font-bold uppercase tracking-widest text-sm text-artisan-brown">Income Trend (Monthly)</h2>
        </div>
        <div className="h-48 w-full pt-4">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={lineData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B4513" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8B4513" stopOpacity={0}/>
                  </linearGradient>
                </defs>
               <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: '700', fill: '#8D8172' }} 
                />
               <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [formatCurrency(value), 'Income']}
               />
               <Area type="monotone" dataKey="income" stroke="#8B4513" strokeWidth={4} fillOpacity={1} fill="url(#colorIncome)" />
             </AreaChart>
           </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
