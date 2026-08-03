
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'sw' | 'fr' | 'es' | 'ar';
export type Currency = 'TZS' | 'USD';

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

const translations: Translations = {
  // Navigation
  home: { en: "Home", sw: "Nyumbani", fr: "Accueil", es: "Inicio", ar: "الرئيسية" },
  about: { en: "About Us", sw: "Kuhusu Sisi", fr: "À propos", es: "Nosotros", ar: "حولنا" },
  products: { en: "Products", sw: "Bidhaa", fr: "Produits", es: "Productos", ar: "منتجات" },
  beekeeping: { en: "Beekeeping", sw: "Ufugaji Nyuki", fr: "Apiculture", es: "Apicultura", ar: "تربية النحل" },
  contact: { en: "Contact", sw: "Wasiliana nasi", fr: "Contact", es: "Contacto", ar: "اتصال" },
  shop_now: { en: "Shop Now", sw: "Nunua Sasa", fr: "Acheter maintenant", es: "Comprar ahora", ar: "تسوق الآن" },

  // Hero
  premium_apiculture: { en: "Premium Tanzanian Apiculture", sw: "Ufugaji Nyuki Bora wa Tanzania", fr: "Apiculture tanzanienne de quality", es: "Apiculture tanzana premium", ar: "تربية النحل التنزانية المتميزة" },
  discover_nature: { en: "Discover the Power of Nature", sw: "Gundua Nguvu ya Asili", fr: "Découvrez le pouvoir de la nature", es: "Descubre el poder de la naturaleza", ar: "اكتشف قوة الطبيعة" },
  hero_description: { en: "Bringing you pure, natural honey and sustainable bee products from the lush heart of Arusha, Tanzania.", sw: "Tunakuletea asali safi ya asili na bidhaa endelevu za nyuki kutoka moyoni mwa Arusha, Tanzania.", fr: "Nous vous apportons du miel pur et naturel et des produits apicoles durables du cœur d'Arusha, en Tanzanie.", es: "Ofreciendo miel pura y natural y productos apícolas sostenibles desde el corazón de Arusha, Tanzania.", ar: "نقدم لكم عسلًا طبيعيًا نقيًا ومنتجات نحل مستدامة من قلب أروشا المورق، تنزانيا." },
  explore_products: { en: "Explore Products", sw: "Angalia Bidhaa", fr: "Explorer les produits", es: "Explorar produits", ar: "استكشف المنتجات" },
  our_story: { en: "Our Story", sw: "Hadithi Yetu", fr: "Notre histoire", es: "Nuestra historia", ar: "قصتنا" },

  // Stats
  farmers_trained: { en: "Farmers Trained", sw: "Wakulima Waliopata Mafunzo", fr: "Agriculteurs formés", es: "Agricultores formados", ar: "مزارعون مدربون" },
  beehives_distributed: { en: "Beehives Distributed", sw: "Mizinga Iliyosambazwa", fr: "Ruches distribuées", es: "Colmenas distribuées", ar: "خلايا النحل الموزعة" },
  community_impact: { en: "Community Impact", sw: "Athari kwa Jamii", fr: "Impact communautaire", es: "Impacto communautaire", ar: "تأثير المجتمع" },

  // About Section
  our_legacy: { en: "Our Legacy", sw: "Urithi Wetu", fr: "Notre héritage", es: "Nuestro legado", ar: "إرثنا" },
  about_alvena: { en: "About Alvena Bees", sw: "Kuhusu Alvena Bees", fr: "À propos d'Alvena Bees", es: "Sobre Alvena Bees", ar: "عن الفينا بيز" },
  about_desc_1: { en: "At Alvena Bees, we are more than just a honey company. We are committed to promoting the health of our planet through sustainable beekeeping practices and natural bee products.", sw: "Katika Alvena Bees, sisi ni zaidi ya kampuni ya asali. Tumejitolea kukuza afya ya sayari yetu kupitia ufugaji endelevu wa nyuki.", fr: "Chez Alvena Bees, nous sommes plus qu'une simple entreprise de miel. Nous nous engageons à promouvoir la santé de notre planète.", es: "En Alvena Bees, somos más que una empresa de miel. Estamos comprometidos con la salud de nuestro planeta.", ar: "في الفينا بيز، نحن أكثر من مجرد شركة عسل. نحن ملتزمون بتعزيز صحة كوكبنا من خلال ممارسات تربية النحل المستدامة." },
  sustainable: { en: "Sustainable", sw: "Endelevu", fr: "Durable", es: "Sostenible", ar: "مستدام" },
  pure_quality: { en: "Pure Quality", sw: "Ubora Safi", fr: "Ubora Safi", es: "Calidad pura", ar: "جودة نقية" },

  // Values
  our_core: { en: "Our Core", sw: "Maadili Yetu", fr: "Nos valeurs", es: "Nuestros valores", ar: "قيمنا الأساسية" },
  ethos_values: { en: "Ethos & Values", sw: "Maadili na Desturi", fr: "Éthos et Valeurs", es: "Ética y Valores", ar: "الأخلاقيات والقيم" },
  quality: { en: "Quality", sw: "Ubora", fr: "Qualité", es: "Calidad", ar: "الجودة" },
  community: { en: "Community", sw: "Jamii", fr: "Communauté", es: "Communauté", ar: "المجتمع" },
  innovation: { en: "Innovation", sw: "Uvumbuzi", fr: "Innovation", es: "Innovación", ar: "الابتكار" },
  integrity: { en: "Integrity", sw: "Uaminifu", fr: "Intégrité", es: "Intégrité", ar: "النزاهة" },

  // Shop / Collection
  alvena_collection: { en: "The Alvena Collection", sw: "Mkusanyiko wa Alvena", fr: "La collection Alvena", es: "La Colección Alvena", ar: "مجموعة الفينا" },
  natures_harvest: { en: "Nature's Finest Harvest", sw: "Mavuno Bora ya Asili", fr: "La meilleure récolte de la nature", es: "La mejor cosecha de la naturaleza", ar: "أفضل حصاد للطبيعة" },
  explore_range: { en: "Explore our range of premium organic products and beekeeping equipment.", sw: "Chunguza bidhaa zetu za kikaboni na vifaa vya ufugaji nyuki.", fr: "Explorez notre gamme de produits biologiques et d'équipements apicoles.", es: "Explore nuestra gama de productos orgánicos y equipos apícolas.", ar: "استكشف مجموعتنا من المنتجات العضوية المتميزة ومعدات تربية النحل." },
  open_shop: { en: "Open Full Shop", sw: "Fungua Duka Lote", fr: "Ouvrir la boutique", es: "Ver tienda completa", ar: "افتح المتجر بالكامل" },

  // AI Consultant
  find_perfect_blend: { en: "Find Your Perfect Blend", sw: "Pata Mchanganyiko Wako Kamili", fr: "Trouvez votre mélange parfait", es: "Encuentra tu mezcla perfecta", ar: "ابحث عن مزيجك المثالي" },
  ai_consultant_desc: { en: "Let our AI expert curate a selection of Alvena products tailored to your wellness goals.", sw: "Mtaalamu wetu wa AI akuchagulie bidhaa za Alvena kulingana na malengo yako ya kiafya.", fr: "Laissez notre expert IA sélectionner des produits Alvena adaptés à vos objectifs.", es: "Deje que nuestro experto en IA seleccione productos de Alvena para sus metas de bienestar.", ar: "دع خبير الذكاء الاصطناعي لدينا ينسق لك مجموعة من منتجات الفينا المصممة لأهدافك الصحية." },
  get_recommendations: { en: "Get Recommendations", sw: "Pata Mapendekezo", fr: "Obtenir des recommandations", es: "Obtenir recomendaciones", ar: "احصل على التوصيات" },

  // Impact
  environmental_impact: { en: "Our Environmental Impact", sw: "Athari Yetu kwa Mazingira", fr: "Notre impact environnemental", es: "Nuestro impacto ambiental", ar: "تأثيرنا البيئي" },
  impact_desc: { en: "We are dedicated to fostering biodiversity and empowering Tanzanian beekeeping communities.", sw: "Tumejitolea kukuza bioanuwai na kuziwezesha jamii za ufugaji nyuki Tanzania.", fr: "Nous nous consacrons à favoriser la biodiversité et à autonomiser les communautés apicoles.", es: "Estamos dedicados a fomentar la biodiversidad y empoderar a las comunidades apícolas.", ar: "نحن مكرسون لتعزيز التنوع البيولوجي وتمكين مجتمعات تربية النحل في تنزانيا." },

  // Contact
  get_in_touch: { en: "Get in Touch", sw: "Wasiliana Nasi", fr: "Contactez-nous", es: "Ponte en contacto", ar: "تواصل معنا" },
  send_message: { en: "Send a Message", sw: "Tuma Ujumbe", fr: "Envoyer un message", es: "Enviar un message", ar: "أرسل رسالة" },
  full_name: { en: "Full Name", sw: "Jina Kamili", fr: "Nom complet", es: "Nombre completo", ar: "الاسم الكامل" },
  email_address: { en: "Email Address", sw: "Barua Pepe", fr: "Adresse e-mail", es: "Correo electrónico", ar: "البريد الإلكتروني" },
  phone_label: { en: "Phone", sw: "Simu", fr: "Téléphone", es: "Teléfono", ar: "الهاتف" },
  message_label: { en: "Your Message", sw: "Ujumbe Wako", fr: "Votre message", es: "Tu message", ar: "رسالتك" },
  send_inquiry: { en: "Send Inquiry", sw: "Tuma Ombi", fr: "Envoyer l'enquête", es: "Enviar consulta", ar: "إرسال الاستفسار" },

  // Misc
  cart_empty: { en: "Your cart is empty", sw: "Kikapu chako kiko tupu", fr: "Votre panier est vide", es: "Tu carrito está vacío", ar: "سلتك فارغة" },
  checkout: { en: "Checkout Now", sw: "Lipa Sasa", fr: "Passer à la caisse", es: "Pagar ahora", ar: "الدفع الآن" }
};

