import React, { useEffect, useState } from 'react';
import { DetailedLawAnalysis, LawSection } from '../types';
import { getSectionDetails } from '../services/geminiService';
import { X, ShieldAlert, BookOpen, AlertCircle, CheckCircle, Scale } from 'lucide-react';

interface DetailModalProps {
  section: LawSection;
  onClose: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ section, onClose }) => {
  const [details, setDetails] = useState<DetailedLawAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await getSectionDetails(section.sectionNumber, section.act);
        if (isMounted) {
          setDetails(data);
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    fetchDetails();
    return () => { isMounted = false; };
  }, [section]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!section) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gov-900 text-white p-6 flex justify-between items-start shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-2 text-gov-200 text-sm font-medium uppercase tracking-wider">
              <Scale size={16} />
              {section.act}
            </div>
            <h2 className="text-3xl font-serif font-bold">{section.title}</h2>
            <div className="mt-1 text-gov-300 font-mono">Section {section.sectionNumber}</div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 lg:p-8 legal-scroll bg-slate-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-gov-200 border-t-gov-600 rounded-full animate-spin"></div>
              <p className="text-slate-500 animate-pulse">Consulting the legal archives...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-500">
              <AlertCircle size={48} className="mx-auto mb-4" />
              <p>Unable to retrieve detailed information. Please try again later.</p>
            </div>
          ) : details ? (
            <div className="space-y-8">
              
              {/* Top Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {details.punishment && (
                  <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-red-700 font-bold mb-1">
                      <ShieldAlert size={18} /> Punishment
                    </div>
                    <p className="text-red-900 text-sm font-medium">{details.punishment}</p>
                  </div>
                )}
                {details.bailable && (
                   <div className={`p-4 rounded-xl border ${details.bailable.toLowerCase().includes('non-bailable') ? 'bg-orange-50 border-orange-100' : 'bg-green-50 border-green-100'}`}>
                    <div className={`flex items-center gap-2 font-bold mb-1 ${details.bailable.toLowerCase().includes('non-bailable') ? 'text-orange-700' : 'text-green-700'}`}>
                      {details.bailable.toLowerCase().includes('non-bailable') ? <X size={18} /> : <CheckCircle size={18} />} 
                      Bailable Status
                    </div>
                    <p className="text-slate-900 text-sm">{details.bailable}</p>
                  </div>
                )}
                {details.cognizable && (
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-blue-700 font-bold mb-1">
                      <AlertCircle size={18} /> Cognizable
                    </div>
                    <p className="text-slate-900 text-sm">{details.cognizable}</p>
                  </div>
                )}
              </div>

              {/* Simplified Explanation */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-saffron rounded-full block"></span>
                  Simplified Explanation
                </h3>
                <p className="text-slate-700 text-lg leading-relaxed">{details.simplifiedExplanation}</p>
              </div>

              {/* Key Points */}
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <BookOpen size={20} className="text-gov-600" />
                    Key Ingredients
                  </h3>
                  <ul className="space-y-3">
                    {details.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex gap-3 text-slate-700 text-sm">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-gov-100 text-gov-600 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="text-2xl">💡</span>
                    Example Scenario
                  </h3>
                  <div className="bg-gov-50 p-4 rounded-lg text-slate-700 italic border-l-4 border-gov-400">
                    "{details.exampleScenario}"
                  </div>
                </div>
              </div>

              {/* Original Legal Text */}
              <div className="mt-8 border-t border-slate-200 pt-6">
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Original Legal Text</h3>
                 <p className="font-serif text-slate-600 text-sm leading-loose bg-slate-50 p-4 rounded border border-slate-100">
                   {details.legalText}
                 </p>
              </div>

            </div>
          ) : null}
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center text-xs text-slate-400">
          <span>AI-generated content. Consult a lawyer for legal advice.</span>
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
