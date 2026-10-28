import React, { useState } from 'react';
import { Product } from '../types/inventory';
import { Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onConfirm: (productId: string) => Promise<void>;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  product,
  onClose,
  onConfirm,
}) => {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !product) return null;

  const handleConfirm = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await onConfirm(product.productId);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative w-full max-w-sm glass-panel rounded-3xl p-6 shadow-2xl border border-white/[0.14] z-10 text-center glass-reflection"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
            <Trash2 className="w-6 h-6 stroke-[1.8]" />
          </div>

          <h3 className="text-base font-semibold text-white">
            Delete Product?
          </h3>
          <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
            Are you sure you want to permanently delete{' '}
            <strong className="text-white font-semibold">
              "{product.title}"
            </strong>
            ? This action cannot be undone.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={onClose}
              disabled={deleting}
              className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 bg-white/[0.06] hover:bg-white/[0.1] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={deleting}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 active:scale-[0.98] shadow-lg shadow-rose-600/30 disabled:opacity-50 transition-all cursor-pointer border border-rose-400/30"
            >
              {deleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span>Delete</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
