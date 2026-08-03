"use client";

import { useCart } from "@/context/cart-context";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/ui/glass-card";
import { ShoppingBag, ArrowLeft, Send, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/context/LanguageCurrencyContext";

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart();
  const { currency, formatPrice } = useTranslation();
  const [isOrdered, setIsOrdered] = useState(false);
  const [loading, setLoading] = useState(false);
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const totalPrice = getTotalPrice(currency);

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const orderData = {
      customerName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: currency === 'TZS' ? item.priceTZS : item.priceUSD,
        quantity: item.quantity
      })),
      totalPrice,
      currency,
      status: "pending",
    };

    try {
      // 1. Save to Database
      const ordersRef = collection(db, "orders");
      await addDoc(ordersRef, {
        ...orderData,
        createdAt: serverTimestamp(),
      }).catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: ordersRef.path,
          operation: "create",
          requestResourceData: orderData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit("permission-error", permissionError);
        throw error;
      });

      // 2. Trigger Email Notification (Serializable data only)
      try {
        await fetch("/api/order-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: orderData }),
        });
      } catch (e) {
        console.warn("Order email automation failed, but order was saved to database.");
      }

      clearCart();
      setIsOrdered(true);
      toast({
        title: "Order Placed Successfully!",
        description: "Your order details have been sent to our team.",
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: "Could not save your order. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isOrdered) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 flex items-center justify-center bg-background">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-24 h-24 bg-honey-gold/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12 text-honey-gold" />
          </div>
          <h1 className="font-headline text-4xl font-bold mb-4">Order Received!</h1>
          <p className="text-muted-foreground mb-12 font-light">
            Thank you for choosing Miale. We have received your order and will contact you regarding delivery shortly.
          </p>
          <div className="flex flex-col gap-4">
            <Button asChild className="bg-honey-dark text-white hover:bg-honey-gold hover:text-honey-dark rounded-xl h-12 font-bold shadow-lg">
              <Link href="/shop">
                Back to Shop
              </Link>
            </Button>
            <Button asChild variant="ghost" className="text-muted-foreground hover:text-honey-gold">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="font-headline text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">Add some products to your collection before checking out.</p>
          <Button asChild className="bg-honey-gold text-honey-dark hover:bg-honey-amber rounded-xl px-8">
            <Link href="/shop">Browse Shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <Button variant="ghost" asChild className="mb-6 hover:text-honey-gold -ml-4">
            <Link href="/shop" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Shop
            </Link>
          </Button>
          <h1 className="font-headline text-4xl md:text-6xl font-bold">Complete Your <span className="text-gradient">Order</span></h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <GlassCard className="p-8 md:p-10 border-border/50 shadow-xl" hoverEffect={false}>
                <h3 className="text-2xl font-bold font-headline mb-8">Shipping & Contact Information</h3>
                <form onSubmit={handlePlaceOrder} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground px-1">Full Name</label>
                      <Input name="fullName" required placeholder="Jane Doe" className="bg-white/5 border-border h-12 rounded-xl focus:ring-honey-gold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground px-1">Email Address</label>
                      <Input name="email" required type="email" placeholder="jane@example.com" className="bg-white/5 border-border h-12 rounded-xl focus:ring-honey-gold" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground px-1">Phone Number (WhatsApp preferred)</label>
                    <Input name="phone" required placeholder="+255 --- --- ---" className="bg-white/5 border-border h-12 rounded-xl focus:ring-honey-gold" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground px-1">Delivery Address</label>
                    <Textarea name="address" required placeholder="Street, City, Region (e.g., Sombetini JR, Arusha)" className="bg-white/5 border-border min-h-[120px] rounded-xl focus:ring-honey-gold" />
                  </div>

                  <Button disabled={loading} type="submit" className="w-full bg-honey-gold text-honey-dark hover:bg-honey-amber h-14 rounded-xl font-bold text-lg shadow-xl shadow-honey-gold/10 group mt-4">
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        Place Order ({formatPrice(getTotalPrice('TZS'), getTotalPrice('USD'))})
                        <Send className="ml-2 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground mt-4">
                    We will send an automated order confirmation to your email.
                  </p>
                </form>
              </GlassCard>
            </motion.div>
          </div>

          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-32"
            >
              <GlassCard className="p-8 border-honey-gold/20 bg-honey-gold/5 shadow-2xl" hoverEffect={false}>
                <h3 className="text-2xl font-bold font-headline mb-8 border-b border-honey-gold/10 pb-4">Order Summary</h3>
                <div className="space-y-6 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-border bg-white shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-honey-gold">
                          {formatPrice(item.priceTZS, item.priceUSD)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-honey-gold/10 space-y-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(getTotalPrice('TZS'), getTotalPrice('USD'))}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-xs italic">Calculated later</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-4 border-t border-honey-gold/20">
                    <span>Total Estimate</span>
                    <span className="text-honey-gold">{formatPrice(getTotalPrice('TZS'), getTotalPrice('USD'))}</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
