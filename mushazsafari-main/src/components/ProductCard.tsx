
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Eye, CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { useTranslation } from "@/context/LanguageCurrencyContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id?: string;
  name: string;
  price: number;
  priceUSD?: number;
  category: string;
  image: string;
  description?: string;
}

export const ProductCard = ({ id, name, price, priceUSD, category, image, description }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useTranslation();
  const { toast } = useToast();

  const productId = id || name.toLowerCase().replace(/\s+/g, '-');
  const displayPrice = formatPrice(price, priceUSD);

  const handleAddToCart = () => {
    addToCart({
      id: productId,
      name,
      priceTZS: price,
      priceUSD: priceUSD || (price / 2500),
      image
    });
    toast({
      title: "Added to cart!",
      description: `${name} is now in your honey cart.`,
    });
  };

  const handleAddToWishlist = () => {
    addToWishlist({
      id: productId,
      name,
      price: displayPrice,
      image
    });
    toast({
      title: "Added to wishlist!",
      description: `${name} has been saved to your wishlist.`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="group relative bg-white border border-border rounded-3xl overflow-hidden transition-all hover:border-honey-gold/30 hover:shadow-2xl hover:shadow-honey-gold/5 h-full flex flex-col"
    >
      {/* Category Badge */}
      <div className="absolute top-4 left-4 z-20">
        <span className="glass px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-honey-gold">
          {category}
        </span>
      </div>

      {/* Image Container */}
      <div className="relative h-64 md:h-[350px] w-full overflow-hidden shrink-0 bg-white">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="icon" variant="secondary" className="rounded-full bg-white text-honey-dark hover:bg-honey-gold hover:text-honey-dark transition-colors h-12 w-12">
                <Eye className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] rounded-3xl p-0 overflow-hidden border-none bg-white/95 backdrop-blur-xl">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="relative h-64 md:h-full min-h-[300px] bg-white">
                  <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-honey-gold text-honey-dark font-bold">{category}</Badge>
                  </div>
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <DialogHeader className="mb-6">
                    <DialogTitle className="font-headline text-3xl font-bold">{name}</DialogTitle>
                    <DialogDescription className="text-honey-gold font-bold text-xl mt-1">{displayPrice}</DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 mb-8">
                    <p className="text-muted-foreground leading-relaxed">
                      {description || "A premium, natural selection from Alvena Bees Investment. Experience the authentic taste of Tanzanian apiculture excellence."}
                    </p>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-honey-gold" />
                        <span>100% Organic & Pure</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-honey-gold" />
                        <span>Sustainably Harvested in Arusha</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={handleAddToCart}
                      className="w-full bg-honey-gold text-honey-dark hover:bg-honey-amber rounded-xl font-bold h-12 shadow-lg shadow-honey-gold/20"
                    >
                      Add to Cart
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleAddToWishlist}
                      className="w-full border-border rounded-xl h-12 hover:bg-muted"
                    >
                      {isInWishlist(productId) ? "In Wishlist" : "Add to Wishlist"}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            size="icon" 
            variant="secondary" 
            className={cn(
              "rounded-full bg-white text-honey-dark hover:bg-honey-gold hover:text-honey-dark transition-colors h-12 w-12",
              isInWishlist(productId) && "bg-honey-gold text-honey-dark"
            )}
            onClick={handleAddToWishlist}
          >
            <Heart className={cn("w-5 h-5", isInWishlist(productId) && "fill-current")} />
          </Button>
        </div>
      </div>

      {/* Visible Content at Bottom */}
      <div className="p-6 flex flex-col flex-1">
        <div className="mb-4">
          <h3 className="font-headline text-xl font-bold group-hover:text-honey-gold transition-colors line-clamp-1">{name}</h3>
          <p className="text-honey-gold font-bold text-lg">{displayPrice}</p>
        </div>
        <Button 
          onClick={handleAddToCart}
          className="w-full mt-auto bg-honey-gold text-honey-dark hover:bg-honey-amber rounded-xl font-bold group/btn"
        >
          <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
          Add to Cart
        </Button>
      </div>
    </motion.div>
  );
};
