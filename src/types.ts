export type SneakerBrand = 
  | 'Nike' 
  | 'Adidas' 
  | 'Air Jordan' 
  | 'New Balance' 
  | 'Puma' 
  | 'Vans' 
  | 'Converse' 
  | 'Asics' 
  | 'Birkenstock' 
  | 'Crocs';

export type ProductCategory = 
  | 'Sneakers' 
  | 'Watches' 
  | 'Sunglasses' 
  | 'Backpacks' 
  | 'Earbuds' 
  | 'Sandals';

export type GenderCategory = 'Men' | 'Women' | 'Unisex';

export interface Product {
  id: string;
  name: string;
  brand: SneakerBrand | string;
  category: ProductCategory | string;
  gender: GenderCategory;
  price: number;
  salePrice: number;
  images: string[];
  sizes: Record<string, number>; // e.g. { "38": 4, "39": 2, "40": 0, "41": 5, "42": 8, "43": 3, "44": 1, "45": 0 }
  rating: number;
  reviewCount: number;
  isHyped?: boolean;
  isClearance?: boolean;
  isSoldOut?: boolean;
  description: string;
  details?: string[];
  colorway?: string;
  sku?: string;
  createdAt?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  brand: string;
  price: number;
  salePrice: number;
  image: string;
  size: string;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  secondaryPhone?: string;
  email: string;
  addressLine1: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export type PaymentMethodType = 
  | 'upi' 
  | 'card' 
  | 'netbanking' 
  | 'wallets' 
  | 'emi' 
  | 'cod';

export type PaymentStatus = 'Paid' | 'Pending' | 'Failed' | 'COD' | 'Completed';

export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  size: string;
  price: number;
  salePrice: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  customerEmail: string;
  customerName: string;
  userEmail?: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethodType;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  subtotal: number;
  shippingFee?: number;
  codFee: number;
  discount: number;
  totalAmount: number;
  trackingLink?: string;
  trackingNumber?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  photos?: string[];
  verifiedPurchase?: boolean;
  isHidden?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  addedAt: string;
  addedBy?: string;
}

export interface StoreSettings {
  defaultPaymentMethod: PaymentMethodType;
  codFee: number;
  paymentMethodsEnabled: {
    upi: boolean;
    card: boolean;
    netbanking: boolean;
    wallets: boolean;
    emi: boolean;
    cod: boolean;
  };
}

export interface FilterState {
  brand: string[];
  category: string[];
  gender: string[];
  sizes: string[];
  minPrice: number;
  maxPrice: number;
  minRating: number;
  inStockOnly: boolean;
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'rating';
  searchQuery?: string;
}
