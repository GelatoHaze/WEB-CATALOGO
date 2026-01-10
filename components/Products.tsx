
import React, { useState } from 'react';
import { Product, AppConfig, User } from '../types';
import { ShoppingCart, AlertCircle, Eye, Star } from 'lucide-react';
import ProductDetailModal from './ProductDetailModal';

interface ProductsProps {
  products: Product[];
  isLoading?: boolean;
  config: AppConfig;
  user: User | null;
  onLoginReq: () => void;
}

const Products: React.FC<ProductsProps> = ({ products, isLoading, config, user, onLoginReq }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-slate-900/50 rounded-3xl border border-slate-800 h-96 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-32 bg-slate-900/20 rounded-[3rem] border-2 border-slate-800 border-dashed animate-fade-in">
        <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800">
          <AlertCircle className="w-10 h-10 text-slate-700" />
        </div>
        <h4 className="text-xl font-black text-white mb-2 tracking-tight uppercase">Sin resultados</h4>
        <p className="text-slate-500 text-sm max-w-xs text-center">No encontramos productos en esta categoría. Intenta seleccionar otra.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((product) => {
          const totalStock = product.variants && product.variants.length > 0
            ? product.variants.reduce((acc, v) => acc + v.stock, 0)
            : product.stock;
          const hasStock = totalStock > 0;
          const lowStock = hasStock && totalStock <= 5;

          return (
            <div 
              key={product.id} 
              className={`group bg-slate-900 rounded-[2rem] overflow-hidden border transition-all duration-500 flex flex-col h-full relative
                ${hasStock ? 'border-slate-800 hover:border-blue-500/30 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]' : 'border-slate-800 opacity-60 grayscale'}`}
              onClick={() => setSelectedProduct(product)}
            >
              {/* Image Section */}
              <div className="relative aspect-[4/5] bg-white overflow-hidden flex items-center justify-center cursor-pointer">
                {/* Badges */}
                <div className="absolute top-5 left-5 z-10 flex flex-col gap-2 pointer-events-none">
                  {product.isNew && hasStock && (
                    <span className="bg-blue-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" /> Nuevo
                    </span>
                  )}
                  {!hasStock && (
                    <span className="bg-red-600/90 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl">
                      Sin Stock
                    </span>
                  )}
                  {lowStock && (
                    <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl">
                      ¡Últimas {totalStock}!
                    </span>
                  )}
                </div>

                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-contain p-10 group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Visual Overlay */}
                <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/30 transition-all duration-500 flex items-center justify-center">
                    <button className="bg-white text-slate-950 font-black px-8 py-3 rounded-2xl transform translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-2xl flex items-center gap-2 uppercase tracking-widest text-[10px]">
                        <Eye className="w-4 h-4 text-blue-600" /> Detalles
                    </button>
                </div>
              </div>

              {/* Info Section */}
              <div className="p-8 flex flex-col flex-grow">
                <div className="text-[9px] text-blue-500 font-black uppercase mb-3 tracking-[0.2em]">
                    {config.categories.find(c => c.id === product.category)?.name || 'General'}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-4 leading-tight group-hover:text-blue-400 transition-colors line-clamp-2 h-14">
                  {product.name}
                </h3>
                
                <div className="flex-grow">
                    {/* CRITICAL FIX: Added optional chaining (?.) to prevent crash if features is undefined */}
                    {product.features && product.features.length > 0 ? (
                      <ul className="text-slate-500 text-[11px] font-medium space-y-2 mb-6">
                        {product.features.slice(0, 3).map((feature, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-blue-600 flex-shrink-0"></div>
                            <span className="truncate">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-500 text-xs line-clamp-3 mb-6 font-medium italic">
                        {product.description}
                      </p>
                    )}
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-slate-800/50 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Status</span>
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${hasStock ? 'text-emerald-400' : 'text-red-400'}`}>
                        {hasStock ? 'Disponible' : 'Agotado'}
                    </span>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                         e.stopPropagation();
                         setSelectedProduct(product);
                    }}
                    className={`p-4 rounded-2xl transition-all shadow-xl group/btn ${
                      hasStock 
                        ? 'bg-slate-800 hover:bg-blue-600 text-white shadow-slate-950' 
                        : 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className={`w-5 h-5 ${hasStock ? 'group-hover/btn:scale-110' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          isOpen={!!selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          config={config}
          user={user}
          onLoginReq={onLoginReq}
        />
      )}
    </>
  );
};

export default Products;
