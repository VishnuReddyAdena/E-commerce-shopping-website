import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Laptop,
  Smartphone,
  Tv,
  Shirt,
  User,
  UserCheck,
  Baby,
  Sparkles,
  Home,
  Utensils,
  ShoppingBag,
  Dumbbell,
  BookOpen,
  Puzzle,
  Car,
  Briefcase,
  Dog,
  HeartPulse,
  Gem,
  Luggage,
  Music,
  Gamepad2,
  Cpu,
  Gift,
  Percent,
  Flame,
  Award,
  CreditCard,
  BadgePercent,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  ArrowRight
} from 'lucide-react';

const categoriesData = [
  {
    name: 'Electronics',
    icon: Laptop,
    promo: 'New MacBook M3 Pro - 10% instant discount with HDFC cards',
    brands: ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS'],
    popular: ['MacBooks', 'Gaming Laptops', 'SSD', 'WiFi Routers'],
    subcategories: [
      'Laptops', 'Gaming Laptops', 'MacBooks', 'Desktop PCs', 'Monitors', 
      'Computer Components', 'Keyboards', 'Mouse', 'Printers', 'Networking', 
      'WiFi Routers', 'Storage Devices', 'SSD', 'Hard Drives', 'Pendrives', 
      'Graphics Cards', 'Motherboards', 'Processors', 'RAM', 'Webcams', 
      'Projectors', 'Accessories'
    ]
  },
  {
    name: 'Mobiles & Tablets',
    icon: Smartphone,
    promo: 'Flash Sale: Up to 40% Off on Top 5G Smartphones!',
    brands: ['Apple', 'Samsung', 'OnePlus', 'Realme', 'Xiaomi'],
    popular: ['5G Phones', 'iPads', 'Earbuds', 'Power Banks'],
    subcategories: [
      'Smartphones', 'Feature Phones', '5G Phones', 'Tablets', 'iPads', 
      'Cases', 'Tempered Glass', 'Chargers', 'Power Banks', 'Earbuds', 
      'Headphones', 'Smart Watches', 'Fitness Bands', 'Mobile Accessories'
    ]
  },
  {
    name: 'TVs & Appliances',
    icon: Tv,
    promo: 'Upgrade your Living Room - No Cost EMI on Smart TVs',
    brands: ['Sony', 'Samsung', 'LG', 'Xiaomi', 'TCL'],
    popular: ['OLED TVs', 'Air Conditioners', 'Washing Machines'],
    subcategories: [
      'Smart TVs', 'OLED TVs', 'LED TVs', 'QLED TVs', 'Projectors', 
      'Air Conditioners', 'Refrigerators', 'Washing Machines', 'Dishwashers', 
      'Microwave Ovens', 'OTG', 'Air Fryers', 'Vacuum Cleaners', 'Water Purifiers', 
      'Fans', 'Geysers', 'Kitchen Appliances', 'Home Appliances'
    ]
  },
  {
    name: 'Fashion',
    icon: Sparkles,
    promo: 'Summer Collection Live - Buy 2 Get 1 Free!',
    brands: ['Zara', 'H&M', 'Nike', 'Adidas', 'Puma'],
    popular: ['New Collection', 'Summer Wear', 'Footwear'],
    subcategories: [
      'Trending', 'New Collection', 'Summer Wear', 'Winter Wear', 
      'Ethnic Wear', 'Western Wear', 'Premium Brands', 'Luxury Fashion', 
      'Footwear', 'Accessories'
    ]
  },
  {
    name: 'Men',
    icon: User,
    promo: 'Premium Blazers & Suits - Flat 30% Off',
    brands: ['Nike', 'Levis', 'Tommy Hilfiger', 'Polo', 'Jack & Jones'],
    popular: ['Sneakers', 'Jeans', 'T-Shirts', 'Watches'],
    subcategories: [
      'T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Shorts', 'Jackets', 
      'Blazers', 'Suits', 'Sweatshirts', 'Hoodies', 'Ethnic Wear', 
      'Innerwear', 'Sportswear', 'Shoes', 'Sneakers', 'Sandals', 
      'Wallets', 'Belts', 'Watches', 'Sunglasses', 'Bags'
    ]
  },
  {
    name: 'Women',
    icon: UserCheck,
    promo: 'Ethnic Wear Carnival - Flat 50% Off',
    brands: ['Zara', 'Biba', 'Vero Moda', 'Forever 21', 'Only'],
    popular: ['Sarees', 'Handbags', 'Kurtis', 'Heels'],
    subcategories: [
      'Dresses', 'Tops', 'T-Shirts', 'Jeans', 'Leggings', 'Skirts', 
      'Sarees', 'Kurtis', 'Salwar Suits', 'Lehengas', 'Blouses', 
      'Handbags', 'Jewelry', 'Heels', 'Flats', 'Beauty Products', 
      'Perfumes', 'Watches'
    ]
  },
  {
    name: 'Kids & Baby',
    icon: Baby,
    promo: 'Soft & Safe Organic Cotton Apparel for Toddlers',
    brands: ['Mothercare', 'FirstCry', 'Chicco', 'Lego', 'Disney'],
    popular: ['Baby Care', 'Toys', 'Diapers', 'School Bags'],
    subcategories: [
      'Boys Clothing', 'Girls Clothing', 'Infant Wear', 'Baby Care', 
      'Diapers', 'Baby Food', 'School Bags', 'Toys', 'Baby Furniture', 
      'Feeding Accessories'
    ]
  },
  {
    name: 'Beauty & Personal Care',
    icon: Sparkles,
    promo: 'Glow Up Sale - Mini Perfumes starting at $19',
    brands: ['L\'Oreal', 'Maybelline', 'MAC', 'Clinique', 'Estee Lauder'],
    popular: ['Skincare', 'Fragrances', 'Makeup'],
    subcategories: [
      'Makeup', 'Skincare', 'Hair Care', 'Personal Care', 'Men Grooming', 
      'Fragrances', 'Luxury Beauty', 'Organic Products'
    ]
  },
  {
    name: 'Home & Furniture',
    icon: Home,
    promo: 'Luxe Modular Sofas - Free Home Delivery & Setup',
    brands: ['IKEA', 'Sleepwell', 'Pepperfry', 'HomeCentre'],
    popular: ['Mattresses', 'Beds', 'Lighting', 'Wall Decor'],
    subcategories: [
      'Living Room', 'Bedroom', 'Dining Room', 'Office Furniture', 'Sofas', 
      'Beds', 'Mattresses', 'Wardrobes', 'Tables', 'Chairs', 'Home Decor', 
      'Curtains', 'Lighting', 'Wall Decor', 'Storage'
    ]
  },
  {
    name: 'Kitchen & Dining',
    icon: Utensils,
    promo: 'Non-stick Cookware Sets starting at $29',
    brands: ['Philips', 'Prestige', 'Hawkins', 'Pigeon'],
    popular: ['Mixer Grinder', 'Pressure Cooker', 'Coffee Maker'],
    subcategories: [
      'Cookware', 'Dinner Sets', 'Storage Containers', 'Kitchen Tools', 
      'Mixer Grinder', 'Gas Stove', 'Coffee Maker', 'Toaster', 'Pressure Cooker'
    ]
  },
  {
    name: 'Grocery',
    icon: ShoppingBag,
    promo: 'Daily Essentials - Fresh Fruits & Vegetables up to 25% Off',
    brands: ['Nestle', 'Kelloggs', 'Aashirvaad', 'Tropicana', 'Amul'],
    popular: ['Daily Essentials', 'Snacks', 'Beverages'],
    subcategories: [
      'Vegetables', 'Fruits', 'Rice', 'Flour', 'Snacks', 'Beverages', 
      'Dairy', 'Frozen Foods', 'Daily Essentials', 'Cleaning Supplies'
    ]
  },
  {
    name: 'Sports & Fitness',
    icon: Dumbbell,
    promo: 'Get Fit - Gym Equipment & Yoga Mats up to 40% Off',
    brands: ['Decathlon', 'Yonex', 'Cosco', 'Adidas', 'Speedo'],
    popular: ['Gym Equipment', 'Cycling', 'Yoga'],
    subcategories: [
      'Gym Equipment', 'Cricket', 'Football', 'Badminton', 'Cycling', 
      'Running', 'Yoga', 'Camping', 'Swimming'
    ]
  },
  {
    name: 'Books & Stationery',
    icon: BookOpen,
    promo: 'Exam Prep Guide Books - Extra 10% off on checkouts',
    brands: ['Penguin', 'HarperCollins', 'Oxford', 'Classmate'],
    popular: ['Programming', 'Fiction', 'Competitive Exams'],
    subcategories: [
      'Academic', 'Engineering', 'Programming', 'Fiction', 'Non-fiction', 
      'Comics', 'Competitive Exams', 'Children Books'
    ]
  },
  {
    name: 'Toys & Games',
    icon: Puzzle,
    promo: 'Remote Control Cars & Drone Toys - Top Rated',
    brands: ['Lego', 'Hot Wheels', 'Barbie', 'Hasbro', 'Nerf'],
    popular: ['Board Games', 'Puzzles', 'Remote Control Toys'],
    subcategories: [
      'Educational Toys', 'Action Figures', 'Remote Control Toys', 'Puzzles', 
      'Board Games', 'Dolls', 'Outdoor Toys'
    ]
  },
  {
    name: 'Automotive',
    icon: Car,
    promo: 'Sleek Car Cleaning Kits & Accessories - Save 15%',
    brands: ['3M', 'Bosch', 'Michelin', 'Vega', 'Motul'],
    popular: ['Helmets', 'Car Accessories', 'Tyres'],
    subcategories: [
      'Car Accessories', 'Bike Accessories', 'Helmets', 'Tyres', 'Lubricants', 
      'Cleaning Kits'
    ]
  },
  {
    name: 'Office Supplies',
    icon: Briefcase,
    promo: 'Ergonomic Office Chairs starting at $99',
    brands: ['HP', 'Canon', 'Epson', 'Featherlite'],
    popular: ['Office Chairs', 'Printers', 'Stationery'],
    subcategories: [
      'Office Chairs', 'Desks', 'Stationery', 'Printers', 'Paper', 'Office Electronics'
    ]
  },
  {
    name: 'Pet Supplies',
    icon: Dog,
    promo: 'Premium Grain-Free Dog & Cat Food Deals',
    brands: ['Pedigree', 'Royal Canin', 'Whiskas', 'Purina'],
    popular: ['Dog Food', 'Pet Toys', 'Pet Beds'],
    subcategories: [
      'Dog Food', 'Cat Food', 'Pet Toys', 'Pet Beds', 'Pet Grooming'
    ]
  },
  {
    name: 'Health & Wellness',
    icon: HeartPulse,
    promo: 'Whey Protein & Daily Supplements - Top Brands',
    brands: ['Optimum Nutrition', 'MuscleBlaze', 'Omron', 'Dettol'],
    popular: ['Protein', 'Supplements', 'Medical Devices'],
    subcategories: [
      'Supplements', 'Protein', 'Medical Devices', 'Fitness', 'Personal Hygiene'
    ]
  },
  {
    name: 'Jewelry & Accessories',
    icon: Gem,
    promo: 'Pure Silver Rings & Necklaces - Festive Special',
    brands: ['Tanishq', 'Giva', 'Malabar', 'Swarovski'],
    popular: ['Gold', 'Silver', 'Rings', 'Necklaces'],
    subcategories: [
      'Gold', 'Silver', 'Diamond', 'Artificial Jewelry', 'Rings', 'Necklaces', 
      'Bracelets', 'Earrings'
    ]
  },
  {
    name: 'Luggage & Travel',
    icon: Luggage,
    promo: 'Hard-shell Spinner Suitcases - 5 Years Warranty',
    brands: ['Samsonite', 'American Tourister', 'Safari', 'VIP'],
    popular: ['Travel Bags', 'Suitcases', 'Backpacks'],
    subcategories: [
      'Travel Bags', 'Suitcases', 'Backpacks', 'Laptop Bags', 'Duffel Bags'
    ]
  },
  {
    name: 'Music & Instruments',
    icon: Music,
    promo: 'Acoustic Guitars & Studio Microphones up to 20% Off',
    brands: ['Yamaha', 'Casio', 'Fender', 'Gibson', 'Shure'],
    popular: ['Keyboards', 'Acoustic Guitars', 'Microphones'],
    subcategories: [
      'Acoustic Guitars', 'Electric Guitars', 'Keyboards', 'Drums', 'Violins', 
      'Microphones', 'Audio Interfaces', 'Amplifiers', 'Accessories'
    ]
  },
  {
    name: 'Gaming',
    icon: Gamepad2,
    promo: 'Next-gen PS5 & Xbox Console Accessories',
    brands: ['Sony', 'Microsoft', 'Nintendo', 'Razer', 'Logitech'],
    popular: ['PlayStation', 'Xbox', 'Gaming Chairs', 'Gaming Headsets'],
    subcategories: [
      'Gaming Consoles', 'PlayStation', 'Xbox', 'Nintendo', 'Gaming Chairs', 
      'Gaming Mouse', 'Gaming Keyboard', 'Gaming Headsets'
    ]
  },
  {
    name: 'Smart Gadgets',
    icon: Cpu,
    promo: 'Smart Home Security Cameras starting at $39',
    brands: ['Xiaomi', 'TP-Link', 'Ring', 'Google', 'Amazon'],
    popular: ['Smart Home', 'Security Cameras', 'Voice Assistants'],
    subcategories: [
      'Smart Home', 'Smart Lights', 'Security Cameras', 'Smart Door Locks', 
      'Voice Assistants', 'IoT Devices'
    ]
  },
  {
    name: 'Gifts',
    icon: Gift,
    promo: 'Exquisite Chocolate Gift Hampers for Birthdays',
    brands: ['Cadbury', 'Ferrero Rocher', 'Archies', 'Ferns N Petals'],
    popular: ['Gift Hampers', 'Personalized Gifts', 'Photo Frames'],
    subcategories: [
      'Gift Hampers', 'Personalized Gifts', 'Flower Bouquets', 'Greeting Cards', 
      'Photo Frames', 'Chocolates'
    ]
  },
  {
    name: 'Deals',
    icon: Percent,
    promo: 'Today\'s Top Deals - Save up to 70%!',
    brands: ['Apple', 'Samsung', 'Boat', 'Nike', 'HP'],
    popular: ['Today\'s Deals', 'Flash Sale', 'Coupons'],
    subcategories: [
      'Today\'s Deals', 'Flash Sale', 'Clearance', 'Festival Offers', 
      'Bank Offers', 'Coupons', 'Best Sellers', 'Top Rated', 'Trending Products'
    ]
  },
  {
    name: 'New Arrivals',
    icon: Flame,
    promo: 'Be the first to buy the latest products of 2026!',
    brands: ['OnePlus', 'Apple', 'Adidas', 'Sony', 'Dell'],
    popular: ['Latest Electronics', 'Fresh Fashion', 'Latest Gadgets'],
    subcategories: [
      'Latest Electronics', 'Fresh Fashion', 'New Books', 'Latest Gadgets', 'New Home Decor'
    ]
  },
  {
    name: 'Brands',
    icon: Award,
    promo: 'Official Brand Stores - 100% Genuine Products',
    brands: ['Apple', 'Samsung', 'Sony', 'LG', 'HP'],
    popular: ['Apple Store', 'Samsung Zone', 'Nike Outlet'],
    subcategories: [
      'Apple', 'Samsung', 'Sony', 'LG', 'HP', 'Dell', 'Lenovo', 'ASUS', 
      'OnePlus', 'Realme', 'Xiaomi', 'Boat', 'Noise', 'Nike', 'Adidas', 'Puma'
    ]
  },
  {
    name: 'Gift Cards',
    icon: CreditCard,
    promo: 'Gift cards for your loved ones - Send instantly via Email',
    brands: ['NexaCart', 'Amazon', 'Google Play', 'Steam', 'Netflix'],
    popular: ['E-Gift Vouchers', 'Festive Gift Cards'],
    subcategories: [
      'E-Gift Vouchers', 'Corporate Gift Cards', 'Festive Gift Cards', 'Brand Vouchers'
    ]
  },
  {
    name: 'Offer Zone',
    icon: BadgePercent,
    promo: 'Clearance Sale - Under $99 Store is Live!',
    brands: ['Boat', 'Realme', 'Puma', 'Noise', 'Realme'],
    popular: ['Under $99 Store', 'Buy 1 Get 1', 'Coupon Discounts'],
    subcategories: [
      'Coupon Discounts', 'Buy 1 Get 1', 'Under $99 Store', 'Clearance Deals'
    ]
  }
];

