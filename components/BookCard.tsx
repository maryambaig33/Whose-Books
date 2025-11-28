import React from 'react';
import { Book } from '../types';
import { ShoppingBag, Star } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onAdd: (book: Book) => void;
  onClick: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onAdd, onClick }) => {
  return (
    <div 
      className={`group relative flex flex-col bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-stone-100 ${book.isAIRecommended ? 'ring-2 ring-indigo-100' : ''}`}
      onClick={() => onClick(book)}
    >
      {book.isAIRecommended && (
        <div className="absolute top-2 right-2 z-10 bg-indigo-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
           <Star size={10} fill="currentColor" /> Librarian Pick
        </div>
      )}
      
      <div className="aspect-[2/3] w-full overflow-hidden bg-stone-200 relative">
        <img 
          src={`https://picsum.photos/seed/${book.coverSeed}/400/600`} 
          alt={book.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <p className="text-xs font-semibold text-stone-500 mb-1 tracking-wider uppercase">{book.genre}</p>
        <h3 className="serif text-lg font-bold text-stone-900 leading-tight mb-1 line-clamp-2">{book.title}</h3>
        <p className="text-sm text-stone-600 mb-3 italic">{book.author}</p>
        <p className="text-sm text-stone-500 line-clamp-3 mb-4 flex-grow">{book.description}</p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-100">
          <span className="serif text-lg font-bold text-stone-900">${book.price.toFixed(2)}</span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAdd(book);
            }}
            className="p-2 rounded-full bg-stone-100 text-stone-800 hover:bg-stone-900 hover:text-white transition-colors"
            aria-label="Add to cart"
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};