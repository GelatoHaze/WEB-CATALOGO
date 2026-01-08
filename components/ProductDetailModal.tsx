
import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Check, AlertTriangle, List, Lock, Mail, Cpu } from 'lucide-react';
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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (product.variants && product.variants.length > 0) {
        setSelectedVariantId(product.variants[0].id);
        setActiveImage(product.variants[0].images[0] || product.image);
      } else {
        setSelectedVariantId('');
        setActiveImage(product.image);
      }
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen, product]);

  if (!isOpen) return null;

  const currentVariant = product.variants?.find(v => v.id === selectedVariantId);
  const currentStock = currentVariant ? currentVariant.stock : product.stock;
  const isOutOfStock = currentStock === 0;
  const isLowStock = currentStock > 0 && currentStock <= 5;

  const handleVariantChange = (variant: Variant) => {
    setSelectedVariantId(variant.id);
    setActiveImage(variant.images[0] || product.image);
  };

  const handleInteraction = () => {
    if (!user) {
        onLoginReq();
        return;
    }
    if (!user.isVerified && user.role !== 'admin') {
        onLoginReq(); 
        return;
    }
    if (isOutOfStock) return;
    
    let message = `Hola CBLLS, estoy interesado en: ${product.name}`;
    if (currentVariant) {
      message += `\nVariante: ${currentVariant.name}`;
    }
    message += `\n¿Podrían indicarme el precio y disponibilidad actual?`;

    const url = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* Fondo casi totalmente opaco para máxima estabilidad visual */}
      <div className="absolute inset-0 bg-slate-950/98 animate-in fade-in duration-200" onClick={onClose}></div>
      
      <div className="relative bg-slate-900 w-full max-w-5xl rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col md:flex-row overflow-hidden max-h-[90vh] animate-in zoom-in-95 duration-200 will-change-transform">
        <button onClick={onClose} className="absolute top-8 right-8 z-20 p-3 bg-slate-950/80 hover:bg-slate-950 text-white rounded-full transition-all border border-white/10">
          <X className="w-6 h-6" />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 bg-white p-12 flex flex-col items-center justify-center relative min-h-[400px]">
          <div className="absolute top-8 left-8 flex items-center gap-2 opacity-10">
             <Cpu className="w-6 h-6 text-slate-950" />
             <span className="font-black text-slate-950 tracking-tighter">CBLLS</span>
          </div>
          
          <div className="w-full h-full flex items-center justify-center">
            <img src={activeImage} alt={product.name} className="max-h-[450px] max-w-full object-contain transition-all duration-300 animate-in fade-in zoom-in-90" />
          </div>

          {currentVariant && currentVariant.images.length > 1 && (
            <div className="absolute bottom-8 flex gap-3 overflow-x-auto max-w-full px-6 no-scrollbar">
              {currentVariant.images.map((img, idx) => (
                <button key={idx} onClick={() => setActiveImage(img)} className={`w-14 h-14 border-2 rounded-xl overflow-hidden flex-shrink-0 transition-all ${activeImage === img ? 'border-blue-600 scale-110 shadow-lg' : 'border-slate-100 hover:border-slate-300'}`}>
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="w-full md:w-1/2 p-12 flex flex-col overflow-y-auto bg-slate-900">
          <div className="mb-4">
            <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em]">
                {config.categories.find(c => c.id === product.category)?.name || 'Colección Premium'}
            </span>
          </div>
          
          <h2 className="text-4xl font-black text-white mb-6 font-heading tracking-tighter leading-tight">{product.name}</h2>
          
          <div className="flex flex-wrap gap-3 mb-10">
            {isOutOfStock ? (
              <span className="px-4 py-2 bg-red-500/10 text-red-500 text-[10px] font-black rounded-xl uppercase tracking-widest border border-red-500/20">Agotado temporalmente</span>
            ) : isLowStock ? (
              <span className="px-4 py-2 bg-amber-500/10 text-amber-500 text-[10px] font-black rounded-xl uppercase tracking-widest border border-amber-500/20 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" /> Últimas {currentStock} unidades
              </span>
            ) : (
              <span className="px-4 py-2 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-xl uppercase tracking-widest border border-emerald-500/20 flex items-center gap-2">
                <Check className="w-3.5 h-3.5" /> Disponibilidad inmediata
              </span>
            )}
            {product.isNew && (
                <span className="px-4 py-2 bg-blue-500/10 text-blue-500 text-[10px] font-black rounded-xl uppercase tracking-widest border border-blue-500/20">New Arrival</span>
            )}
          </div>

          <div className="space-y-8 mb-12">
            {product.features && product.features.length > 0 && (
                <div className="bg-slate-950/50 rounded-3xl p-6 border border-white/5">
                    <h4 className="flex items-center gap-3 text-[10px] font-black text-white uppercase tracking-[0.2em] mb-5 pl-1">
                        <List className="w-4 h-4 text-blue-500" /> Especificaciones Técnicas
                    </h4>
                    <ul className="grid grid-cols-1 gap-4">
                        {product.features.map((feature, idx) => (
                            <li key={idx} className="text-slate-400 text-xs font-bold flex items-start gap-3 pl-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1 flex-shrink-0 shadow-[0_0_8px_rgba(37,99,235,0.6)]"></div>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 pl-1">Descripción</h4>
                <p className="text-slate-300 text-sm leading-relaxed font-medium pl-1">
                    {product.description}
                </p>
            </div>
          </div>

          {product.variants && product.variants.length > 0 && (
            <div className="mb-12 space-y-5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Variantes disponibles</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => handleVariantChange(variant)}
                    disabled={variant.stock === 0}
                    className={`relative p-5 rounded-2xl border text-left transition-all group ${
                      selectedVariantId === variant.id
                        ? 'border-blue-600 bg-blue-600/10 shadow-lg shadow-blue-900/20'
                        : variant.stock === 0
                        ? 'border-white/5 bg-slate-950 opacity-40 cursor-not-allowed'
                        : 'border-white/5 bg-slate-950 hover:border-blue-500/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`font-black text-[11px] uppercase tracking-widest ${selectedVariantId === variant.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                        {variant.name}
                      </span>
                      {variant.stock === 0 && <span className="text-[8px] text-red-500 font-black uppercase">Out</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto pt-8 border-t border-white/5">
            <button
              onClick={handleInteraction}
              disabled={isOutOfStock}
              className={`w-full py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl ${
                isOutOfStock
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-white text-slate-950 hover:bg-blue-600 hover:text-white uppercase text-[10px] tracking-[0.3em]'
              }`}
            >
              {user && (user.isVerified || user.role === 'admin') ? <MessageCircle className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              {isOutOfStock 
                ? 'Producto Agotado' 
                : user && (user.isVerified || user.role === 'admin')
                    ? 'Consultar Disponibilidad'
                    : 'Acceder para Consultar'}
            </button>
            <p className="text-center text-[9px] font-black text-slate-600 uppercase tracking-widest mt-6">
              {user && (user.isVerified || user.role === 'admin') ? 'Atención comercial exclusiva vía WhatsApp' : 'Contenido protegido para clientes registrados'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
