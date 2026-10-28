import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductFormData, DEFAULT_CATEGORIES } from '../types/inventory';
import { validateProductInput } from '../services/inventory-rules';
import { processUploadedImage } from '../utils/image-helpers';
import {
  X,
  Loader2,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  Plus,
  Minus,
  Check,
  Tag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  initialProduct?: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialProduct,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [quantity, setQuantity] = useState<number | string>(0);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  // Image source mode: 'upload' | 'url'
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (initialProduct) {
      setTitle(initialProduct.title);
      setCategory(initialProduct.category || 'General');
      setQuantity(initialProduct.quantity);
      setImageUrl(initialProduct.imageUrl || '');
      setDescription(initialProduct.description || '');
      // If image is a data URL, default to upload mode, else url
      if (initialProduct.imageUrl?.startsWith('data:image/')) {
        setImageMode('upload');
      } else if (initialProduct.imageUrl) {
        setImageMode('url');
      } else {
        setImageMode('upload');
      }
    } else {
      setTitle('');
      setCategory('General');
      setQuantity(0);
      setImageUrl('');
      setDescription('');
      setImageMode('upload');
    }
    setErrors({});
    setImageError(null);
    setSubmitError(null);
  }, [initialProduct, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    setImageError(null);
    setIsProcessingImage(true);
    try {
      const dataUrl = await processUploadedImage(file);
      setImageUrl(dataUrl);
      if (errors.imageUrl) {
        setErrors((prev) => ({ ...prev, imageUrl: '' }));
      }
    } catch (err: unknown) {
      setImageError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || isProcessingImage) return;

    setSubmitError(null);
    const formData: ProductFormData = {
      title: title.trim(),
      category: category.trim() || 'General',
      quantity: Number(quantity),
      imageUrl: imageUrl.trim() || undefined,
      description: description.trim() || undefined,
    };

    const val = validateProductInput(formData);
    if (!val.valid) {
      if (val.field && val.error) {
        setErrors({ [val.field]: val.error });
      }
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 dark:bg-black/85 backdrop-blur-md transition-opacity">
        {/* Backdrop click to dismiss */}
        <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.98 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg glass-panel rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden border border-black/[0.08] dark:border-white/[0.14] z-10 flex flex-col max-h-[92vh] sm:max-h-[88vh] glass-reflection"
          role="dialog"
          aria-modal="true"
        >
          {/* iOS Sheet Grab Handle for mobile gesture feel */}
          <div className="pt-3 pb-1 sm:hidden flex justify-center shrink-0">
            <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-white/25" />
          </div>

          {/* Header */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between shrink-0">
            <div className="min-w-0 pr-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
                {initialProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-neutral-400 truncate">
                {initialProduct ? 'Update product details in catalog' : 'Fill in inventory item details'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition-colors cursor-pointer shrink-0"
              aria-label="Close form"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Body - Scrollable with safe mobile padding */}
          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto overscroll-contain flex-1 touch-pan-y"
          >
            {submitError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/25 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Product Image Section with Upload & URL switch */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                  Product Image
                </label>
                <div className="flex items-center p-0.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.05] dark:border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setImageMode('upload')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      imageMode === 'upload'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      imageMode === 'url'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>URL</span>
                  </button>
                </div>
              </div>

              {/* Image Preview & Upload Container */}
              {imageUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-black/[0.08] dark:border-white/[0.12] bg-slate-100 dark:bg-neutral-900/80 aspect-video flex items-center justify-center group">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                    <button
                      type="button"
                      onClick={() => {
                        if (imageMode === 'upload' && fileInputRef.current) {
                          fileInputRef.current.click();
                        } else {
                          setImageUrl('');
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-medium backdrop-blur-md flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Change</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/80 hover:bg-rose-500 text-white text-xs font-medium backdrop-blur-md flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : imageMode === 'upload' ? (
                /* Compact Upload Dropzone */
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                    isDragging
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-black/[0.12] dark:border-white/[0.15] bg-black/[0.02] dark:bg-white/[0.03] hover:border-blue-500/50 hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                    {isProcessingImage ? (
                      <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-white block">
                      Tap to upload photo or drag & drop
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-neutral-400 block mt-0.5">
                      JPG, PNG, WebP up to 10MB (auto-compressed)
                    </span>
                  </div>
                </div>
              ) : (
                /* URL Input */
                <div className="space-y-1.5">
                  <div className="relative">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        if (errors.imageUrl) setErrors((prev) => ({ ...prev, imageUrl: '' }));
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs text-slate-900 dark:text-white border border-black/[0.08] dark:border-white/[0.12] placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                    <ImageIcon className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3 top-2.5" />
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-neutral-500 block">
                    Paste a direct HTTPS link to an image
                  </span>
                </div>
              )}

              {imageError && (
                <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{imageError}</span>
                </p>
              )}
            </div>

            {/* Title Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="product-title"
                  className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-neutral-300"
                >
                  Product Title <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 dark:text-neutral-500">
                  {title.length}/120
                </span>
              </div>
              <input
                id="product-title"
                type="text"
                maxLength={120}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                }}
                placeholder="e.g. Classic Gold Ring"
                className={`w-full px-4 py-3 rounded-2xl glass-input text-sm text-slate-900 dark:text-white border border-black/[0.08] dark:border-white/[0.12] placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 ${
                  errors.title ? 'border-rose-500 ring-2 ring-rose-500/20' : ''
                }`}
                disabled={submitting}
              />
              {errors.title && (
                <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.title}</span>
                </p>
              )}
            </div>

            {/* Category Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="product-category"
                  className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-neutral-300"
                >
                  Category
                </label>
                <span className="text-[11px] text-slate-400 dark:text-neutral-500">
                  Select or type custom
                </span>
              </div>
              <div className="relative">
                <input
                  id="product-category"
                  type="text"
                  maxLength={60}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Electronics, Apparel, Accessories..."
                  className="w-full pl-9 pr-4 py-2.5 sm:py-3 rounded-2xl glass-input text-sm text-slate-900 dark:text-white border border-black/[0.08] dark:border-white/[0.12] placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  disabled={submitting}
                />
                <Tag className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3 top-3 sm:top-3.5" />
              </div>

              {/* Preset category pills */}
              <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-none">
                {DEFAULT_CATEGORIES.map((cat) => {
                  const isSelected = category.trim().toLowerCase() === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                          : 'bg-black/[0.03] dark:bg-white/[0.05] text-slate-600 dark:text-neutral-300 border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.06] dark:hover:bg-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="product-quantity"
                  className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-neutral-300"
                >
                  Starting Quantity <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 dark:text-neutral-500">
                  Initial stock
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(0, Number(quantity) - 1))}
                  className="w-12 h-12 rounded-2xl glass-input flex items-center justify-center text-slate-700 dark:text-white hover:bg-black/[0.05] dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer shrink-0 border border-black/[0.08] dark:border-white/[0.12]"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4 stroke-[2.5]" />
                </button>
                <input
                  id="product-quantity"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: '' }));
                  }}
                  className="flex-1 min-w-0 px-3 py-2.5 sm:py-3 text-center text-xl font-bold rounded-2xl glass-input text-slate-900 dark:text-white border border-black/[0.08] dark:border-white/[0.12] focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setQuantity(Number(quantity) + 1)}
                  className="w-12 h-12 rounded-2xl glass-input flex items-center justify-center text-slate-700 dark:text-white hover:bg-black/[0.05] dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer shrink-0 border border-black/[0.08] dark:border-white/[0.12]"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Quick presets for product quantity */}
              <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-medium mr-0.5 shrink-0 uppercase tracking-wider">
                  Presets:
                </span>
                {[0, 5, 10, 25, 50, 100].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setQuantity(preset);
                      if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: '' }));
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 border min-h-[32px] ${
                      Number(quantity) === preset
                        ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                        : 'bg-black/[0.03] dark:bg-white/[0.05] text-slate-600 dark:text-neutral-300 border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.06] dark:hover:bg-white/10'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {errors.quantity && (
                <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.quantity}</span>
                </p>
              )}
            </div>

            {/* Description Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="product-description"
                  className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-neutral-300"
                >
                  Description
                </label>
                <span className="text-[11px] text-slate-400 dark:text-neutral-500">Optional</span>
              </div>
              <textarea
                id="product-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product characteristics, materials, dimensions..."
                className="w-full px-4 py-3 rounded-2xl glass-input text-sm text-slate-900 dark:text-white border border-black/[0.08] dark:border-white/[0.12] placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 resize-none"
                disabled={submitting}
              />
            </div>

            {/* Mobile-first Action Buttons Footer */}
            <div className="pt-2 sm:pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl text-xs font-semibold text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer text-center min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || isProcessingImage}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-xs font-bold shadow-lg shadow-blue-500/25 disabled:opacity-50 transition-all cursor-pointer min-h-[46px]"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                )}
                <span>{initialProduct ? 'Save Changes' : 'Create Product'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

