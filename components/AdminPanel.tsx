
import React, { useState, useEffect, useRef } from 'react';
import { Product, AppConfig, Variant, HeaderSlide, Category } from '../types';
import { StoreService } from '../services/store';
import { 
  Save, Trash2, Plus, Edit, Settings, Package, LogOut, LayoutTemplate, 
  Image as ImageIcon, X, Upload, List, Smartphone, Coffee, Tv, 
  Laptop, Watch, Camera, Headphones, DollarSign, Layers, Eye, EyeOff, 
  CheckCircle, Sparkles, RefreshCw, Monitor, AlertTriangle,
  Refrigerator, Home, Gamepad, Shirt, Car, Music
} from 'lucide-react';

interface AdminPanelProps {
  onLogout: () => void;
  onDataChange: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, onDataChange }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'banners' | 'config'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<AppConfig>(StoreService.getConfig());
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  
  const productFileRef = useRef<HTMLInputElement>(null);
  const bannerFileRef = useRef<HTMLInputElement>(null);
  const [activeBannerIndex, setActiveBannerIndex] = useState<number | null>(null);

  useEffect(() => {
    // Suscripciones en tiempo real para ver cambios de otros admins o confirmación
    const unsub = StoreService.subscribeToProducts(setProducts);
    const unsubConfig = StoreService.subscribeToConfig(setConfig);
    return () => { unsub(); unsubConfig(); };
  }, []);

  // Función utilitaria para comprimir imágenes y evitar llenar el LocalStorage
  const compressImage = (file: File, maxWidth: number = 1280, quality: number = 0.6): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Redimensionar si es muy grande
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              // Exportar como JPEG con calidad configurada
              resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
              reject(new Error("Canvas context error"));
          }
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSaving(true);
    try {
      await StoreService.saveProduct(editingProduct);
      setEditingProduct(null);
      // No es necesario llamar a onDataChange porque la suscripción actualiza la UI
    } catch (err) {
      alert("⚠️ Error de Almacenamiento: No hay suficiente espacio. Intenta eliminar productos antiguos o usa imágenes más livianas.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;
    try {
      await StoreService.deleteProduct(id);
    } catch (err) {
      alert("Error al eliminar");
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await StoreService.saveConfig(config);
      alert('¡Ajustes sincronizados globalmente!');
    } catch (err) {
      alert("⚠️ Memoria Llena: Las imágenes ocupan demasiado espacio. \n\nIntenta:\n1. Eliminar algún banner.\n2. Eliminar productos antiguos con imágenes pesadas.\n3. Reintentar.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddBanner = () => {
    if (config.headerSlides.length >= 4) {
      alert("Máximo 4 banners permitidos.");
      return;
    }
    const newSlide: HeaderSlide = {
      // Usar random para asegurar ID único
      id: Date.now().toString() + Math.random().toString().slice(2),
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop',
      title: 'Nuevo Banner',
      subtitle: 'Descripción del banner',
      ctaText: 'Ver Catálogo',
      ctaLink: '#productos'
    };
    setConfig({...config, headerSlides: [...config.headerSlides, newSlide]});
  };

  const handleRemoveBanner = (index: number) => {
    if (config.headerSlides.length <= 1) {
        alert("Debes tener al menos un banner.");
        return;
    }
    const updatedSlides = config.headerSlides.filter((_, i) => i !== index);
    setConfig({...config, headerSlides: updatedSlides});
  };

  const updateSlide = (index: number, data: Partial<HeaderSlide>) => {
    const updatedSlides = config.headerSlides.map((slide, i) => i === index ? {...slide, ...data} : slide);
    setConfig({...config, headerSlides: updatedSlides});
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingProduct) {
        setProcessingImage(true);
        try {
            // COMPRESIÓN AGRESIVA PARA PRODUCTOS: 600px ancho, 0.6 calidad
            // Esto reduce drásticamente el peso (aprox 50-80KB por imagen)
            const compressedBase64 = await compressImage(file, 600, 0.6); 
            setEditingProduct({...editingProduct, image: compressedBase64});
        } catch (error) {
            console.error(error);
            alert("Error al procesar la imagen");
        } finally {
            setProcessingImage(false);
            e.target.value = ''; // Reset input
        }
    }
  };

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeBannerIndex !== null) {
        setProcessingImage(true);
        try {
            // COMPRESIÓN OPTIMIZADA PARA BANNERS: 1280px ancho, 0.6 calidad
            // Suficiente para HD, peso aprox 150-250KB
            const compressedBase64 = await compressImage(file, 1280, 0.6);
            updateSlide(activeBannerIndex, {image: compressedBase64});
            setActiveBannerIndex(null);
        } catch (error) {
            console.error(error);
            alert("Error al procesar la imagen");
        } finally {
            setProcessingImage(false);
            e.target.value = ''; // Reset input
        }
    }
  };

  // --- LÓGICA DE CATEGORÍAS MEJORADA ---
  const handleAddCategory = () => {
    const newCat: Category = {
        id: 'cat-' + Date.now(),
        name: 'Nueva Colección',
        icon: 'smartphone'
    };
    setConfig({...config, categories: [...config.categories, newCat]});
  };

  const handleRemoveCategory = (index: number) => {
    if (config.categories.length <= 1) {
        alert("Debes mantener al menos una categoría.");
        return;
    }
    if (window.confirm("¿Estás seguro de eliminar esta categoría? Los productos asignados podrían quedar sin clasificación.")) {
        const newCats = [...config.categories];
        newCats.splice(index, 1);
        setConfig({...config, categories: newCats});
    }
  };

  const updateCategory = (index: number, field: keyof Category, value: string) => {
    const newCats = [...config.categories];
    newCats[index] = { ...newCats[index], [field]: value };
    setConfig({...config, categories: newCats});
  };

  // Helper para renderizar preview del icono en Admin
  const getIconPreview = (iconName: string) => {
    const map: Record<string, React.ReactNode> = {
      smartphone: <Smartphone className="w-6 h-6" />,
      coffee: <Coffee className="w-6 h-6" />,
      tv: <Tv className="w-6 h-6" />,
      refrigerator: <Refrigerator className="w-6 h-6" />,
      laptop: <Laptop className="w-6 h-6" />,
      watch: <Watch className="w-6 h-6" />,
      headphones: <Headphones className="w-6 h-6" />,
      camera: <Camera className="w-6 h-6" />,
      home: <Home className="w-6 h-6" />,
      gamepad: <Gamepad className="w-6 h-6" />,
      shirt: <Shirt className="w-6 h-6" />,
      car: <Car className="w-6 h-6" />,
      music: <Music className="w-6 h-6" />,
    };
    return map[iconName] || <Package className="w-6 h-6" />;
  };
  // ----------------------------------

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="lg:w-64 space-y-2">
          <h2 className="text-3xl font-black text-white mb-8 tracking-tighter">Administrador</h2>
          {[
            { id: 'products', icon: <Package className="w-5 h-5" />, label: 'Productos' },
            { id: 'banners', icon: <Monitor className="w-5 h-5" />, label: 'Banners' },
            { id: 'categories', icon: <List className="w-5 h-5" />, label: 'Categorías' },
            { id: 'config', icon: <Settings className="w-5 h-5" />, label: 'Ajustes Web' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:bg-slate-900'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
          <button onClick={onLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-500/10 mt-10 transition-colors">
            <LogOut className="w-5 h-5" /> Salir de Sesión
          </button>
        </aside>

        <main className="flex-grow bg-slate-900/50 rounded-[2rem] border border-slate-800 p-8 md:p-12 min-h-[600px] relative">
          {(saving || processingImage) && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-[2rem]">
              <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <span className="text-white font-black uppercase tracking-widest text-sm">
                {processingImage ? 'Optimizando y Comprimiendo...' : 'Guardando en LocalStorage...'}
              </span>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-10">
              {!editingProduct ? (
                <>
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black text-white">Inventario Realtime</h3>
                    <button onClick={() => setEditingProduct({ id: 0, name: '', category: config.categories[0]?.id || '', price: 0, image: '', description: '', features: [], stock: 0, isActive: true, variants: [] })} className="bg-blue-600 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-white hover:bg-blue-500 shadow-xl">Nuevo Producto</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.map(p => (
                      <div key={p.id} className="bg-slate-950/60 p-6 rounded-3xl border border-slate-800 flex items-center gap-6 group hover:border-blue-500/30 transition-all">
                        <div className="size-20 bg-white rounded-xl overflow-hidden p-2 flex-shrink-0 flex items-center justify-center">
                          <img src={p.image} className="max-w-full max-h-full object-contain" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="font-bold text-white truncate">{p.name}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`text-[9px] font-black uppercase tracking-widest ${p.isActive ? 'text-emerald-500' : 'text-slate-500'}`}>{p.isActive ? 'Visible' : 'Oculto'}</span>
                            <span className="text-slate-700">|</span>
                            <span className={`text-[9px] font-black uppercase ${p.stock <= 5 ? 'text-amber-500' : 'text-blue-500'}`}>{p.stock} unidades</span>
                          </div>
                          <div className="flex gap-4 mt-4">
                            <button onClick={() => setEditingProduct(p)} className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300">Editar</button>
                            <button onClick={() => handleDeleteProduct(p.id)} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-400">Eliminar</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <form onSubmit={handleSaveProduct} className="space-y-10 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-6">
                    <h3 className="text-xl font-black text-white">{editingProduct.id === 0 ? 'Crear Producto' : 'Actualizar Producto'}</h3>
                    <button type="button" onClick={() => setEditingProduct(null)} className="p-2 text-slate-500 hover:text-white"><X className="w-6 h-6" /></button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nombre</label>
                        <input type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none" required />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Categoría</label>
                            <select value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none">
                                {config.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                             {/* ADDED MISSING PRICE INPUT */}
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Precio</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input type="number" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-5 py-4 text-white outline-none" placeholder="0.00" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Stock</label>
                            <input type="number" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Características (Línea por línea)</label>
                        <textarea value={editingProduct.features?.join('\n')} onChange={e => setEditingProduct({...editingProduct, features: e.target.value.split('\n')})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white h-32 outline-none focus:border-blue-500/50 transition-colors" />
                      </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Imagen Principal</label>
                            <div className="aspect-video bg-white rounded-3xl border border-slate-800 overflow-hidden relative flex items-center justify-center group">
                                {editingProduct.image ? <img src={editingProduct.image} className="max-h-full p-4 object-contain" /> : <ImageIcon className="w-12 h-12 text-slate-300" />}
                                <button type="button" onClick={() => productFileRef.current?.click()} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs uppercase cursor-pointer z-10">Cambiar Imagen</button>
                                <input type="file" ref={productFileRef} className="hidden" accept="image/*" onChange={handleProductImageUpload} />
                            </div>
                            <p className="text-[9px] text-slate-600 pl-2">Se optimizará automáticamente al subir.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Descripción Corta</label>
                            <textarea value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white h-40 outline-none focus:border-blue-500/50 transition-colors" required />
                        </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-10">
                    <button type="submit" disabled={saving} className="flex-1 bg-blue-600 py-5 rounded-2xl font-black text-white uppercase text-xs tracking-widest shadow-xl shadow-blue-900/40 transition-all active:scale-[0.98]">Guardar en la Nube</button>
                    <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 bg-slate-800 py-5 rounded-2xl font-black text-white uppercase text-xs tracking-widest">Cancelar</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-10 animate-fade-in">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white">Categorías del Catálogo</h3>
                    <p className="text-slate-500 text-xs">Gestiona las secciones de tu tienda.</p>
                </div>
                <button onClick={handleAddCategory} className="bg-blue-600 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest text-white hover:bg-blue-500 flex items-center gap-2 shadow-lg shadow-blue-900/20">
                   <Plus className="w-4 h-4" /> Añadir Categoría
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {config.categories.map((cat, idx) => (
                    <div key={cat.id || idx} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex items-start gap-4 group hover:border-blue-500/30 transition-all relative">
                        <div className="absolute top-4 right-4">
                            <button onClick={() => handleRemoveCategory(idx)} className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-4 w-full pr-10">
                            {/* Visual Preview */}
                            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 text-blue-500 shadow-lg">
                                {getIconPreview(cat.icon)}
                            </div>

                            <div className="space-y-4 flex-grow">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Nombre Visible</label>
                                    <input 
                                        type="text" 
                                        value={cat.name} 
                                        onChange={(e) => updateCategory(idx, 'name', e.target.value)} 
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold text-sm focus:border-blue-500 outline-none" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Icono Representativo</label>
                                    <select 
                                        value={cat.icon} 
                                        onChange={(e) => updateCategory(idx, 'icon', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs outline-none cursor-pointer"
                                    >
                                        {['smartphone', 'coffee', 'tv', 'refrigerator', 'laptop', 'watch', 'headphones', 'camera', 'home', 'gamepad', 'shirt', 'car', 'music'].map(i => (
                                            <option key={i} value={i}>{i.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
              </div>

              <div className="pt-10 flex justify-center">
                <button onClick={handleSaveConfig} disabled={saving} className="bg-emerald-600 px-12 py-5 rounded-2xl font-black text-white uppercase text-xs tracking-[0.2em] shadow-xl shadow-emerald-900/40 transition-all hover:bg-emerald-500 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5" /> Guardar Cambios
                </button>
              </div>
            </div>
          )}

          {activeTab === 'banners' && (
            <div className="space-y-10 animate-fade-in">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white">Banners del Home</h3>
                    <p className="text-slate-500 text-xs">Máximo 4 imágenes. Se comprimirán agresivamente para ahorrar espacio.</p>
                </div>
                <button onClick={handleAddBanner} disabled={config.headerSlides.length >= 4} className="bg-blue-600 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest text-white hover:bg-blue-500 disabled:opacity-40 flex items-center gap-2">
                   <Plus className="w-4 h-4" /> Añadir Banner
                </button>
              </div>

              <div className="grid grid-cols-1 gap-12">
                {config.headerSlides.map((slide, idx) => (
                  <div key={slide.id} className="bg-slate-950 p-8 rounded-3xl border border-slate-800 relative group transition-all hover:border-blue-500/20">
                    <div className="absolute top-6 right-6 flex gap-2">
                        <span className="bg-slate-800 text-white text-[9px] font-black px-2 py-1 rounded">Slide {idx + 1}</span>
                        <button onClick={() => handleRemoveBanner(idx)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-6">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase">Título Principal</label>
                          <input type="text" value={slide.title} onChange={e => updateSlide(idx, {title: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase">Subtítulo</label>
                          <textarea value={slide.subtitle} onChange={e => updateSlide(idx, {subtitle: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm" rows={2} />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-slate-500 uppercase">Imagen de Fondo</label>
                            <span className="text-[9px] text-blue-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                <Smartphone className="w-3 h-3" /> Guía Móvil Activa
                            </span>
                        </div>
                        
                        <div className="aspect-video bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden relative group/img cursor-pointer" onClick={() => { setActiveBannerIndex(idx); bannerFileRef.current?.click(); }}>
                          <img src={slide.image} className="w-full h-full object-cover opacity-60 group-hover/img:opacity-100 transition-opacity" />
                          
                          {/* GUIAS VISUALES DE ZONA SEGURA MOVIL */}
                          {/* Representa aprox el area central visible en un telefono (ratio 9:16 vertical dentro de un 16:9 horizontal) */}
                          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[32%] border-x-2 border-dashed border-blue-500/30 bg-blue-500/5 pointer-events-none flex flex-col items-center justify-end pb-4">
                             <div className="bg-slate-900/80 px-2 py-1 rounded text-[8px] font-black text-blue-400 uppercase tracking-widest backdrop-blur-md border border-blue-500/20">
                                Visible en Celular
                             </div>
                          </div>

                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity z-10">
                             <Upload className="w-6 h-6 text-white mb-2" />
                             <span className="text-white font-black text-[10px] uppercase tracking-widest">Subir Imagen</span>
                          </div>
                        </div>
                        <p className="text-[9px] text-slate-500">Mantén el sujeto principal dentro de la zona central punteada para que se vea bien en celulares.</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <input type="file" ref={bannerFileRef} className="hidden" accept="image/*" onChange={handleBannerImageUpload} />

              <div className="pt-10 flex flex-col items-center gap-4">
                {config.headerSlides.length === 0 && (
                    <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-4 py-2 rounded-lg">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-xs font-bold">Debes añadir al menos un banner para guardar.</span>
                    </div>
                )}
                <button onClick={handleSaveConfig} disabled={saving || config.headerSlides.length === 0} className="bg-emerald-600 px-12 py-5 rounded-2xl font-black text-white uppercase text-xs tracking-[0.2em] shadow-xl shadow-emerald-900/40 transition-all hover:bg-emerald-500 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                  <CheckCircle className="w-5 h-5" /> Sincronizar Banners
                </button>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="max-w-3xl space-y-8 animate-fade-in">
                <h3 className="text-2xl font-black text-white">Global Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1">WhatsApp Business</label>
                        <input type="text" value={config.whatsappNumber} onChange={e => setConfig({...config, whatsappNumber: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Email Público</label>
                        <input type="text" value={config.email} onChange={e => setConfig({...config, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white" />
                    </div>
                </div>
                <button onClick={handleSaveConfig} disabled={saving} className="bg-blue-600 px-12 py-5 rounded-2xl font-black text-white uppercase text-xs flex items-center gap-3 shadow-xl shadow-blue-900/30">
                    <CheckCircle className="w-5 h-5" /> Guardar Todo en la Nube
                </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
