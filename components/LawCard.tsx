import React from 'react';
import { LawSection, LawType } from '../types';
import { Scale, BookOpen, Gavel, FileText } from 'lucide-react';

interface LawCardProps {
  section: LawSection;
  onClick: (section: LawSection) => void;
}

const LawCard: React.FC<LawCardProps> = ({ section, onClick }) => {
  const getIcon = (act: LawType) => {
    switch (act) {
      case LawType.IPC: return <Gavel className="w-5 h-5 text-red-600" />;
      case LawType.CONSTITUTION: return <Scale className="w-5 h-5 text-amber-600" />;
      case LawType.CRPC: return <BookOpen className="w-5 h-5 text-blue-600" />;
      default: return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  const getBadgeColor = (act: LawType) => {
    switch (act) {
      case LawType.IPC: return 'bg-red-50 text-red-700 border-red-200';
      case LawType.CONSTITUTION: return 'bg-amber-50 text-amber-700 border-amber-200';
      case LawType.CRPC: return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div 
      onClick={() => onClick(section)}
      className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-gov-400 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
    >
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3">
          <span className={`text-xs font-bold px-2 py-1 rounded-full border flex items-center gap-1 ${getBadgeColor(section.act)}`}>
            {getIcon(section.act)}
            {section.act === LawType.IPC ? 'IPC' : section.act === LawType.CRPC ? 'CrPC' : section.act === LawType.CONSTITUTION ? 'CONST' : 'LAW'}
          </span>
          <span className="text-2xl font-serif font-bold text-slate-800 group-hover:text-gov-600 transition-colors">
            {section.sectionNumber.includes('Article') ? '' : '§'} {section.sectionNumber}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{section.title}</h3>
        <p className="text-slate-600 text-sm line-clamp-3 mb-4">{section.summary}</p>
        
        <div className="mt-auto flex flex-wrap gap-2">
          {section.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">#{tag}</span>
          ))}
        </div>
      </div>
      <div className="bg-gov-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center">
        <span className="text-xs font-medium text-gov-600">Click for details</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gov-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};

export default LawCard;
