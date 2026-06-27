import crypto from 'crypto';

// In-Memory Collections Seeding
export const memoryCategories = [
  { _id: 'cat1', name: 'Electronics', description: 'Smartphones, mechanical keyboards, headphones and high-tech components', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat2', name: 'Mobiles & Tablets', description: 'Smartphones, feature phones, iPads and accessories', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat3', name: 'TVs & Appliances', description: 'Smart TVs, OLED displays, washing machines and refrigerators', image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat4', name: 'Fashion', description: 'Sustainable clothing, dresses, summer jackets and footwear', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat5', name: 'Men', description: 'Mens shirts, formal trousers, hoodies and shoes', image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat6', name: 'Women', description: 'Womens sarees, tops, handbags and beauty items', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat7', name: 'Kids & Baby', description: 'Infant wear, school bags, baby food and toddler toys', image: 'https://images.unsplash.com/photo-1519689680058-324335c77ebe?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat8', name: 'Beauty & Personal Care', description: 'Skincare serums, luxury makeup, perfumes and grooming kits', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat9', name: 'Home & Furniture', description: 'Luxe sofas, comfortable mattresses, custom lamps and decor', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat10', name: 'Kitchen & Dining', description: 'Cookware sets, mix grinders, dinner plates and coffee makers', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat11', name: 'Grocery', description: 'Fresh vegetables, organic rice, dairy, daily cleaning items', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat12', name: 'Sports & Fitness', description: 'Gym equipment, yoga mats, cricket gear and cycles', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat13', name: 'Books & Stationery', description: 'Academic textbooks, competitive exams, novels, and pens', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat14', name: 'Toys & Games', description: 'Educational puzzles, board games and remote control toy cars', image: 'https://images.unsplash.com/photo-1536640712247-3a97c6c2942b?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat15', name: 'Automotive', description: 'Helmets, bike accessories, premium lubricants, tyres', image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat16', name: 'Office Supplies', description: 'Ergonomic office chairs, printers, printing papers, and desks', image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat17', name: 'Pet Supplies', description: 'Nutritious dog food, cat food, chew toys and grooming kits', image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat18', name: 'Health & Wellness', description: 'Daily supplements, whey protein isolates, medical gears', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat19', name: 'Jewelry & Accessories', description: 'Gold rings, diamond earrings, silver necklaces and bands', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat20', name: 'Luggage & Travel', description: 'Hard-shell spinner suitcases, laptop backpacks, travel luggage', image: 'https://images.unsplash.com/photo-1565026057447-bc90a3dbe297?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat21', name: 'Music & Instruments', description: 'Acoustic guitars, MIDI keyboards, studio microphones, drums', image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat22', name: 'Gaming', description: 'Next-gen consoles, gaming mice, keyboards and mechanical chairs', image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat23', name: 'Smart Gadgets', description: 'Smart light bulbs, security IP cameras, voice assistants', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat24', name: 'Gifts', description: 'Personalized frames, chocolate baskets, bouquets, greeting cards', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat25', name: 'Deals', description: 'Massive clearance items and dynamic coupons up to 70% Off', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat26', name: 'New Arrivals', description: 'Be the first to browse the latest catalog trends of 2026', image: 'https://images.unsplash.com/photo-1472851294608-062f824d296e?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat27', name: 'Brands', description: 'Apple, Samsung, Nike, Sony official partner storefronts', image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat28', name: 'Gift Cards', description: 'Redeemable E-vouchers and holiday card codes', image: 'https://images.unsplash.com/photo-1574634534894-89d7576c8259?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat29', name: 'Offer Zone', description: 'Coupons, super savers under $99 shop, buy 1 get 1 offers', image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=150&q=80' }
];

export const memoryBrands = [
  { _id: 'brand1', name: 'Apple', logo: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=60&q=80', description: 'Premium tech and modern lifestyles' },
  { _id: 'brand2', name: 'Samsung', logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=60&q=80', description: 'Leading-edge display systems' },
  { _id: 'brand3', name: 'AeroSound', logo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=60&q=80', description: 'Next-gen acoustic drivers and ergonomic designs' },
  { _id: 'brand4', name: 'AuraGlow', logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=60&q=80', description: 'Smart lighting structures and interactive panels' },
  { _id: 'brand5', name: 'Chronos', logo: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=60&q=80', description: 'Premium health tracking watches and holographic displays' },
  { _id: 'brand6', name: 'Titan', logo: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=60&q=80', description: 'Tactile custom keyboard linear switches' },
  { _id: 'brand7', name: 'EcoVibe', logo: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=60&q=80', description: 'Organic apparel and calfskin waterproof backbags' }
];

export const memoryCoupons = [
  { _id: 'coup1', code: 'GLASS3D', discountType: 'percent', discountValue: 15, expiryDate: new Date('2028-12-31'), usageLimit: 200, usedCount: 0 },
  { _id: 'coup2', code: 'WELCOME100', discountType: 'fixed', discountValue: 100, expiryDate: new Date('2028-12-31'), usageLimit: 500, usedCount: 0 }
];

const subcategoriesMap = {
  'Electronics': [
    'Laptops', 'Gaming Laptops', 'MacBooks', 'Desktop PCs', 'Monitors', 
    'Computer Components', 'Keyboards', 'Mouse', 'Printers', 'Networking', 
    'WiFi Routers', 'Storage Devices', 'SSD', 'Hard Drives', 'Pendrives', 
    'Graphics Cards', 'Motherboards', 'Processors', 'RAM', 'Webcams', 
    'Projectors', 'Accessories'
  ],
  'Mobiles & Tablets': [
    'Smartphones', 'Feature Phones', '5G Phones', 'Tablets', 'iPads', 
    'Cases', 'Tempered Glass', 'Chargers', 'Power Banks', 'Earbuds', 
    'Headphones', 'Smart Watches', 'Fitness Bands', 'Mobile Accessories'
  ],
  'TVs & Appliances': [
    'Smart TVs', 'OLED TVs', 'LED TVs', 'QLED TVs', 'Projectors', 
    'Air Conditioners', 'Refrigerators', 'Washing Machines', 'Dishwashers', 
    'Microwave Ovens', 'OTG', 'Air Fryers', 'Vacuum Cleaners', 'Water Purifiers', 
    'Fans', 'Geysers', 'Kitchen Appliances', 'Home Appliances'
  ],
  'Fashion': [
    'Trending', 'New Collection', 'Summer Wear', 'Winter Wear', 
    'Ethnic Wear', 'Western Wear', 'Premium Brands', 'Luxury Fashion', 
    'Footwear', 'Accessories'
  ],
  'Men': [
    'T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Shorts', 'Jackets', 
    'Blazers', 'Suits', 'Sweatshirts', 'Hoodies', 'Ethnic Wear', 
    'Innerwear', 'Sportswear', 'Shoes', 'Sandals', 'Wallets', 'Belts', 
    'Watches', 'Sunglasses', 'Bags'
  ],
  'Women': [
    'Dresses', 'Tops', 'T-Shirts', 'Jeans', 'Leggings', 'Skirts', 
    'Sarees', 'Kurtis', 'Salwar Suits', 'Lehengas', 'Blouses', 
    'Handbags', 'Jewelry', 'Heels', 'Flats', 'Beauty Products', 
    'Perfumes', 'Watches'
  ],
  'Kids & Baby': [
    'Boys Clothing', 'Girls Clothing', 'Infant Wear', 'Baby Care', 
    'Diapers', 'Baby Food', 'School Bags', 'Toys', 'Baby Furniture', 
    'Feeding Accessories'
  ],
  'Beauty & Personal Care': [
    'Makeup', 'Skincare', 'Hair Care', 'Personal Care', 'Men Grooming', 
    'Fragrances', 'Luxury Beauty', 'Organic Products'
  ],
  'Home & Furniture': [
    'Living Room', 'Bedroom', 'Dining Room', 'Office Furniture', 'Sofas', 
    'Beds', 'Mattresses', 'Wardrobes', 'Tables', 'Chairs', 'Home Decor', 
    'Curtains', 'Lighting', 'Wall Decor', 'Storage'
  ],
  'Kitchen & Dining': [
    'Cookware', 'Dinner Sets', 'Storage Containers', 'Kitchen Tools', 
    'Mixer Grinder', 'Gas Stove', 'Coffee Maker', 'Toaster', 'Pressure Cooker'
  ],
  'Grocery': [
    'Vegetables', 'Fruits', 'Rice', 'Flour', 'Snacks', 'Beverages', 
    'Dairy', 'Frozen Foods', 'Daily Essentials', 'Cleaning Supplies'
  ],
  'Sports & Fitness': [
    'Gym Equipment', 'Cricket', 'Football', 'Badminton', 'Cycling', 
    'Running', 'Yoga', 'Camping', 'Swimming'
  ],
  'Books & Stationery': [
    'Academic', 'Engineering', 'Programming', 'Fiction', 'Non-fiction', 
    'Comics', 'Competitive Exams', 'Children Books'
  ],
  'Toys & Games': [
    'Educational Toys', 'Action Figures', 'Remote Control Toys', 'Puzzles', 
    'Board Games', 'Dolls', 'Outdoor Toys'
  ],
  'Automotive': [
    'Car Accessories', 'Bike Accessories', 'Helmets', 'Tyres', 'Lubricants', 
    'Cleaning Kits'
  ],
  'Office Supplies': [
    'Office Chairs', 'Desks', 'Stationery', 'Printers', 'Paper', 'Office Electronics'
  ],
  'Pet Supplies': [
    'Dog Food', 'Cat Food', 'Pet Toys', 'Pet Beds', 'Pet Grooming'
  ],
  'Health & Wellness': [
    'Supplements', 'Protein', 'Medical Devices', 'Fitness', 'Personal Hygiene'
  ],
  'Jewelry & Accessories': [
    'Gold', 'Silver', 'Diamond', 'Artificial Jewelry', 'Rings', 'Necklaces', 
    'Bracelets', 'Earrings'
  ],
  'Luggage & Travel': [
    'Travel Bags', 'Suitcases', 'Backpacks', 'Laptop Bags', 'Duffel Bags'
  ],
  'Music & Instruments': [
    'Acoustic Guitars', 'Electric Guitars', 'Keyboards', 'Drums', 'Violins', 
    'Microphones', 'Audio Interfaces', 'Amplifiers', 'Accessories'
  ],
  'Gaming': [
    'Gaming Consoles', 'PlayStation', 'Xbox', 'Nintendo', 'Gaming Chairs', 
    'Gaming Mouse', 'Gaming Keyboard', 'Gaming Headsets'
  ],
  'Smart Gadgets': [
    'Smart Home', 'Smart Lights', 'Security Cameras', 'Smart Door Locks', 
    'Voice Assistants', 'IoT Devices'
  ],
  'Gifts': [
    'Gift Hampers', 'Personalized Gifts', 'Flower Bouquets', 'Greeting Cards', 
    'Photo Frames', 'Chocolates'
  ],
  'Deals': [
    'Today\'s Deals', 'Flash Sale', 'Clearance', 'Festival Offers', 
    'Bank Offers', 'Coupons', 'Best Sellers', 'Top Rated', 'Trending Products'
  ],
  'New Arrivals': [
    'Latest Electronics', 'Fresh Fashion', 'New Books', 'Latest Gadgets', 'New Home Decor'
  ],
  'Brands': [
    'Apple', 'Samsung', 'Sony', 'LG', 'HP', 'Dell', 'Lenovo', 'ASUS', 
    'OnePlus', 'Realme', 'Xiaomi', 'Boat', 'Noise', 'Nike', 'Adidas', 'Puma'
  ],
  'Gift Cards': [
    'E-Gift Vouchers', 'Corporate Gift Cards', 'Festive Gift Cards', 'Brand Vouchers'
  ],
  'Offer Zone': [
    'Coupon Discounts', 'Buy 1 Get 1', 'Under $99 Store', 'Clearance Deals'
  ]
};

const subcategoriesBrands = {
  'Electronics': ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS'],
  'Mobiles & Tablets': ['Apple', 'Samsung', 'OnePlus', 'Realme', 'Xiaomi'],
  'TVs & Appliances': ['Sony', 'Samsung', 'LG', 'Xiaomi', 'TCL'],
  'Fashion': ['Zara', 'H&M', 'Nike', 'Adidas', 'Puma'],
  'Men': ['Nike', 'Levis', 'Tommy Hilfiger', 'Polo', 'Jack & Jones'],
  'Women': ['Zara', 'Biba', 'Vero Moda', 'Forever 21', 'Only'],
  'Kids & Baby': ['Mothercare', 'FirstCry', 'Chicco', 'Lego', 'Disney'],
  'Beauty & Personal Care': ['L\'Oreal', 'Maybelline', 'MAC', 'Clinique', 'Estee Lauder'],
  'Home & Furniture': ['IKEA', 'Sleepwell', 'Pepperfry', 'HomeCentre'],
  'Kitchen & Dining': ['Philips', 'Prestige', 'Hawkins', 'Pigeon'],
  'Grocery': ['Nestle', 'Kelloggs', 'Aashirvaad', 'Tropicana', 'Amul'],
  'Sports & Fitness': ['Decathlon', 'Yonex', 'Cosco', 'Adidas', 'Speedo'],
  'Books & Stationery': ['Penguin', 'HarperCollins', 'Oxford', 'Classmate'],
  'Toys & Games': ['Lego', 'Hot Wheels', 'Barbie', 'Hasbro', 'Nerf'],
  'Automotive': ['3M', 'Bosch', 'Michelin', 'Vega', 'Motul'],
  'Office Supplies': ['HP', 'Canon', 'Epson', 'Featherlite'],
  'Pet Supplies': ['Pedigree', 'Royal Canin', 'Whiskas', 'Purina'],
  'Health & Wellness': ['Optimum Nutrition', 'MuscleBlaze', 'Omron', 'Dettol'],
  'Jewelry & Accessories': ['Tanishq', 'Giva', 'Malabar', 'Swarovski'],
  'Luggage & Travel': ['Samsonite', 'American Tourister', 'Safari', 'VIP'],
  'Music & Instruments': ['Yamaha', 'Casio', 'Fender', 'Gibson', 'Shure'],
  'Gaming': ['Sony', 'Microsoft', 'Nintendo', 'Razer', 'Logitech'],
  'Smart Gadgets': ['Xiaomi', 'TP-Link', 'Ring', 'Google', 'Amazon'],
  'Gifts': ['Cadbury', 'Ferrero Rocher', 'Archies', 'Ferns N Petals'],
  'Deals': ['Apple', 'Samsung', 'Boat', 'Nike', 'HP'],
  'New Arrivals': ['OnePlus', 'Apple', 'Adidas', 'Sony', 'Dell'],
  'Brands': ['Apple', 'Samsung', 'Sony', 'LG', 'HP'],
  'Gift Cards': ['NexaCart', 'Amazon', 'Google Play', 'Steam', 'Netflix'],
  'Offer Zone': ['Boat', 'Realme', 'Puma', 'Noise', 'Realme']
};

const categoryImages = {
  'Electronics': [
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80'
  ],
  'Mobiles & Tablets': [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1609592424109-dd9892f1b17c?auto=format&fit=crop&w=600&q=80'
  ],
  'TVs & Appliances': [
    'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1582730147233-ac811244c2c2?auto=format&fit=crop&w=600&q=80'
  ],
  'Fashion': [
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80'
  ],
  'Men': [
    'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80'
  ],
  'Women': [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80'
  ],
  'Kids & Baby': [
    'https://images.unsplash.com/photo-1519689680058-324335c77ebe?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'
  ],
  'Beauty & Personal Care': [
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80'
  ],
  'Home & Furniture': [
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=80'
  ],
  'Kitchen & Dining': [
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=600&q=80'
  ],
  'Grocery': [
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80'
  ],
  'Sports & Fitness': [
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=600&q=80'
  ],
  'Books & Stationery': [
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80'
  ],
  'Toys & Games': [
    'https://images.unsplash.com/photo-1536640712247-3a97c6c2942b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1507582195869-42c77ae92d14?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80'
  ]
};

const generateProductsForSubcategory = (category, subCategory, subcatIdx) => {
  const products = [];
  const brands = subcategoriesBrands[category] || ['Generic'];
  
  const defaultImgs = categoryImages[category] || [
    'https://images.unsplash.com/photo-1472851294608-062f824d296e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80'
  ];

  const sampleVideos = [
    'https://assets.mixkit.co/videos/preview/mixkit-keyboard-under-colored-lights-close-up-34324-large.mp4',
    'https://www.w3schools.com/html/mov_bbb.mp4'
  ];

  for (let i = 1; i <= 10; i++) {
    const price = Math.round(15 + Math.random() * 450);
    
    const specifications = {
      'Quality Standard': `Verified Level ${i}`,
      'Warranty Period': '2 Years International',
      'Model Identifier': `NEX-${category.substring(0, 3).replace(/[^a-zA-Z]/g, '').toUpperCase()}-${subCategory.substring(0, 3).replace(/[^a-zA-Z]/g, '').toUpperCase()}-V${i}`
    };

    products.push({
      _id: `p_${category.replace(/[^a-zA-Z0-9]/g, '')}_${subCategory.replace(/[^a-zA-Z0-9]/g, '')}_${i}`,
      title: `Supreme ${subCategory} - Model V${i}`,
      description: `Premium selection of ${subCategory}. Designed with high durability, exceptional aesthetics, and maximum utility. Perfect addition to your daily standard lifestyle.`,
      price: price,
      category: category,
      subCategory: subCategory,
      brand: brands[i % brands.length],
      images: [
        defaultImgs[0],
        defaultImgs[1] || defaultImgs[0],
        defaultImgs[2] || defaultImgs[0]
      ],
      videos: [sampleVideos[i % sampleVideos.length]],
      inventoryCount: 5 + Math.floor(Math.random() * 40),
      colors: ['Midnight Black', 'Carbon Grey', 'Frost White'],
      sizes: ['Standard Size', 'Plus Pack'],
      specifications: specifications,
      isFlashSale: i === 3,
      flashSalePrice: i === 3 ? Math.round(price * 0.85) : undefined,
      ratings: {
        average: Number((4.0 + Math.random() * 1.0).toFixed(1)),
        count: 5 + Math.floor(Math.random() * 95)
      },
      reviews: []
    });
  }
  return products;
};

const generatedProducts = [];
for (const catName of Object.keys(subcategoriesMap)) {
  const subcats = subcategoriesMap[catName];
  subcats.forEach((subcat, idx) => {
    generatedProducts.push(...generateProductsForSubcategory(catName, subcat, idx));
  });
}

export const memoryProducts = generatedProducts;

export const memoryUsers = [
  {
    _id: 'admin1',
    name: 'Admin Manager',
    email: 'admin@nexacart.com',
    password: 'password123',
    role: 'admin',
    country: 'India',
    isEmailVerified: true,
    shippingAddresses: [],
    wishlist: [],
    walletBalance: 500,
    loyaltyPoints: 100,
    referralCode: 'REF-ADMIN',
    isBanned: false
  },
  {
    _id: 'user1',
    name: 'Jane Customer',
    email: 'user@nexacart.com',
    password: 'password123',
    role: 'user',
    country: 'USA',
    isEmailVerified: true,
    shippingAddresses: [],
    wishlist: [],
    walletBalance: 150,
    loyaltyPoints: 30,
    referralCode: 'REF-JANE',
    isBanned: false
  }
];

export const memoryCarts = {};
export const memoryOrders = [];
export const memoryTickets = [];
export const memoryNotifications = [];
