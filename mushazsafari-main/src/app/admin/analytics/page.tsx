"use client";

import dynamic from "next/dynamic";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, ShoppingBag, DollarSign, ArrowUpRight, ArrowDownRight, Package, FileText, Download, Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Dynamically import heavy charting libraries to reduce initial RAM and bundle size
// We cast to any to bypass library-specific type mismatches during the Next.js dynamic build process
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer as any), { ssr: false }) as any;
const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart as any), { ssr: false }) as any;
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar as any), { ssr: false }) as any;
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis as any), { ssr: false }) as any;
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis as any), { ssr: false }) as any;
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid as any), { ssr: false }) as any;
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip as any), { ssr: false }) as any;
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart as any), { ssr: false }) as any;
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie as any), { ssr: false }) as any;
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell as any), { ssr: false }) as any;

export default function AdminAnalytics() {
  const db = useFirestore();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();

  // Optimized query: Only fetch enough data for business intelligence
  const ordersQuery = useMemoFirebase(() => 
    user ? query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(500)) : null, 
    [db, user]
  );
  const { data: orders, loading: ordersLoading } = useCollection(ordersQuery);

  const productsQuery = useMemoFirebase(() => 
    user ? collection(db, "products") : null, 
    [db, user]
  );
  const { data: products } = useCollection(productsQuery);

  const totalRevenue = orders?.reduce((acc, o) => acc + (o.totalPrice || 0), 0) || 0;
  const avgOrderValue = orders?.length ? totalRevenue / orders.length : 0;
  
  const categoryData = products?.reduce((acc: any, p) => {
    const existing = acc.find((item: any) => item.name === p.category);
    if (existing) existing.value += 1;
    else acc.push({ name: p.category, value: 1 });
    return acc;
  }, []) || [];

  const salesByMonth = orders?.reduce((acc: any, o) => {
    const date = o.createdAt?.toDate ? o.createdAt.toDate() : new Date();
    const month = date.toLocaleString('default', { month: 'short' });
    const existing = acc.find((item: any) => item.name === month);
    if (existing) existing.total += (o.totalPrice || 0);
    else acc.push({ name: month, total: (o.totalPrice || 0) });
    return acc;
  }, []).sort((a: any, b: any) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.indexOf(a.name) - months.indexOf(b.name);
  }) || [];

  const COLORS = ['#F4B400', '#FFB000', '#E57C00', '#2F5D50', '#111111'];

  const handleExport = (type: 'csv' | 'pdf', reportName: string) => {
    if (!orders || !products) return;

    if (type === 'csv') {
      let csvContent = "";
      if (reportName === 'Sales' || reportName === 'Summary' || reportName === 'Master_Summary') {
        csvContent = "Order ID,Customer,Email,Total Price (TZS),Status,Date\n";
        orders.forEach(o => {
          const date = o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString() : 'N/A';
          csvContent += `"${o.id}","${o.customerName}","${o.email}",${o.totalPrice || 0},"${o.status || 'Pending'}","${date}"\n`;
        });
      } else if (reportName === 'Inventory') {
        csvContent = "SKU,Name,Category,Stock,Price (TZS)\n";
        products.forEach(p => {
          csvContent += `"${p.sku || ''}","${p.name}","${p.category}",${p.stock || 0},${p.price || 0}\n`;
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Alvena_${reportName}_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Report Exported" });
    } else {
      window.print();
    }
  };

  if (userLoading || (user && (ordersLoading || !orders))) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-honey-gold w-12 h-12" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold font-headline mb-2 text-gradient">Business Intelligence</h1>
          <p className="text-muted-foreground">Analysis of Alvena's market performance. Memory-optimized for production.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" onClick={() => handleExport('pdf', 'Summary')} className="rounded-xl border-honey-gold text-honey-gold">
             <FileText className="w-4 h-4 mr-2" /> Export PDF
           </Button>
           <Button onClick={() => handleExport('csv', 'Master_Summary')} className="bg-honey-gold text-honey-dark hover:bg-honey-amber rounded-xl font-bold shadow-lg shadow-honey-gold/20">
             <Download className="w-4 h-4 mr-2" /> Export Excel
           </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="print:hidden">
        <TabsList className="bg-muted/50 p-1 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales Deep Dive</TabsTrigger>
          <TabsTrigger value="reports">Export Center</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Total Revenue", val: `${totalRevenue.toLocaleString()} TZS`, icon: DollarSign, trend: "+12.5%", positive: true },
              { title: "Total Orders", val: orders?.length || 0, icon: ShoppingBag, trend: "+5.2%", positive: true },
              { title: "Avg. Order Value", val: `${Math.round(avgOrderValue).toLocaleString()} TZS`, icon: TrendingUp, trend: "-2.1%", positive: false },
              { title: "Total Inventory", val: products?.length || 0, icon: Package, trend: "+8 new", positive: true },
            ].map((stat, i) => (
              <Card key={i} className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.title}</CardTitle>
                  <stat.icon className="w-4 h-4 text-honey-gold" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.val}</div>
                  <div className={cn("flex items-center gap-1 text-[10px] font-bold mt-1", stat.positive ? "text-green-500" : "text-destructive")}>
                    {stat.trend}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Revenue Growth Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesByMonth}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip 
                       contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                       cursor={{ fill: '#F4B400', opacity: 0.1 }}
                    />
                    <Bar dataKey="total" fill="#F4B400" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Category Performance</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
