import React from 'react';
import { BookOpen, ShoppingBag, Search, Menu } from 'lucide-react';

interface NavBarProps {
  cartCount: number;
  onCartClick: () => void;
  onHomeClick: () => void;
  onShopClick: () => void;
}

export const NavBar: React.FC<NavBarProps> = ({ cartCount, onCartClick, onHomeClick, onShopClick }) => {
  return (
    <nav className="sticky top-0 z-50 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={onHomeClick}>
            <div className="w-10 h-10 bg-stone-900 text-white rounded-lg flex items-center justify-center">
                <BookOpen size={20} />
            </div>
            <div className="flex flex-col">
                <span className="serif text-xl font-bold text-stone-900 leading-none">Whose Books</span>
                <span className="text-[10px] tracking-[0.2em] text-stone-500 uppercase">Independent Shop</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={onHomeClick} className="text-stone-600 hover:text-stone-900 font-medium transition-colors">Home</button>
            <button onClick={onShopClick} className="text-stone-600 hover:text-stone-900 font-medium transition-colors">Shop All</button>
            <button className="text-stone-600 hover:text-stone-900 font-medium transition-colors">Events</button>
            <button className="text-stone-600 hover:text-stone-900 font-medium transition-colors">Journal</button>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4">
            <button 
                onClick={onCartClick}
                className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-all"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 h-5 w-5 bg-orange-600 text-white text-xs font-bold rounded-full flex items-center justify-center transform scale-90">
                  {cartCount}
                </span>
              )}
            </button>
            <button className="md:hidden p-2 text-stone-600">
                <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};