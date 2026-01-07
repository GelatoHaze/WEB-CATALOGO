import React, { useState, useEffect } from 'react';
import { X, MessageCircle, ShoppingCart, Check, AlertTriangle, List, Lock, Mail } from 'lucide-react';
import { Product, Variant, AppConfig, User } from '../types';

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  user: User | null;
  onLoginReq: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, isOpen, onClose, config, user, onLoginReq }) => {
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [activeImage, setActiveImage] = useState<string>(product.image);

  // Initialize with first variant if exists, or just product data
  useEffect(() => {
    if (isOpen) {
      if (product.variants && product.variants.length > 0) {
        setSelectedVariantId(product.variants[0].id);
        if (product.variants[0].images.length > 0) {
          setActiveImage(product.variants[0].images[0]);
        } else {
          setActiveImage(product.image);
        }
      } else {
        setSelectedVariantId('');
        setActiveImage(product.image);
      }
    }
  }, [isOpen, product]);

  if (!isOpen) return null;

  const currentVariant = product.variants?.find(v => v.id === selectedVariantId);
  
  // Logic to determine price, stock and stock status
  const currentStock = currentVariant ? currentVariant.stock : product.stock;
  const isOutOfStock = currentStock === 0;
  const isLowStock = currentStock > 0 && currentStock <= 5;

  const handleVariantChange = (variant: Variant) => {
    setSelectedVariantId(variant.id);
    if (variant.images.length > 0) {
      setActiveImage(variant.images[0]);
    } else {
      setActiveImage(product.image);
    }
  };

  const handleInteraction = () => {
    // 1. Check if user is logged in
    if (!user) {
        onLoginReq();
        return;
    }

    // 2. Check if user is verified
    if (!user.isVerified) {
        // Trigger login/verify modal logic (managed by parent usually, but here we trigger the generic login req which handles the state based on user status)
        alert("Debes verificar tu correo electrónico para consultar precios.");
        onLoginReq(); 
        return;
    }

    if (isOutOfStock) return;
    
    let message = `Hola, estoy interesado en: ${product.name}`;
    if (currentVariant) {
      message += `\nVariante: ${currentVariant.name}`;
      Object.entries(currentVariant.attributes).forEach(([key, value]) => {
        if(value) message += `\n${key}: ${value}`;
      });
    }
    // Price removed from message
    message += `\n¿Podría indicarme el precio y disponibilidad?`;

    const url = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
        onClick={onClose}
      ></div>
      
      <div className="relative bg-slate-900 w-full max-w-4xl rounded-2xl border border-slate-800 shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh] md:max-h-[80vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 bg-white p-8 flex flex-col items-center justify-center relative">
          <div className="w-full h-64 md:h-full flex items-center justify-center">
            <img 
              src={activeImage} 
              alt={product.name} 
              className="max-h-full max-w-full object-contain transition-all duration-300"
            />
          </div>
          {/* Thumbnails if variant has multiple images */}
          {currentVariant && currentVariant.images.length > 1 && (
            <div className="absolute bottom-4 flex gap-2 overflow-x-auto max-w-full px-4 no-scrollbar">
              {currentVariant.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-12 h-12 border-2 rounded-lg overflow-hidden flex-shrink-0 ${activeImage === img ? 'border-blue-600' : 'border-slate-200'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="w-full md:w-1/2 p-8 flex flex-col overflow-y-auto">
          <div className="mb-1">
            <span className="text-blue-400 text-xs font-bold uppercase tracking-wider">{product.category}</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 font-heading">{product.name}</h2>
          
          <div className="flex items-baseline gap-3 mb-6">
            {/* Price Hidden */}
            {isOutOfStock ? (
              <span className="px-3 py-1 bg-red-900/50 text-red-400 text-xs font-bold rounded-full uppercase">Agotado</span>
            ) : isLowStock ? (
              <span className="px-3 py-1 bg-amber-900/50 text-amber-400 text-xs font-bold rounded-full uppercase flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Últimas {currentStock} unidades
              </span>
            ) : (
              <span className="px-3 py-1 bg-emerald-900/50 text-emerald-400 text-xs font-bold rounded-full uppercase flex items-center gap-1">
                <Check className="w-3 h-3" /> En Stock
              </span>
            )}
          </div>

          {/* Automatic Features & Description Display */}
          <div className="space-y-6 mb-8">
            {product.features && product.features.length > 0 && (
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wide mb-3">
                        <List className="w-4 h-4 text-blue-400" /> Características Principales
                    </h4>
                    <ul className="space-y-2">
                        {product.features.map((feature, idx) => (
                            <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-2">Descripción</h4>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {product.description}
                </p>
            </div>
          </div>

          {/* Variants Selection */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-8 space-y-4">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wide">Seleccionar Opción</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => handleVariantChange(variant)}
                    disabled={variant.stock === 0}
                    className={`relative p-3 rounded-xl border text-left transition-all ${
                      selectedVariantId === variant.id
                        ? 'border-blue-500 bg-blue-600/10'
                        : variant.stock === 0
                        ? 'border-slate-800 bg-slate-900/50 opacity-50 cursor-not-allowed'
                        : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`font-bold text-sm ${selectedVariantId === variant.id ? 'text-white' : 'text-slate-300'}`}>
                        {variant.name}
                      </span>
                      {variant.stock === 0 && <span className="text-[10px] text-red-400 font-bold uppercase">Sin Stock</span>}
                    </div>
                    {/* Price strictly hidden here */}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto">
            <button
              onClick={handleInteraction}
              disabled={isOutOfStock}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 ${
                isOutOfStock
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : user && user.isVerified
                    ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/30'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30'
              }`}
            >
              {user && user.isVerified ? <MessageCircle className="w-5 h-5" /> : (user ? <Mail className="w-5 h-5" /> : <Lock className="w-5 h-5" />)}
              {isOutOfStock 
                ? 'No disponible temporalmente' 
                : user 
                    ? (user.isVerified ? 'Consultar Precio y Disponibilidad' : 'Verificar correo para consultar')
                    : 'Iniciar sesión para consultar'}
            </button>
            <p className="text-center text-xs text-slate-500 mt-4">
              {user && user.isVerified ? 'Te responderemos inmediatamente.' : 'Verifica tu cuenta para ver precios.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;