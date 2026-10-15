export type ProductCategory = 'planners-organization' | 'kids-activities';

export type FileFormat = 'Spreadsheet (.xlsx / Google Sheets)' | 'Printable PDF (300 DPI)' | 'Printable PDF Activity Book';

export interface Product {
  id: string;
  title: string;
  category: ProductCategory;
  categoryLabel: string;
  price: number;
  shortDescription: string;
  fullDescription: string;
  image: string;
  formats: string[];
  sizes: string[];
  includedContents: string[];
  compatibility: string[];
  printingGuidance: {
    recommendedPaper: string;
    printerSettings: string;
    margins: string;
    bindingTips?: string;
  };
  features: string[];
  ownerNotesPrompt?: string; // Flag for store owner missing details
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  email: string;
  customerName: string;
  items: CartItem[];
  total: number;
  downloadAccessCode: string;
}

export interface CollectionNotification {
  id: string;
  title: string;
  date: string;
  category: ProductCategory;
  description: string;
  status: 'upcoming' | 'just-launched';
}

export type ActivePage = 
  | 'home' 
  | 'shop' 
  | 'planners' 
  | 'kids' 
  | 'about' 
  | 'contact' 
  | 'faq' 
  | 'policies';

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  createdAt: string;
}

