
import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-md transition-opacity">
      <div className="bg-white rounded-[2.5rem] shadow-3xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[95vh] border border-white/20">
        <div className="flex items-center justify-between px-10 py-8 border-b border-stone-50 bg-stone-50/30">
          <h3 className="text-2xl font-black text-stone-800 tracking-tight">{title}</h3>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-all p-2 rounded-2xl hover:bg-stone-100"
          >
            <X size={32} />
          </button>
        </div>
        
        <div className="p-10 overflow-y-auto">
          {children}
        </div>

        {footer && (
          <div className="px-10 py-8 bg-stone-50 border-t border-stone-100 flex justify-end gap-5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
