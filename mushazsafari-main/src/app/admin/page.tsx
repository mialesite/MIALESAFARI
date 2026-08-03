"use client";

import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  TrendingUp, ShoppingBag, Loader2, Calendar, 
  MessageSquare, BadgeCheck, Settings, ExternalLink,
  Map, FileStack, Compass, Mail
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const db = useFirestore();
  const { user } = useUser();
  
  // Real Data Subscriptions
  const messagesQuery = useMemoFirebase(() => user ? collection(db, "messages") : null, [db, user]);
  const { data: messages } = useCollection(messagesQuery);
  
  const ordersQuery = useMemoFirebase(() => user ? collection(db, "orders") : null, [db, user]);
  const { data: orders } = useCollection(ordersQuery);
  
  const destinationsQuery = useMemoFirebase(() => user ? collection(db, "destinations") : null, [db, user]);
  const { data: destinations } = useCollection(destinationsQuery);

  const itinerariesQuery = useMemoFirebase(() => user ? collection(db, "itineraries") : null, [db, user]);
  const { data: itineraries } = useCollection(itinerariesQuery);

  const mediaQuery = useMemoFirebase(() => user ? collection(db, "media") : null, [db, user]);
  const { data: media } = useCollection(mediaQuery);

  const recentOrdersQuery = useMemoFirebase(() => 
    user ? query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5)) : null,
    [db, user]
  );
  const { data: recentOrders, loading: recentOrdersLoading } = useCollection(recentOrdersQuery);

  const totalRevenue = orders?.reduce((acc, o) => acc + (o.totalPrice || 0), 0) || 0;

  const stats = [
    { title: "Total Revenue", value: `${totalRevenue.toLocaleString()} TZS`, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Destinations", value: destinations?.length || 0, icon: Map, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Itineraries", value: itineraries?.length || 0, icon: Compass, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Media Assets", value: media?.length || 0, icon: FileStack, color: "text-honey-gold", bg: "bg-honey-gold/10" },
  ];

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold font-headline mb-2 text-gradient">Management Console</h1>
          <p className="text-muted-foreground">The benchmark for luxury safari operational excellence.</p>
        </div>
        <div className="flex gap-3">
          <Button asChild className="bg-honey-gold text-honey-dark hover:bg-honey-amber rounded-xl font-bold shadow-lg shadow-honey-gold/20">
             <Link href="/admin/itineraries">
                <Calendar className="w-4 h-4 mr-2" /> New Itinerary
             </Link>
          </Button>
          <Button variant="outline" asChild className="rounded-xl border-border">
             <Link href="/admin/settings">
                <Settings className="w-4 h-4 mr-2" /> System Config
             </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <div className="flex justify-between items-center">
               <div>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Live feed of latest customer expeditions.</CardDescription>
               </div>
               <Button variant="ghost" size="sm" asChild className="text-honey-gold">
                  <Link href="/admin/orders">View All <ExternalLink className="w-3 h-3 ml-2" /></Link>
               </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrdersLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-honey-gold" />
              </div>
            ) : recentOrders?.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground italic">
                No active bookings recorded.
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {recentOrders?.map((order: any) => (
                  <div key={order.id} className="flex items-center gap-6 p-6 hover:bg-muted/20 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-honey-gold/10 flex items-center justify-center text-honey-gold font-bold shrink-0 border border-honey-gold/20">
                      {order.customerName?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground truncate uppercase tracking-tighter">
                        {order.items?.length || 0} items • {(order.totalPrice || 0).toLocaleString()} TZS
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="outline" className="bg-green-500/5 text-green-600 border-green-500/20 text-[10px] mb-1">
                         {order.status || 'Pending'}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {order.createdAt?.toDate ? format(order.createdAt.toDate(), 'MMM d, HH:mm') : 'Recent'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-8">
           <Card className="border-none shadow-sm bg-primary text-white overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-[40px] rounded-full" />
             <CardHeader className="relative z-10">
               <CardTitle className="text-lg">CMS Infrastructure</CardTitle>
               <CardDescription className="text-white/40">Dynamic content relay status.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4 relative z-10">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-xs font-medium">Content Sync</span>
                  <span className="text-[10px] font-bold text-green-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-xs font-medium">Media Library</span>
                  <span className="text-[10px] font-bold text-honey-gold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-honey-gold" />
                    READY
                  </span>
                </div>
                <div className="pt-4 mt-4 border-t border-white/5">
                   <p className="text-[8px] text-white/30 uppercase tracking-[0.3em] text-center font-bold">
                      Mushaz CMS Core v2.0.0
                   </p>
                </div>
             </CardContent>
           </Card>

           <Card className="border-none shadow-sm">
             <CardHeader>
               <CardTitle className="text-lg">Inquiry Inbox</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="space-y-4">
                   {messages?.slice(0, 3).map((m: any) => (
                      <div key={m.id} className="p-3 bg-muted/30 rounded-xl border border-border/50 text-xs">
                         <p className="font-bold flex items-center gap-2 mb-1">
                            <Mail className="w-3 h-3 text-honey-gold" />
                            {m.fullName}
                         </p>
                         <p className="text-muted-foreground line-clamp-1 italic">"{m.message}"</p>
                      </div>
                   ))}
                   <Button variant="outline" asChild className="w-full h-9 text-xs rounded-lg border-border">
                      <Link href="/admin/messages">Manage All Inquiries</Link>
                   </Button>
                </div>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
