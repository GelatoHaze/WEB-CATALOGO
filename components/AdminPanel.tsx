
import React, { useState, useEffect, useRef } from 'react';
import { Product, AppConfig, Variant, HeaderSlide, Category } from '../types';
import { StoreService } from '../services/store';
import { Save, Trash2, Plus, Edit, Settings, Package, LogOut, LayoutTemplate, Image as ImageIcon, X, Upload, List, Smartphone, Coffee, Tv, Laptop, Watch, Camera, Headphones, DollarSign, Layers, Eye, EyeOff, CheckCircle, Sparkles, RefreshCw, Monitor } from 'lucide-react';

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
  
  const productFileRef = useRef<HTMLInputElement>(null);
  const bannerFileRef = useRef<HTMLInputElement>(null);
  const [activeBannerIndex, setActiveBannerIndex] = useState<number | null>(null);

  useEffect(() => {
    // Suscripciones en tiempo real para ver cambios de otros admins o confirmación
    const unsub = StoreService.subscribeToProducts(setProducts);
    const unsubConfig = StoreService.subscribeToConfig(setConfig);
    return () => { unsub(); unsubConfig(); };
  }, []);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSaving(true);
    try {
      await StoreService.saveProduct(editingProduct);
      setEditingProduct(null);
      // No es necesario llamar a onDataChange porque la suscripción actualiza la UI
    } catch (err) {
      alert("Error al guardar producto. Verifica que la imagen no sea demasiado pesada (Máx 1MB).");
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
      alert("Error al sincronizar");
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
    if (config.headerSlides.length <= 1) return;
    const updatedSlides = config.headerSlides.filter((_, i) => i !== index);
    setConfig({...config, headerSlides: updatedSlides});
  };

  const updateSlide = (index: number, data: Partial<HeaderSlide>) => {
    const updatedSlides = config.headerSlides.map((slide, i) => i === index ? {...slide, ...data} : slide);
    setConfig({...config, headerSlides: updatedSlides});
  };

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
          {saving && (
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] z-50 flex items-center justify-center rounded-[2rem]">
              <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
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
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Categoría</label>
                            <select value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none">
                                {config.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Stock Actual</label>
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
                            <div className="aspect-video bg-white rounded-3xl border border-slate-800 overflow-hidden relative flex items-center justify-center">
                                {editingProduct.image ? <img src={editingProduct.image} className="max-h-full p-4 object-contain" /> : <ImageIcon className="w-12 h-12 text-slate-300" />}
                                <button type="button" onClick={() => productFileRef.current?.click()} className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs uppercase">Cambiar Imagen</button>
                                <input type="file" ref={productFileRef} className="hidden" accept="image/*" onChange={e => {
                                    const file = e.target.files?.[0];
                                    if(file) {
                                        const r = new FileReader();
                                        r.onload = () => setEditingProduct({...editingProduct, image: r.result as string});
                                        r.readAsDataURL(file);
                                    }
                                }} />
                            </div>
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

          {activeTab === 'banners' && (
            <div className="space-y-10 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-white">Banners del Home</h3>
                <button onClick={handleAddBanner} disabled={config.headerSlides.length >= 4} className="bg-blue-600 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest text-white hover:bg-blue-500 disabled:opacity-40 flex items-center gap-2">
                   <Plus className="w-4 h-4" /> Añadir Banner
                </button>
              </div>

              <div className="grid grid-cols-1 gap-12">
                {config.headerSlides.map((slide, idx) => (
                  <div key={slide.id} className="bg-slate-950 p-8 rounded-3xl border border-slate-800 relative group">
                    <button onClick={() => handleRemoveBanner(idx)} className="absolute top-6 right-6 p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                      <Trash2 className="w-5 h-5" />
                    </button>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
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
                        <label className="text-[10px] font-black text-slate-500 uppercase">Imagen</label>
                        <div className="aspect-[21/9] bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden relative group/img">
                          <img src={slide.image} className="w-full h-full object-cover opacity-60 group-hover/img:opacity-80 transition-opacity" />
                          <button onClick={() => { setActiveBannerIndex(idx); bannerFileRef.current?.click(); }} className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover/img:opacity-100 transition-opacity font-black text-[10px] uppercase tracking-widest bg-black/40">Cambiar Imagen</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <input type="file" ref={bannerFileRef} className="hidden" accept="image/*" onChange={e => {
                const file = e.target.files?.[0];
                if (file && activeBannerIndex !== null) {
                  const r = new FileReader();
                  r.onload = () => {
                    updateSlide(activeBannerIndex, {image: r.result as string});
                    setActiveBannerIndex(null);
                  };
                  r.readAsDataURL(file);
                }
              }} />

              <div className="pt-10 flex justify-center">
                <button onClick={handleSaveConfig} disabled={saving} className="bg-emerald-600 px-12 py-5 rounded-2xl font-black text-white uppercase text-xs tracking-[0.2em] shadow-xl shadow-emerald-900/40 transition-all hover:bg-emerald-500 flex items-center gap-3">
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