interface LanguageCurrencyContextType {
  language: Language;
  currency: Currency;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  t: (key: string) => string;
  formatPrice: (priceTZS: number, priceUSD?: number) => string;
}

const LanguageCurrencyContext = createContext<LanguageCurrencyContextType | undefined>(undefined);

export const LanguageCurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [currency, setCurrency] = useState<Currency>('USD');

  useEffect(() => {
    // 1. Check for manual preference
    const savedCurrency = localStorage.getItem('alvena-pref-currency');
    const savedLanguage = localStorage.getItem('alvena-pref-language');

    if (savedLanguage) setLanguage(savedLanguage as Language);
    
    if (savedCurrency) {
      setCurrency(savedCurrency as Currency);
    } else {
      // 2. Auto-detect if no preference exists
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timeZone.includes('Africa/Dar_es_Salaam') || timeZone.includes('Nairobi')) {
        setCurrency('TZS');
      } else {
        setCurrency('USD');
      }
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('alvena-pref-language', lang);
  };

  const handleSetCurrency = (curr: Currency) => {
    setCurrency(curr);
    localStorage.setItem('alvena-pref-currency', curr);
  };

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  const formatPrice = (priceTZS: number, priceUSD?: number) => {
    if (currency === 'TZS') {
      return `TZS ${priceTZS.toLocaleString()}`;
    } else {
      // Use priceUSD if provided, otherwise convert from TZS as fallback
      const displayPrice = priceUSD || (priceTZS / 2500);
      return `$${displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  return (
    <LanguageCurrencyContext.Provider value={{ 
      language, 
      currency, 
      setLanguage: handleSetLanguage, 
      setCurrency: handleSetCurrency, 
      t, 
      formatPrice 
    }}>
      <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageCurrencyContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageCurrencyContext);
  if (!context) throw new Error('useTranslation must be used within LanguageCurrencyProvider');
  return context;
};
