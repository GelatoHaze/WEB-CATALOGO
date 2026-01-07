import React, { useState } from 'react';
import { Product, AppConfig, User } from '../types';
import { ShoppingCart, AlertCircle, Eye } from 'lucide-react';
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
      <div className="py-20 text-center text-slate-500">
        <p>Cargando inventario...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="col-span-full text-center py-20 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
        <div className="mx-auto w-16 h-16 text-slate-600 mb-4 bg-slate-800 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <p className="text-slate-400 text-lg font-medium">No hay productos disponibles.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((product) => {
          // Calculate total stock if variants exist, otherwise use base stock
          const totalStock = product.variants && product.variants.length > 0
            ? product.variants.reduce((acc, v) => acc + v.stock, 0)
            : product.stock;
            
          const hasStock = totalStock > 0;
          const lowStock = hasStock && totalStock <= 5;

          return (
            <div 
              key={product.id} 
              className={`bg-slate-900 rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col group cursor-pointer
                ${hasStock ? 'border-slate-800 hover:border-blue-500/50 hover:shadow-[0_10px_40px_-10px_rgba(37,99,235,0.2)]' : 'border-slate-800 opacity-75 grayscale'}`}
              onClick={() => setSelectedProduct(product)}
            >
              <div className="relative aspect-square overflow-hidden bg-white">
                {/* Badges */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 items-start">
                  {product.isNew && hasStock && (
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide shadow-md">
                      Nuevo
                    </span>
                  )}
                  {!hasStock && (
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide shadow-md">
                      Sin Stock
                    </span>
                  )}
                  {lowStock && (
                    <span className="bg-amber-500 text-slate-900 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide shadow-md">
                      ¡Últimas {totalStock}!
                    </span>
                  )}
                </div>

                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Quick action overlay */}
                <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button 
                      className="bg-white/90 backdrop-blur text-slate-900 font-bold px-6 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg hover:bg-white flex items-center gap-2"
                    >
                        <Eye className="w-4 h-4 text-blue-600" /> Ver Detalles
                    </button>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <div className="text-xs text-blue-400 font-bold uppercase mb-2 tracking-wide">{product.category}</div>
                <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-blue-400 transition-colors">
                  {product.name}
                </h3>
                {/* Product features preview */}
                {product.features && product.features.length > 0 ? (
                  <ul className="text-slate-400 text-xs mb-4 space-y-1">
                    {product.features.slice(0, 2).map((feature, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400 text-sm line-clamp-2 mb-4 flex-grow">
                    {product.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 font-medium">Consultar Precio</span>
                    <span className="text-sm text-blue-400 font-bold">Ver disponibilidad &rarr;</span>
                  </div>
                  
                  <button 
                    className={`p-3 rounded-xl transition-colors group/btn ${
                      hasStock 
                        ? 'bg-slate-800 hover:bg-blue-600 text-white' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className={`w-5 h-5 ${hasStock ? 'group-hover/btn:scale-110 transition-transform' : ''}`} />
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