
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface WishlistItem {
  id: string;
  name: string;
  price: string;
  image: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;
  isInWishlist: (id: string) => boolean;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('alvena-wishlist');
    if (savedWishlist) {
      try {
        setItems(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Failed to parse wishlist", e);
      }
    }
  }, []);

  // Save wishlist to localStorage on changes
  useEffect(() => {
    localStorage.setItem('alvena-wishlist', JSON.stringify(items));
  }, [items]);

  const addToWishlist = (product: WishlistItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearWishlist = () => setItems([]);

  const isInWishlist = (id: string) => items.some((i) => i.id === id);

  const totalItems = items.length;

  return (
    <WishlistContext.Provider value={{
      items,
      addToWishlist,
      removeFromWishlist,
      clearWishlist,
      isInWishlist,
      totalItems
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
