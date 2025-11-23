import React, { useState } from 'react';
import { Search, Scale, Book, Shield, Gavel, Menu, X, MessageSquare } from 'lucide-react';
import { LawSection, LawType } from './types';
import { searchLaws } from './services/geminiService';
import LawCard from './components/LawCard';
import DetailModal from './components/DetailModal';
import ChatInterface from './components/ChatInterface';

// Predefined suggestions for quick access
const SUGGESTIONS = [
  { label: 'Murder (302 IPC)', query: 'IPC Section 302 Punishment for murder' },
  { label: 'Theft (378 IPC)', query: 'IPC Section 378 Theft definition and punishment' },
  { label: 'Cheating (420 IPC)', query: 'IPC Section 420 Cheating and dishonesty' },
  { label: 'Defamation', query: 'Defamation laws in India IPC 499' },
  { label: 'Right to Equality', query: 'Article 14 Constitution of India' },
  { label: 'Anticipatory Bail', query: 'Section 438 CrPC Anticipatory Bail' },
];

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LawSection[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSection, setSelectedSection] = useState<LawSection | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'chat'>('home');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setCurrentView('home');
    setIsSearching(true);
    setHasSearched(true);
    try {
      const data = await searchLaws(query);
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (suggestionQuery: string) => {
    setQuery(suggestionQuery);
    setCurrentView('home');
    setIsSearching(true);
    setHasSearched(true);
    searchLaws(suggestionQuery).then(setResults).finally(() => setIsSearching(false));
  };

  const navigateToHome = () => {
    setCurrentView('home');
  };

  const navigateToChat = () => {
    setCurrentView('chat');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gov-50 relative">
      {/* Navbar */}
      <nav className="bg-white border-b border-gov-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={navigateToHome}
            >
              <div className="bg-gov-900 p-2 rounded-lg text-white group-hover:bg-gov-800 transition-colors">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" className="w-6 h-6 invert brightness-0" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gov-900 tracking-tight">NyayaSetu</h1>
                <p className="text-[10px] text-gov-500 font-medium uppercase tracking-widest leading-none">Indian Law Guide</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
              <button onClick={navigateToHome} className={`hover:text-gov-700 transition-colors ${currentView === 'home' ? 'text-gov-800 font-bold' : ''}`}>Home</button>
              <button className="hover:text-gov-700 transition-colors">IPC</button>
              <button className="hover:text-gov-700 transition-colors">Constitution</button>
              <button 
                onClick={navigateToChat}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors shadow-sm ${currentView === 'chat' ? 'bg-gov-900 text-white' : 'bg-gov-100 text-gov-900 hover:bg-gov-200'}`}
              >
                <MessageSquare size={16} />
                AI Legal Assistant
              </button>
            </div>
            
            <div className="flex items-center md:hidden">
              <button className="text-slate-500"><Menu size={24} /></button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        
        {currentView === 'chat' ? (
          <div className="flex-grow w-full max-w-5xl mx-auto p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ChatInterface />
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <div className={`transition-all duration-500 ease-in-out ${hasSearched ? 'py-8 bg-white border-b border-slate-200' : 'flex-grow flex flex-col justify-center py-20 bg-gradient-to-b from-white to-gov-50'}`}>
              <div className="max-w-4xl mx-auto px-4 w-full text-center">
                
                {!hasSearched && (
                  <div className="mb-10 animate-in slide-in-from-bottom-5 fade-in duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold mb-6 border border-orange-200">
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                      Includes Bharatiya Nyaya Sanhita Updates
                    </div>
                    <h2 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 mb-6 tracking-tight">
                      Demystifying <span className="text-gov-600">Indian Law</span>
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
                      Search any section of the IPC, CrPC, or Constitution. Get simplified, AI-powered explanations instantly.
                    </p>
                  </div>
                )}

                {/* Search Bar */}
                <form onSubmit={handleSearch} className={`relative max-w-2xl mx-auto w-full transition-all duration-500 ${hasSearched ? 'mb-0' : 'mb-12'}`}>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className={`h-6 w-6 ${isSearching ? 'text-gov-500 animate-pulse' : 'text-slate-400 group-hover:text-gov-500 transition-colors'}`} />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl leading-5 placeholder-slate-400 focus:outline-none focus:border-gov-500 focus:ring-4 focus:ring-gov-100 transition-all shadow-sm text-lg"
                      placeholder="Search ex: 'Section 302', 'Punishment for theft', 'Article 21'"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    <button 
                      type="submit"
                      disabled={isSearching}
                      className="absolute inset-y-2 right-2 px-6 bg-gov-900 text-white rounded-xl font-medium hover:bg-gov-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gov-500 disabled:opacity-50 transition-all"
                    >
                      {isSearching ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                </form>

                {/* Quick Chips (Only on Home) */}
                {!hasSearched && (
                  <div className="flex flex-wrap justify-center gap-2 animate-in fade-in delay-200 duration-700">
                    <span className="text-sm text-slate-400 mr-2 py-1">Try asking:</span>
                    {SUGGESTIONS.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(item.query)}
                        className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-gov-400 hover:text-gov-700 transition-colors shadow-sm"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Results Section */}
            {hasSearched && (
              <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-in fade-in duration-500">
                {isSearching ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {[1, 2, 3].map((i) => (
                       <div key={i} className="h-48 bg-white rounded-xl border border-slate-100 shadow-sm p-5 animate-pulse">
                         <div className="h-6 w-1/3 bg-slate-200 rounded mb-4"></div>
                         <div className="h-8 w-3/4 bg-slate-200 rounded mb-4"></div>
                         <div className="h-4 w-full bg-slate-200 rounded mb-2"></div>
                         <div className="h-4 w-5/6 bg-slate-200 rounded"></div>
                       </div>
                     ))}
                   </div>
                ) : results.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Search Results</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {results.map((section) => (
                        <LawCard 
                          key={section.id} 
                          section={section} 
                          onClick={setSelectedSection} 
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No sections found</h3>
                    <p className="text-slate-500">Try adjusting your search terms or ask a broader legal question.</p>
                    <button 
                      onClick={() => { setHasSearched(false); setQuery(''); }}
                      className="mt-6 text-gov-600 font-medium hover:underline"
                    >
                      Clear Search
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Features Grid (Only on Home) */}
            {!hasSearched && (
              <div className="bg-white py-16 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-6 rounded-2xl bg-gov-50 border border-gov-100">
                      <div className="w-12 h-12 bg-gov-200 rounded-xl flex items-center justify-center text-gov-700 mb-4">
                        <Gavel size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">IPC & BNS</h3>
                      <p className="text-slate-600">Complete coverage of the Indian Penal Code and the new Bharatiya Nyaya Sanhita.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100">
                      <div className="w-12 h-12 bg-orange-200 rounded-xl flex items-center justify-center text-orange-700 mb-4">
                        <Scale size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Constitution</h3>
                      <p className="text-slate-600">Explore Fundamental Rights, Directive Principles, and Constitutional Articles.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100">
                      <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center text-blue-700 mb-4">
                        <Shield size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Legal Rights</h3>
                      <p className="text-slate-600">Know your rights regarding arrest, bail, and police procedures simplified.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gov-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white text-lg font-bold mb-4">NyayaSetu</h3>
            <p className="max-w-xs mb-4">Making Indian Law accessible to every citizen through Artificial Intelligence.</p>
            <div className="flex gap-4">
              <span className="w-8 h-8 rounded-full bg-gov-800 flex items-center justify-center cursor-pointer hover:bg-gov-700">𝕏</span>
              <span className="w-8 h-8 rounded-full bg-gov-800 flex items-center justify-center cursor-pointer hover:bg-gov-700">in</span>
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">IPC Handbook</a></li>
              <li><a href="#" className="hover:text-white">Constitution PDF</a></li>
              <li><a href="#" className="hover:text-white">Legal Dictionary</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Disclaimer</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-gov-800 text-xs text-center">
          &copy; 2024 NyayaSetu. Information is for educational purposes only.
        </div>
      </footer>

      {/* Modal */}
      {selectedSection && (
        <DetailModal 
          section={selectedSection} 
          onClose={() => setSelectedSection(null)} 
        />
      )}
    </div>
  );
}

export default App;