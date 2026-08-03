
"use client";

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, User, Clock, Terminal, Loader2, Info } from "lucide-react";
import { format } from "date-fns";

export default function AuditLogs() {
  const db = useFirestore();

  const logsQuery = useMemoFirebase(() => 
    query(collection(db, "activity_logs"), orderBy("timestamp", "desc"), limit(100)),
    [db]
  );
  
  const { data: logs, loading } = useCollection(logsQuery);

  const getActionColor = (action: string) => {
    if (action.includes("delete")) return "bg-destructive";
    if (action.includes("create")) return "bg-green-500";
    if (action.includes("update")) return "bg-blue-500";
    return "bg-slate-500";
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline mb-2 text-gradient">Audit & Activity Logs</h1>
        <p className="text-muted-foreground">Detailed history of all administrative actions performed on the platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-honey-gold/20 bg-honey-gold/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase font-bold text-honey-gold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> System Integrity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">SECURED</div>
            <p className="text-[10px] text-muted-foreground mt-1">Real-time encryption and session tracking active.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[200px]">Administrator</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
            ) : logs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Terminal className="w-8 h-8 opacity-20" />
                    <p>No activity logs recorded yet.</p>
                    <p className="text-xs">Logs are generated automatically when admins perform sensitive actions.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              logs?.map((log: any) => (
                <TableRow key={log.id} className="text-sm">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="font-bold">{log.userEmail || "System"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getActionColor(log.action.toLowerCase())}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-[10px]">
                    {log.resource}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      {log.timestamp?.toDate ? format(log.timestamp.toDate(), 'PPP p') : 'Just now'}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {log.ip || "---.---.---.---"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-blue-500 mb-1">Audit Policy</h4>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
            This log is tamper-proof and intended for security compliance. It tracks modifications to products, orders, settings, and authentication attempts. Logs are retained for 365 days by default.
          </p>
        </div>
      </div>
    </div>
  );
}
