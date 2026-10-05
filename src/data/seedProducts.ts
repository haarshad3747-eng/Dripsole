import { doc, getDocs, collection, writeBatch, setDoc, query, limit } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { Product, Review, StoreSettings } from '../types';
import { FIRST_ADMIN_EMAIL } from '../config';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'aj1-chicago-lost-found',
    name: 'Air Jordan 1 Retro High OG "Chicago Lost & Found"',
    brand: 'Air Jordan',
    category: 'Sneakers',
    gender: 'Men',
    price: 34999,
    salePrice: 28999,
    images: [
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: {
      '38': 2,
      '39': 0,
      '40': 4,
      '41': 6,
      '42': 8,
      '43': 3,
      '44': 2,
      '45': 0
    },
    rating: 4.9,
    reviewCount: 48,
    isHyped: true,
    isClearance: false,
    description: 'The Air Jordan 1 Retro High OG "Chicago Lost & Found" pays homage to the legendary 1985 silhouette with vintage cracked leather detailing, muslin tongue, and nostalgic shoebox aesthetics.',
    details: [
      'Colorway: Varsity Red/Black/Sail/Muslin',
      'Cracked leather collars and side panels',
      'Pre-aged yellowed midsole',
      'Includes original receipt replica & mismatched lid box'
    ],
    colorway: 'Varsity Red / Black / Sail',
    sku: 'DZ5485-612'
  },
  {
    id: 'travis-scott-jordan-1-reverse-mocha',
    name: 'Travis Scott x Air Jordan 1 Low OG "Reverse Mocha"',
    brand: 'Air Jordan',
    category: 'Sneakers',
    gender: 'Men',
    price: 98999,
    salePrice: 84999,
    images: [
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: {
      '38': 0,
      '39': 1,
      '40': 2,
      '41': 3,
      '42': 5,
      '43': 2,
      '44': 1,
      '45': 0
    },
    rating: 5.0,
    reviewCount: 36,
    isHyped: true,
    isClearance: false,
    description: 'La Flame’s iconic reverse oversized Swoosh paired with mocha nubuck overlays and crisp white leather. Cactus Jack signature emblems embroidered on the heels.',
    details: [
      'Colorway: Sail / Ridgerock',
      'Reversed Swoosh on lateral sides',
      'Cactus Jack branding on heel and tongue',
      'Premium suede and tumbled leather construction'
    ],
    colorway: 'Sail / Ridgerock / University Red',
    sku: 'DM7866-162'
  },
  {
    id: 'nike-dunk-low-panda',
    name: 'Nike Dunk Low Retro "Panda"',
    brand: 'Nike',
    category: 'Sneakers',
    gender: 'Unisex',
    price: 13999,
    salePrice: 10499,
    images: [
      'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: {
      '36': 4,
      '37': 5,
      '38': 7,
      '39': 6,
      '40': 10,
      '41': 12,
      '42': 15,
      '43': 8,
      '44': 4,
      '45': 2
    },
    rating: 4.7,
    reviewCount: 112,
    isHyped: true,
    isClearance: false,
    description: 'The most versatile streetwear staple on the planet. Crisp white leather base with contrasting black leather overlays and rubber traction cupsole.',
    details: [
      'Colorway: White/Black',
      'Crisp leather upper with classic perforations',
      'Foam midsole for lightweight cushioning',
      'Durable rubber outsole with pivot circle'
    ],
    colorway: 'White / Black',
    sku: 'DD1391-100'
  },
  {
    id: 'yeezy-boost-350-v2-onyx',
    name: 'Adidas Yeezy Boost 350 V2 "Onyx"',
    brand: 'Adidas',
    category: 'Sneakers',
    gender: 'Men',
    price: 26999,
    salePrice: 22499,
    images: [
      'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1588099768531-a72d4a198538?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: {
      '39': 0,
      '40': 3,
      '41': 5,
      '42': 7,
      '43': 4,
      '44': 2,
      '45': 1
    },
    rating: 4.8,
    reviewCount: 64,
    isHyped: true,
    isClearance: false,
    description: 'Triple-black murdered-out Primeknit upper woven with monofilament post-dyed side stripe. Full-length encapsulated adidas Boost cushioning.',
    details: [
      'Colorway: Onyx / Onyx / Onyx',
      'Re-engineered Primeknit breathable upper',
      'Ribbed TPU midsole wrapping responsive Boost core',
      'Distinctive heel tab'
    ],
    colorway: 'Triple Onyx Black',
    sku: 'HQ4540'
  },
  {
    id: 'new-balance-550-white-grey',
    name: 'New Balance 550 "White Grey"',
    brand: 'New Balance',
    category: 'Sneakers',
    gender: 'Unisex',
    price: 14999,
    salePrice: 11999,
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: {
      '37': 3,
      '38': 4,
      '39': 5,
      '40': 8,
      '41': 10,
      '42': 12,
      '43': 6,
      '44': 3,
      '45': 1
    },
    rating: 4.8,
    reviewCount: 52,
    isHyped: true,
    isClearance: false,
    description: 'Tribute to 1989 basketball culture. Streamlined retro low-top with premium white leather, perforated quarter panels, and subtle slate grey suede accents.',
    details: [
      'Colorway: Sea Salt / Team Away Grey',
      'High grade leather with micro-perforations',
      'Non-marking rubber cupsole',
      'Vintage basketball heritage branding'
    ],
    colorway: 'White / Grey',
    sku: 'BB550PB1'
  },
  {
    id: 'asics-gel-kayano-14-silver',
    name: 'Asics Gel-Kayano 14 "Metallic Silver Cream"',
    brand: 'Asics',
    category: 'Sneakers',
    gender: 'Unisex',
    price: 18999,
    salePrice: 15499,
    images: [
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: {
      '38': 3,
      '39': 4,
      '40': 7,
      '41': 9,
      '42': 11,
      '43': 5,
      '44': 0,
      '45': 0
    },
    rating: 4.9,
    reviewCount: 41,
    isHyped: true,
    isClearance: false,
    description: 'The pinnacle of Y2K retro tech runner styling. Layered synthetic leather and open mesh construction powered by visible GEL cushioning geometry.',
    details: [
      'Colorway: Cream / Pure Silver',
      'TRUSSTIC support system',
      'GEL technology cushioning in heel and forefoot',
      'Early 2000s technical aesthetics'
    ],
    colorway: 'Cream / Pure Silver',
    sku: '1201A019-105'
  },
  {
    id: 'birkenstock-boston-taupe',
    name: 'Birkenstock Boston Clog "Taupe Suede"',
    brand: 'Birkenstock',
    category: 'Sandals',
    gender: 'Unisex',
    price: 15999,
    salePrice: 12999,
    images: [
      'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: {
      '37': 4,
      '38': 6,
      '39': 8,
      '40': 9,
      '41': 7,
      '42': 5,
      '43': 3,
      '44': 2,
      '45': 0
    },
    rating: 4.9,
    reviewCount: 78,
    isHyped: true,
    isClearance: false,
    description: 'The fashion world’s favorite streetwear slip-on. Supple genuine taupe suede with anatomically molded natural cork-latex footbed.',
    details: [
      'Upper: Velvety suede leather',
      'Footbed lining: Suede',
      'Sole: Lightweight EVA',
      'Individually adjustable metal pin buckle'
    ],
    colorway: 'Taupe',
    sku: '0560771'
  },
  {
    id: 'crocs-pollex-clog-salehe-bembury',
    name: 'Crocs Pollex Clog by Salehe Bembury "Urchin"',
    brand: 'Crocs',
    category: 'Sandals',
    gender: 'Unisex',
    price: 12999,
    salePrice: 9999,
    images: [
      'https://images.unsplash.com/photo-1562183241-b937e95585b6?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: {
      '38': 2,
      '39': 3,
      '40': 5,
      '41': 8,
      '42': 6,
      '43': 4,
      '44': 1,
      '45': 0
    },
    rating: 4.8,
    reviewCount: 33,
    isHyped: true,
    isClearance: false,
    description: 'Groundbreaking organic fingerprint ridge mold by industrial designer Salehe Bembury. Water-resistant Croslite foam with translucent rubber traction pads.',
    details: [
      '3 of Salehe Bembury’s signature fingerprints merged',
      'Adjustable and removable nylon heel strap',
      'Drainage holes aligned with high heat zones',
      'Multi-directional traction pods'
    ],
    colorway: 'Urchin Pale Violet',
    sku: '207393-5PS'
  },
  {
    id: 'puma-suede-classic-xxi',
    name: 'Puma Suede Classic XXI "Black/White"',
    brand: 'Puma',
    category: 'Sneakers',
    gender: 'Men',
    price: 7999,
    salePrice: 4999,
    images: [
      'https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: {
      '39': 3,
      '40': 6,
      '41': 8,
      '42': 10,
      '43': 7,
      '44': 4,
      '45': 2
    },
    rating: 4.6,
    reviewCount: 29,
    isHyped: false,
    isClearance: true,
    description: 'From 1968 b-boy culture to modern street style. Full suede upper with metallic gold foil Puma logo and white Formstrip.',
    details: [
      'Full suede upper with synthetic lining',
      'Comfort sockliner for all-day wear',
      'Rubber midsole and outsole'
    ],
    colorway: 'Puma Black / Puma White',
    sku: '374915-01'
  },
  {
    id: 'vans-old-skool-core-black',
    name: 'Vans Old Skool "Core Black/White"',
    brand: 'Vans',
    category: 'Sneakers',
    gender: 'Unisex',
    price: 6499,
    salePrice: 4299,
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: {
      '36': 4,
      '37': 5,
      '38': 8,
      '39': 9,
      '40': 12,
      '41': 14,
      '42': 16,
      '43': 9,
      '44': 5,
      '45': 2
    },
    rating: 4.7,
    reviewCount: 88,
    isHyped: false,
    isClearance: true,
    description: 'The legendary California skate shoe. Reinforced suede toe caps, durable canvas quarters, and the unmistakable white Jazz Stripe.',
    details: [
      'Durable suede and canvas uppers',
      'Reinforced toe caps to withstand wear',
      'Supportive padded collars',
      'Signature rubber waffle outsoles'
    ],
    colorway: 'Black / True White',
    sku: 'VN000D3HY28'
  },
  {
    id: 'converse-chuck-70-vintage-high',
    name: 'Converse Chuck 70 Vintage High Top',
    brand: 'Converse',
    category: 'Sneakers',
    gender: 'Women',
    price: 6999,
    salePrice: 4799,
    images: [
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: {
      '36': 6,
      '37': 8,
      '38': 10,
      '39': 11,
      '40': 8,
      '41': 5,
      '42': 2
    },
    rating: 4.8,
    reviewCount: 46,
    isHyped: false,
    isClearance: true,
    description: 'Upgraded version of the 1970s icon. Heavier 12oz organic canvas, winged tongue stitching, and varnished egret foxing tape with vintage license plate.',
    details: [
      'Premium 12oz recycled canvas',
      'OrthoLite insole cushioning',
      'Vintage star ankle patch & rubber heel plate',
      'Glossy egret sidewall'
    ],
    colorway: 'Black / Egret',
    sku: '162050C'
  },
  {
    id: 'nike-sb-dunk-low-orange-lobster',
    name: 'Concepts x Nike SB Dunk Low "Orange Lobster"',
    brand: 'Nike',
    category: 'Sneakers',
    gender: 'Men',
    price: 65999,
    salePrice: 54999,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: {
      '39': 0,
      '40': 1,
      '41': 2,
      '42': 3,
      '43': 2,
      '44': 0,
      '45': 0
    },
    rating: 5.0,
    reviewCount: 27,
    isHyped: true,
    isClearance: false,
    description: 'Sixth iteration of the iconic Concepts lobster series. Speckled orange nubuck overlays mimicking a real lobster shell, red-and-white picnic tablecloth bib lining, and rubber claw bands.',
    details: [
      'Colorway: Electro Orange / Total Orange',
      'Gingham patterned collar and insole',
      'Custom rubber claw toe bands included',
      'Zoom Air unit in heel sockliner'
    ],
    colorway: 'Total Orange / White',
    sku: 'FD8776-800'
  },
  // Accessories
  {
    id: 'vault-tech-backpack',
    name: 'Vault Tactical Sneaker Backpack 32L',
    brand: 'Nike',
    category: 'Backpacks',
    gender: 'Unisex',
    price: 9999,
    salePrice: 7499,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: { 'One Size': 15 },
    rating: 4.9,
    reviewCount: 22,
    isHyped: true,
    isClearance: false,
    description: 'Weatherproof Cordura ballistics nylon with dedicated ventilated dual-sneaker compartment, padded 16" laptop sleeve, and Fidlock magnetic buckles.',
    details: [
      'Separated antimicrobial bottom sneaker bay (fits up to EU 46)',
      'Waterproof YKK zippers throughout',
      'MOLLE modular attachment webbing'
    ],
    colorway: 'Matte Obsidian Black',
    sku: 'VK-BP-001'
  },
  {
    id: 'cyberpunk-matte-sunglasses',
    name: 'Kicks Vault "CYBER" Wraparound Shades',
    brand: 'New Balance',
    category: 'Sunglasses',
    gender: 'Unisex',
    price: 4999,
    salePrice: 3499,
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: { 'One Size': 20 },
    rating: 4.8,
    reviewCount: 19,
    isHyped: false,
    isClearance: false,
    description: 'High-speed aerodynamic wrap frames in matte black TR90 polymer with neon volt mirrored UV400 polarized lenses.',
    details: [
      '100% UV400 protection against UVA/UVB',
      'Impact-resistant polycarbonate lenses',
      'Anti-slip silicone nose pads'
    ],
    colorway: 'Matte Black / Volt Mirror',
    sku: 'VK-SG-002'
  },
  {
    id: 'streetwear-digital-watch',
    name: 'Stealth Tactical Chronograph Watch',
    brand: 'Adidas',
    category: 'Watches',
    gender: 'Men',
    price: 11999,
    salePrice: 8999,
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: { 'One Size': 10 },
    rating: 4.7,
    reviewCount: 14,
    isHyped: false,
    isClearance: true,
    description: 'Military-grade matte carbon composite case with negative-display LED, 200m water resistance, and rugged resin strap.',
    details: [
      'Shock and magnetic field resistant',
      '200m water resistance',
      'Auto Super Illuminator LED light'
    ],
    colorway: 'All Black Stealth',
    sku: 'VK-WT-003'
  },
  {
    id: 'audiophile-street-earbuds',
    name: 'Pulse Pro Wireless ANC Street Earbuds',
    brand: 'Puma',
    category: 'Earbuds',
    gender: 'Unisex',
    price: 8999,
    salePrice: 5999,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=1000&q=80'
    ],
    sizes: { 'One Size': 25 },
    rating: 4.8,
    reviewCount: 31,
    isHyped: false,
    isClearance: false,
    description: 'Tuned with heavy sub-bass response for trap, hip-hop and grime. 42dB Hybrid Active Noise Cancellation with fast charging USB-C case.',
    details: [
      '11mm custom graphene dynamic drivers',
      'Low latency 40ms gaming/video mode',
      '36-hour total battery life with case'
    ],
    colorway: 'Carbon Matte Black',
    sku: 'VK-EB-004'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'aj1-chicago-lost-found',
    userId: 'sample-user-1',
    userName: 'Aarav Malhotra',
    rating: 5,
    title: '100% Legit, Flawless Packaging!',
    comment: 'Was hesitant to order high-heat kicks online in India, but Kicks Vault verified authenticity tag arrived intact. Box arrived double-boxed with zero dents. The cracked leather is museum tier!',
    photos: [
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80'
    ],
    verifiedPurchase: true,
    isHidden: false,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'rev-2',
    productId: 'aj1-chicago-lost-found',
    userId: 'sample-user-2',
    userName: 'Rohan Sharma',
    rating: 5,
    title: 'Delivered to Mumbai in 3 Days',
    comment: 'Super fast shipping via Bluedart air. Tracked the package right to my doorstep. Fits true to size, feels legendary on feet.',
    verifiedPurchase: true,
    isHidden: false,
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString()
  },
  {
    id: 'rev-3',
    productId: 'travis-scott-jordan-1-reverse-mocha',
    userId: 'sample-user-3',
    userName: 'Kabir Varma',
    rating: 5,
    title: 'The Grail of Grails',
    comment: 'Unreal grail sneaker. Suede shifts when you brush it, reverse swoosh is clean. Paid via UPI and got instant confirmation.',
    photos: [
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=600&q=80'
    ],
    verifiedPurchase: true,
    isHidden: false,
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString()
  },
  {
    id: 'rev-4',
    productId: 'nike-dunk-low-panda',
    userId: 'sample-user-4',
    userName: 'Ananya Deshmukh',
    rating: 5,
    title: 'Matches literally every outfit',
    comment: 'Must have in every sneakerhead wardrobe. Ordered size UK 5 (EU 38), fits perfectly. COD delivery was seamless.',
    verifiedPurchase: true,
    isHidden: false,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

export const INITIAL_SETTINGS: StoreSettings = {
  defaultPaymentMethod: 'upi',
  codFee: 99,
  paymentMethodsEnabled: {
    upi: true,
    card: true,
    netbanking: true,
    wallets: true,
    emi: true,
    cod: true
  }
};

export async function seedDatabase(db: Firestore) {
  try {
    const batch = writeBatch(db);

    // Seed products
    for (const prod of INITIAL_PRODUCTS) {
      const ref = doc(db, 'products', prod.id);
      batch.set(ref, prod);
    }

    // Seed sample reviews
    for (const rev of INITIAL_REVIEWS) {
      const ref = doc(db, 'reviews', rev.id);
      batch.set(ref, rev);
    }

    // Seed store settings
    const settingsRef = doc(db, 'settings', 'store');
    batch.set(settingsRef, INITIAL_SETTINGS);

    // Seed first admin
    if (FIRST_ADMIN_EMAIL) {
      const adminRef = doc(db, 'admins', FIRST_ADMIN_EMAIL.toLowerCase());
      batch.set(adminRef, {
        email: FIRST_ADMIN_EMAIL.toLowerCase(),
        addedAt: new Date().toISOString(),
        addedBy: 'SYSTEM_BOOTSTRAP'
      });
    }

    await batch.commit();
    console.log('Database successfully populated with catalog, reviews, and admin settings.');
    return true;
  } catch (err) {
    console.warn('Database seeding note:', err);
    return false;
  }
}

export async function seedDatabaseIfNeeded(db: Firestore, currentUser?: { email?: string | null } | null) {
  // Only attempt writes to admin-protected collections if current user is an authorized admin
  if (!currentUser || !currentUser.email) {
    return;
  }

  const email = currentUser.email.toLowerCase();
  const isFirstAdmin = FIRST_ADMIN_EMAIL && email === FIRST_ADMIN_EMAIL.toLowerCase();

  if (!isFirstAdmin) {
    return;
  }

  try {
    const productsSnap = await getDocs(query(collection(db, 'products'), limit(1)));
    if (productsSnap.empty) {
      await seedDatabase(db);
    } else {
      // Ensure first admin record is in admins collection
      const adminRef = doc(db, 'admins', FIRST_ADMIN_EMAIL.toLowerCase());
      await setDoc(adminRef, {
        email: FIRST_ADMIN_EMAIL.toLowerCase(),
        addedAt: new Date().toISOString(),
        addedBy: 'SYSTEM_BOOTSTRAP'
      }, { merge: true });
    }
  } catch (err) {
    console.warn('Notice while checking database seed:', err);
  }
}

