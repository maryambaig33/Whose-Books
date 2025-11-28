import React, { useState, useCallback } from 'react';
import { NavBar } from './components/NavBar';
import { BookCard } from './components/BookCard';
import { LibrarianChat } from './components/LibrarianChat';
import { INITIAL_BOOKS } from './constants';
import { Book, CartItem, ViewState } from './types';
import { getBookRecommendations } from './services/geminiService';
import { Search, Loader2, ArrowRight, X, Sparkles, ShoppingBag } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<ViewState>('HOME');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Cart Logic
  const addToCart = (book: Book) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === book.id);
      if (existing) {
        return prev.map(item => item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...book, quantity: 1 }];
    });
  };

  const removeFromCart = (bookId: string) => {
    setCart(prev => prev.filter(item => item.id !== bookId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // AI Search Logic
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    // If it's a new search, clear old results immediately
    setSearchResults([]); 
    
    // Call Gemini Service
    const results = await getBookRecommendations(searchQuery);
    
    setSearchResults(results);
    setIsSearching(false);
  };

  // Views
  const renderHome = () => (
    <>
      {/* Hero Section */}
      <section className="relative bg-[#F4F1EA] py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 left-0 -ml-20 -mt-20 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="text-orange-600 font-bold tracking-widest uppercase text-xs mb-4 block">Est. 2024</span>
          <h1 className="serif text-5xl md:text-7xl font-bold text-stone-900 mb-6 leading-tight">
            Find the story that<br/>
            <span className="italic font-light text-stone-600">belongs to you.</span>
          </h1>
          <p className="text-lg md:text-xl text-stone-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Whose Books is an independent sanctuary for readers. Tell our AI Librarian what you're feeling, and discover your next obsession.
          </p>
          
          {/* Smart Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-indigo-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-center bg-white rounded-full shadow-lg p-2">
                <Search className="text-stone-400 ml-4" size={20} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Try 'moody detective novels in rainy London'..." 
                  className="flex-grow px-4 py-3 bg-transparent border-none focus:ring-0 text-stone-800 placeholder-stone-400 focus:outline-none"
                />
                <button 
                  type="submit" 
                  disabled={isSearching}
                  className="bg-stone-900 text-white px-6 py-3 rounded-full font-medium hover:bg-stone-800 transition-colors flex items-center gap-2 disabled:opacity-80"
                >
                  {isSearching ? <Loader2 className="animate-spin" size={18} /> : 'Discover'}
                </button>
              </div>
            </div>
            {searchResults.length > 0 && (
                <div className="absolute right-0 top-full mt-2 text-xs text-stone-400 cursor-pointer hover:text-stone-600" onClick={() => setSearchResults([])}>
                    Clear Results
                </div>
            )}
          </form>
        </div>
      </section>

      {/* Search Results (Conditional) */}
      {(searchResults.length > 0 || isSearching) && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-stone-100">
           <div className="max-w-7xl mx-auto">
             <div className="flex items-center gap-3 mb-8">
               <Sparkles className="text-indigo-500" />
               <h2 className="serif text-3xl font-bold text-stone-900">
                 {isSearching ? 'Consulting the archives...' : `Curated for "${searchQuery}"`}
               </h2>
             </div>
             
             {isSearching ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                   {[1,2,3,4].map(i => (
                       <div key={i} className="animate-pulse">
                           <div className="bg-stone-200 aspect-[2/3] rounded-lg mb-4"></div>
                           <div className="h-4 bg-stone-200 rounded w-3/4 mb-2"></div>
                           <div className="h-4 bg-stone-200 rounded w-1/2"></div>
                       </div>
                   ))}
                </div>
             ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {searchResults.map(book => (
                        <BookCard 
                            key={book.id} 
                            book={book} 
                            onAdd={addToCart} 
                            onClick={setSelectedBook}
                        />
                    ))}
                </div>
             )}
           </div>
        </section>
      )}

      {/* Featured Books */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="serif text-3xl font-bold text-stone-900 mb-2">Staff Picks</h2>
            <p className="text-stone-500">Hand-selected favorites for this month.</p>
          </div>
          <button 
            onClick={() => setView('SHOP')}
            className="hidden md:flex items-center gap-2 text-stone-900 font-medium hover:text-orange-600 transition-colors"
          >
            View All <ArrowRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
          {books.map((book) => (
            <BookCard 
                key={book.id} 
                book={book} 
                onAdd={addToCart} 
                onClick={setSelectedBook}
            />
          ))}
        </div>
        
        <div className="mt-12 text-center md:hidden">
            <button 
                onClick={() => setView('SHOP')}
                className="btn-primary inline-flex items-center gap-2 px-6 py-3 border border-stone-300 rounded-full text-stone-800 font-medium"
            >
                View All Books
            </button>
        </div>
      </section>

      {/* Features Banner */}
      <section className="bg-stone-900 text-stone-100 py-16 px-4">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
             <div className="p-6">
                 <h3 className="serif text-xl font-bold mb-3 text-orange-200">Curated by Humans & AI</h3>
                 <p className="text-stone-400 leading-relaxed">We blend traditional bookselling wisdom with advanced Gemini AI to find exactly what you need.</p>
             </div>
             <div className="p-6 md:border-l border-stone-800">
                 <h3 className="serif text-xl font-bold mb-3 text-orange-200">Community First</h3>
                 <p className="text-stone-400 leading-relaxed">Whose Books supports local literacy programs and independent authors in our neighborhood.</p>
             </div>
             <div className="p-6 md:border-l border-stone-800">
                 <h3 className="serif text-xl font-bold mb-3 text-orange-200">Swift Delivery</h3>
                 <p className="text-stone-400 leading-relaxed">Order today, read tomorrow. We package every book with care and sustainable materials.</p>
             </div>
         </div>
      </section>
    </>
  );

  const renderCart = () => (
    <div className="min-h-screen bg-stone-50 pt-10 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
            <h2 className="serif text-3xl font-bold mb-8">Your Cart</h2>
            {cart.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                    <ShoppingBag size={48} className="mx-auto text-stone-300 mb-4" />
                    <p className="text-stone-500 mb-4">Your bag is empty.</p>
                    <button onClick={() => setView('SHOP')} className="text-indigo-600 font-medium hover:underline">Start browsing</button>
                </div>
            ) : (
                <div className="space-y-6">
                    {cart.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm flex gap-4 items-center">
                            <img src={`https://picsum.photos/seed/${item.coverSeed}/100/150`} alt={item.title} className="w-16 h-24 object-cover rounded shadow-sm" />
                            <div className="flex-grow">
                                <h3 className="serif font-bold text-stone-900">{item.title}</h3>
                                <p className="text-sm text-stone-500">{item.author}</p>
                                <p className="text-xs text-stone-400 mt-1">${item.price}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-medium text-stone-900">x{item.quantity}</span>
                                <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-between items-center pt-8 border-t border-stone-200">
                        <span className="text-lg text-stone-500">Total</span>
                        <span className="serif text-3xl font-bold text-stone-900">${cartTotal.toFixed(2)}</span>
                    </div>
                    <button className="w-full bg-stone-900 text-white py-4 rounded-lg font-bold text-lg hover:bg-stone-800 transition-all mt-6">
                        Checkout
                    </button>
                </div>
            )}
        </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
      <NavBar 
        cartCount={cartCount} 
        onCartClick={() => setView('CART')}
        onHomeClick={() => setView('HOME')}
        onShopClick={() => setView('SHOP')}
      />
      
      <main className="flex-grow">
        {view === 'HOME' && renderHome()}
        {view === 'SHOP' && (
            <div className="py-20 px-4 max-w-7xl mx-auto">
                <h2 className="serif text-4xl font-bold mb-10 text-center">All Books</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {[...books, ...searchResults].map((book, idx) => (
                        <BookCard key={book.id + idx} book={book} onAdd={addToCart} onClick={setSelectedBook} />
                    ))}
                </div>
            </div>
        )}
        {view === 'CART' && renderCart()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-12 text-center text-stone-400 text-sm">
        <p className="serif mb-2">&copy; 2024 Whose Books Shop.</p>
        <p>A conceptual enhancement demo.</p>
      </footer>

      {/* Book Detail Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:h-auto">
                <div className="w-full md:w-1/3 h-64 md:h-auto relative bg-stone-100">
                     <img 
                        src={`https://picsum.photos/seed/${selectedBook.coverSeed}/500/750`} 
                        alt={selectedBook.title}
                        className="w-full h-full object-cover" 
                     />
                </div>
                <div className="p-8 md:p-12 flex-1 flex flex-col overflow-y-auto">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase mb-2 block">{selectedBook.genre}</span>
                            <h2 className="serif text-3xl md:text-4xl font-bold text-stone-900 mb-2 leading-tight">{selectedBook.title}</h2>
                            <p className="text-lg text-stone-500 italic">{selectedBook.author}</p>
                        </div>
                        <button onClick={() => setSelectedBook(null)} className="p-2 hover:bg-stone-100 rounded-full">
                            <X size={24} className="text-stone-400" />
                        </button>
                    </div>

                    <p className="text-stone-600 leading-relaxed text-lg mb-8">{selectedBook.description}</p>

                    <div className="mt-auto pt-8 border-t border-stone-100 flex items-center justify-between">
                        <span className="serif text-3xl font-bold text-stone-900">${selectedBook.price.toFixed(2)}</span>
                        <button 
                            onClick={() => {
                                addToCart(selectedBook);
                                setSelectedBook(null);
                            }}
                            className="bg-stone-900 text-white px-8 py-3 rounded-full font-medium hover:bg-orange-600 transition-colors"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Sticky Chat Button */}
      {!isChatOpen && (
          <button 
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-6 right-6 z-40 bg-stone-900 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 group"
          >
            <Sparkles size={20} className="text-orange-300 group-hover:rotate-12 transition-transform" />
            <span className="font-medium pr-1">Librarian</span>
          </button>
      )}

      {/* Chat Widget */}
      <LibrarianChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

    </div>
  );
}