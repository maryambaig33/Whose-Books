export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  genre: string;
  coverSeed: number; // For generating consistent picsum images
  isAIRecommended?: boolean; // To style AI results differently
}

export interface CartItem extends Book {
  quantity: number;
}

export type ViewState = 'HOME' | 'SHOP' | 'DETAILS' | 'CART';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}