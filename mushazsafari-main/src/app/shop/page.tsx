
"use client";

import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { useTranslation } from "@/context/LanguageCurrencyContext";

const CATEGORIES = [
  "All",
  "Protective Gear",
  "Beehives",
  "Extraction & Processing",
  "Queen Management",
  "Smokers & Feeders",
  "Testing & Tools",
  "Natural Bee Products"
];

export default function ShopPage() {
  const db = useFirestore();
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const productsQuery = useMemoFirebase(() => {
    let q = query(collection(db, "products"), where("status", "==", "active"));
    return q;
  }, [db]);

  const { data: products, loading } = useCollection(productsQuery);

  const filteredProducts = products?.filter(p => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center lg:text-left">
          <span className="text-honey-gold font-bold tracking-widest uppercase text-sm mb-4 block">Alvena Marketplace</span>
          <h1 className="font-headline text-5xl md:text-7xl font-bold mb-6">The Alvena <span className="text-gradient">Market</span></h1>
          <p className="text-muted-foreground text-lg max-w-2xl font-light">
            Explore our curated range of sustainable Tanzanian beekeeping gear and natural bee products.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col lg:flex-row gap-8 mb-16 items-center justify-between">
          <div className="flex flex-wrap gap-3 justify-center">
            {CATEGORIES.map((cat) => (
              <Button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                variant={cat === activeCategory ? "default" : "outline"} 
                className={cn(
                  "rounded-full px-6 transition-all duration-300 text-xs",
                  cat === activeCategory 
                    ? "bg-honey-gold text-honey-dark shadow-lg shadow-honey-gold/20" 
                    : "glass border-border hover:bg-honey-gold/10 hover:border-honey-gold/50"
                )}
              >
                {cat}
              </Button>
            ))}
          </div>
          
          <div className="flex w-full max-w-md gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog..." 
                className="pl-12 rounded-full glass border-border focus:ring-honey-gold h-12" 
              />
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="py-32 flex justify-center"><Loader2 className="w-12 h-12 animate-spin text-honey-gold" /></div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((p, i) => (
              <ProductCard 
                key={p.id} 
                id={p.id}
                name={p.name}
                price={p.price}
                priceUSD={p.priceUSD}
                category={p.category}
                image={p.images?.[0] || "https://picsum.photos/seed/honey/600/600"}
                description={p.description}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/20 rounded-[2rem] border border-dashed border-border">
            <p className="text-muted-foreground text-xl">No products found matching your criteria.</p>
            <Button 
              variant="link" 
              onClick={() => { setActiveCategory("All"); setSearchQuery(""); }}
              className="text-honey-gold mt-4"
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