export const CategoryNav = () => {
  const navigate = useNavigate();
  const { setFilters } = useApp();
  const scrollContainerRef = useRef(null);
  const [activeMenuIdx, setActiveMenuIdx] = useState(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleSubcategoryClick = (categoryName, subcat) => {
    setActiveMenuIdx(null);
    setFilters((prev) => ({
      ...prev,
      category: categoryName,
      keyword: subcat
    }));
    navigate(`/shop?category=${encodeURIComponent(categoryName)}&keyword=${encodeURIComponent(subcat)}`);
  };

  const handleCategoryHeaderClick = (categoryName) => {
    setActiveMenuIdx(null);
    setFilters((prev) => ({
      ...prev,
      category: categoryName,
      keyword: ''
    }));
    navigate(`/shop?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div 
      className="bg-white border-b border-slate-200 sticky top-[69px] z-30 w-full hidden md:block select-none shadow-sm"
      onMouseLeave={() => setActiveMenuIdx(null)}
    >
      <div className="max-w-7xl mx-auto px-6 relative flex flex-col group/nav">
        
        <div className="flex items-center w-full relative">
          {/* Left Arrow Button */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 bg-white/90 hover:bg-white text-slate-800 p-1.5 rounded-full border border-slate-200 shadow-md z-10 opacity-0 group-hover/nav:opacity-100 transition-opacity hover:scale-105"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Categories Bar Horizontal Scrolling */}
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-9 overflow-x-auto py-3 px-2 w-full no-scrollbar whitespace-nowrap scroll-smooth"
          >
            {categoriesData.map((cat, idx) => {
              const IconComponent = cat.icon;
              const isActive = activeMenuIdx === idx;

              return (
                <div
                  key={cat.name}
                  className="relative flex-shrink-0"
                  onMouseEnter={() => setActiveMenuIdx(idx)}
                >
                  {/* Horizontal Navigation Category Trigger */}
                  <button
                    onClick={() => handleCategoryHeaderClick(cat.name)}
                    className={`flex items-center gap-1.5 text-[13px] font-extrabold transition-all pb-1.5 border-b-2 hover:text-[#2874F0] ${
                      isActive
                        ? 'text-[#2874F0] border-[#2874F0]'
                        : 'text-slate-900 border-transparent'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 transition-transform ${isActive ? 'scale-110 text-[#2874F0]' : 'text-slate-700'}`} />
                    <span>{cat.name}</span>
                    <ChevronDown className={`w-3.5 h-3.5 opacity-80 transition-transform ${isActive ? 'rotate-180 text-[#2874F0]' : 'text-slate-500'}`} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 bg-white/90 hover:bg-white text-slate-800 p-1.5 rounded-full border border-slate-200 shadow-md z-10 opacity-0 group-hover/nav:opacity-100 transition-opacity hover:scale-105"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Dropdown Mega Menu Panel (Outside the scroll container to prevent overflow-x-auto clipping!) */}
        <AnimatePresence>
          {activeMenuIdx !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.99 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute top-full left-6 right-6 pt-2 z-50"
              onMouseEnter={() => setActiveMenuIdx(activeMenuIdx)}
              onMouseLeave={() => setActiveMenuIdx(null)}
            >
              <div className="bg-white border border-slate-200/80 shadow-2xl rounded-3xl p-6 flex gap-8 w-full">
                {(() => {
                  const cat = categoriesData[activeMenuIdx];
                  return (
                    <>
                      {/* Left Part: Subcategories structured in columns */}
                      <div className="flex-1">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2.5 mb-4">
                          <span className="text-xs font-black uppercase text-[#2874F0] tracking-wider">
                            Explore {cat.name}
                          </span>
                          <button
                            onClick={() => handleCategoryHeaderClick(cat.name)}
                            className="text-xs text-slate-650 font-bold hover:text-[#2874F0] flex items-center gap-0.5"
                          >
                            View All <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Columns mapping */}
                        <div className="grid grid-cols-4 gap-x-8 gap-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                          {cat.subcategories.map((subcat) => (
                            <button
                              key={subcat}
                              onClick={() => handleSubcategoryClick(cat.name, subcat)}
                              className="text-left text-[12.5px] font-bold text-slate-900 hover:text-[#2874F0] hover:underline truncate py-0.5 transition-colors"
                            >
                              {subcat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Right Part: Glassmorphism Promo Banner, Featured brands & Popular tags */}
                      <div className="w-[260px] border-l border-slate-100 pl-8 flex flex-col justify-between gap-5">
                        {/* Promo banner */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 rounded-xl p-4 flex flex-col justify-between flex-1">
                          <div>
                            <span className="bg-[#2874F0] text-white text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Trending Offer
                            </span>
                            <p className="text-xs font-bold text-slate-900 leading-snug mt-2.5">
                              {cat.promo}
                            </p>
                          </div>
                          <button
                            onClick={() => handleCategoryHeaderClick(cat.name)}
                            className="text-[11px] text-[#2874F0] font-black tracking-wider uppercase flex items-center gap-1 mt-4 hover:underline"
                          >
                            Shop Deal <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Top Brands */}
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 mb-2">
                            Featured Brands
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {cat.brands.map((brand) => (
                              <button
                                key={brand}
                                onClick={() => {
                                  setActiveMenuIdx(null);
                                  setFilters((prev) => ({ ...prev, brand }));
                                  navigate(`/shop?brand=${encodeURIComponent(brand)}`);
                                }}
                                className="text-xs font-bold bg-slate-100 hover:bg-blue-50 hover:text-[#2874F0] text-slate-800 px-2.5 py-1 rounded-xl border border-slate-200/50 transition-colors"
                              >
                                {brand}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Popular Searches */}
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 mb-2">
                            Popular Searches
                          </p>
                          <div className="flex flex-wrap gap-1.5 animate-in fade-in duration-300">
                            {cat.popular.map((term) => (
                              <button
                                key={term}
                                onClick={() => handleSubcategoryClick(cat.name, term)}
                                className="text-xs font-bold text-slate-700 hover:text-[#2874F0] hover:underline"
                              >
                                {term}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default CategoryNav;
export { categoriesData };
