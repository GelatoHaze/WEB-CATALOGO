import React, { useState, useEffect, useRef } from 'react';
import { Product, AppConfig, Variant, HeaderSlide, Category } from '../types';
import { StoreService } from '../services/store';
import { Save, Trash2, Plus, Edit, Settings, Package, LogOut, LayoutTemplate, Image as ImageIcon, X, Upload, List, Smartphone, Coffee, Tv, Refrigerator, Laptop, Watch, Camera, Headphones, Home, Gamepad, Shirt, Car, Music } from 'lucide-react';

interface AdminPanelProps {
  onLogout: () => void;
  onDataChange: () => void;
}

// Map available icons for selection in Admin
const AVAILABLE_ICONS = [
  { id: 'smartphone', icon: <Smartphone className="w-5 h-5" />, label: 'Smartphone' },
  { id: 'laptop', icon: <Laptop className="w-5 h-5" />, label: 'Laptop' },
  { id: 'tv', icon: <Tv className="w-5 h-5" />, label: 'TV' },
  { id: 'camera', icon: <Camera className="w-5 h-5" />, label: 'Cámara' },
  { id: 'headphones', icon: <Headphones className="w-5 h-5" />, label: 'Auriculares' },
  { id: 'watch', icon: <Watch className="w-5 h-5" />, label: 'Reloj' },
  { id: 'coffee', icon: <Coffee className="w-5 h-5" />, label: 'Cocina' },
  { id: 'refrigerator', icon: <Refrigerator className="w-5 h-5" />, label: 'Refrigerador' },
  { id: 'home', icon: <Home className="w-5 h-5" />, label: 'Hogar' },
  { id: 'gamepad', icon: <Gamepad className="w-5 h-5" />, label: 'Gaming' },
  { id: 'shirt', icon: <Shirt className="w-5 h-5" />, label: 'Ropa' },
  { id: 'car', icon: <Car className="w-5 h-5" />, label: 'Auto' },
  { id: 'music', icon: <Music className="w-5 h-5" />, label: 'Música' },
];

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, onDataChange }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'config' | 'header' | 'categories'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<AppConfig>(StoreService.getConfig());
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Refs for file inputs
  const fileInputRef = useRef<HTMLInputElement>(null); // For Header Slides
  const productFileInputRef = useRef<HTMLInputElement>(null); // For Products
  
  const [activeSlideId, setActiveSlideId] = useState<string | null>(null);
  
  // Category Edit State
  const [newCategory, setNewCategory] = useState<Category>({ id: '', name: '', icon: 'home' });

  // State for variant editing inside the product form
  const [tempVariant, setTempVariant] = useState<Variant | null>(null);

  useEffect(() => {
    setProducts(StoreService.getProducts());
  }, []);

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    // Calculate total stock from variants if they exist
    let calculatedStock = editingProduct.stock;
    if (editingProduct.variants && editingProduct.variants.length > 0) {
        calculatedStock = editingProduct.variants.reduce((acc, v) => acc + v.stock, 0);
    }

    // Ensure features are clean (no empty strings from extra newlines)
    const cleanFeatures = editingProduct.features?.map(f => f.trim()).filter(f => f !== '') || [];

    const productToSave = { ...editingProduct, stock: calculatedStock, features: cleanFeatures };
    const updatedProducts = StoreService.saveProduct(productToSave);
    setProducts(updatedProducts);
    setEditingProduct(null);
    onDataChange();
    alert('Producto guardado correctamente');
  };

  const handleDeleteProduct = (id: number) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      const updated = StoreService.deleteProduct(id);
      setProducts(updated);
      onDataChange();
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    StoreService.saveConfig(config);
    onDataChange();
    alert('Configuración actualizada');
  };

  // --- Category Handlers ---
  const handleAddCategory = () => {
    if (!newCategory.name || !newCategory.id) {
        alert("Por favor completa el nombre y el ID de la categoría.");
        return;
    }
    // Check for duplicate ID
    if (config.categories.some(c => c.id === newCategory.id)) {
        alert("El ID de la categoría ya existe. Usa uno único.");
        return;
    }

    const updatedCategories = [...(config.categories || []), newCategory];
    setConfig({ ...config, categories: updatedCategories });
    StoreService.saveConfig({ ...config, categories: updatedCategories });
    setNewCategory({ id: '', name: '', icon: 'home' }); // Reset
    onDataChange();
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm("¿Eliminar categoría? Los productos asociados podrían perder su referencia.")) {
        const updatedCategories = config.categories.filter(c => c.id !== id);
        setConfig({ ...config, categories: updatedCategories });
        StoreService.saveConfig({ ...config, categories: updatedCategories });
        onDataChange();
    }
  };

  // --- Variant Handlers ---
  const handleAddVariant = () => {
    if (!editingProduct) return;
    const newVariant: Variant = {
      id: Date.now().toString(),
      name: '',
      attributes: { color: '', capacity: '' },
      price: editingProduct.price,
      stock: 0,
      images: [editingProduct.image] // Default to main image
    };
    setTempVariant(newVariant);
  };

  const handleEditVariant = (variant: Variant) => {
    setTempVariant({...variant});
  };

  const handleSaveVariant = () => {
    if (!editingProduct || !tempVariant) return;
    
    const variants = editingProduct.variants || [];
    const index = variants.findIndex(v => v.id === tempVariant.id);
    
    let newVariants;
    if (index >= 0) {
      newVariants = [...variants];
      newVariants[index] = tempVariant;
    } else {
      newVariants = [...variants, tempVariant];
    }

    setEditingProduct({ ...editingProduct, variants: newVariants });
    setTempVariant(null);
  };

  const handleDeleteVariant = (id: string) => {
    if (!editingProduct) return;
    const newVariants = editingProduct.variants.filter(v => v.id !== id);
    setEditingProduct({ ...editingProduct, variants: newVariants });
  };

  // --- Header Slide Handlers ---
  const handleAddSlide = () => {
    const newSlide: HeaderSlide = {
      id: Date.now().toString(),
      image: '',
      title: 'Nuevo Título',
      subtitle: 'Descripción breve',
      ctaText: 'Ver Más',
      ctaLink: '#products'
    };
    setConfig({...config, headerSlides: [...(config.headerSlides || []), newSlide]});
  };

  const handleUpdateSlide = (id: string, field: keyof HeaderSlide, value: string) => {
    const updatedSlides = config.headerSlides.map(slide => 
      slide.id === id ? { ...slide, [field]: value } : slide
    );
    setConfig({...config, headerSlides: updatedSlides});
  };

  const handleDeleteSlide = (id: string) => {
    const updatedSlides = config.headerSlides.filter(s => s.id !== id);
    setConfig({...config, headerSlides: updatedSlides});
  };

  // Image Upload Logic (converts file to Base64) - FOR HEADER
  const handleTriggerUpload = (slideId: string) => {
    setActiveSlideId(slideId);
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleHeaderFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeSlideId) return;

    if (file.size > 800 * 1024) {
        alert("La imagen es demasiado grande. Por favor usa imágenes de menos de 800KB.");
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
        handleUpdateSlide(activeSlideId, 'image', reader.result as string);
        setActiveSlideId(null);
        event.target.value = ''; 
    };
    reader.readAsDataURL(file);
  };

  // Image Upload Logic - FOR PRODUCT
  const handleProductImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editingProduct) return;

    if (file.size > 800 * 1024) {
        alert("La imagen es demasiado grande. Por favor usa imágenes de menos de 800KB.");
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
        setEditingProduct({ ...editingProduct, image: reader.result as string });
        event.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white font-heading">Panel de Administración</h1>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" /> Salir
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-8 border-b border-slate-800 pb-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-bold transition-colors whitespace-nowrap ${
              activeTab === 'products' ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Package className="w-5 h-5" /> Productos
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-bold transition-colors whitespace-nowrap ${
              activeTab === 'categories' ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <List className="w-5 h-5" /> Categorías
          </button>
          <button
            onClick={() => setActiveTab('header')}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-bold transition-colors whitespace-nowrap ${
              activeTab === 'header' ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <LayoutTemplate className="w-5 h-5" /> Encabezado
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-bold transition-colors whitespace-nowrap ${
              activeTab === 'config' ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Settings className="w-5 h-5" /> Global
          </button>
        </div>

        {/* Content */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
          
          {activeTab === 'products' && (
            <div>
              <div className="flex justify-end mb-6">
                <button 
                  onClick={() => setEditingProduct({
                    id: 0, name: '', category: config.categories[0]?.id || 'mobile', price: 0, image: '', description: '', features: [], stock: 0, isNew: false, variants: []
                  })}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold"
                >
                  <Plus className="w-4 h-4" /> Nuevo Producto
                </button>
              </div>

              {editingProduct ? (
                <form onSubmit={handleSaveProduct} className="space-y-6 max-w-4xl mx-auto bg-slate-950 p-6 rounded-xl border border-slate-800">
                  <h3 className="text-xl font-bold mb-4 flex justify-between items-center">
                    <span>{editingProduct.id === 0 ? 'Crear' : 'Editar'} Producto</span>
                    <button type="button" onClick={() => setEditingProduct(null)} className="text-slate-500 hover:text-white"><X /></button>
                  </h3>
                  
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Nombre</label>
                      <input 
                        type="text" 
                        required
                        value={editingProduct.name}
                        onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Categoría</label>
                      <select 
                        value={editingProduct.category}
                        onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                      >
                        {config.categories?.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Precio Referencia (NO visible al cliente)</label>
                      <input 
                        type="number" 
                        required
                        value={editingProduct.price}
                        onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1 font-bold text-blue-400">Stock Total</label>
                      <input 
                        type="number" 
                        readOnly
                        value={editingProduct.variants?.length ? editingProduct.variants.reduce((a,b) => a + b.stock, 0) : editingProduct.stock}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-slate-500 cursor-not-allowed"
                        placeholder="Se calcula auto. con variantes"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Si no usas variantes, edita el stock directamente en la variante por defecto.</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-slate-400 mb-1">Imagen Principal</label>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 flex-shrink-0">
                            {editingProduct.image ? (
                                <img src={editingProduct.image} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-600"><ImageIcon /></div>
                            )}
                        </div>
                        <div className="flex-grow">
                            <input 
                                type="file" 
                                accept="image/*"
                                ref={productFileInputRef}
                                onChange={handleProductImageUpload}
                                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                            />
                            <p className="text-xs text-slate-500 mt-1">O pega una URL abajo:</p>
                            <input 
                                type="url"
                                value={editingProduct.image}
                                onChange={e => setEditingProduct({...editingProduct, image: e.target.value})}
                                placeholder="https://..."
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-white text-sm mt-1"
                            />
                        </div>
                      </div>
                    </div>
                    
                    {/* Features Editing */}
                    <div className="md:col-span-2">
                      <label className="block text-sm text-slate-400 mb-1 font-bold text-blue-400">Características Principales (Una por línea)</label>
                      <textarea 
                        value={editingProduct.features?.join('\n') || ''}
                        onChange={e => setEditingProduct({...editingProduct, features: e.target.value.split('\n')})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 h-24"
                        placeholder="Ej: Cámara de 48MP&#10;Pantalla OLED&#10;Batería de larga duración"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm text-slate-400 mb-1">Descripción Detallada</label>
                      <textarea 
                        required
                        value={editingProduct.description}
                        onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 h-24"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        checked={editingProduct.isNew}
                        onChange={e => setEditingProduct({...editingProduct, isNew: e.target.checked})}
                        className="w-4 h-4 rounded bg-slate-800 border-slate-700"
                      />
                      <label className="text-sm text-slate-300">Marcar como Nuevo</label>
                    </div>
                  </div>

                  {/* Variants Section */}
                  <div className="border-t border-slate-800 pt-6 mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-bold text-white">Variantes del Producto</h4>
                      <button type="button" onClick={handleAddVariant} className="text-sm bg-slate-800 hover:bg-slate-700 text-blue-400 px-3 py-1 rounded-lg border border-slate-700">
                        + Agregar Variante
                      </button>
                    </div>

                    {/* Variant List */}
                    <div className="space-y-2 mb-4">
                      {editingProduct.variants?.map((v) => (
                        <div key={v.id} className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded overflow-hidden bg-white">
                                <img src={v.images[0] || editingProduct.image} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">{v.name}</p>
                                <p className="text-xs text-slate-500">Stock: {v.stock} | Precio Ref: ${v.price}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => handleEditVariant(v)} className="p-1 hover:text-blue-400"><Edit className="w-4 h-4" /></button>
                            <button type="button" onClick={() => handleDeleteVariant(v.id)} className="p-1 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                      {(!editingProduct.variants || editingProduct.variants.length === 0) && (
                        <p className="text-slate-500 text-sm italic">Sin variantes. Se usará la configuración base del producto.</p>
                      )}
                    </div>

                    {/* Variant Editor (Modal-like inside form) */}
                    {tempVariant && (
                      <div className="bg-slate-800/50 p-4 rounded-xl border border-blue-500/30 mb-4 animate-fade-in">
                        <h5 className="font-bold text-blue-400 mb-3 text-sm uppercase">Editando Variante</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-slate-400">Nombre Variante (ej: Rojo 64GB)</label>
                                <input type="text" value={tempVariant.name} onChange={e => setTempVariant({...tempVariant, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400">Precio Ref (Interno)</label>
                                <input type="number" value={tempVariant.price} onChange={e => setTempVariant({...tempVariant, price: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400">Stock</label>
                                <input type="number" value={tempVariant.stock} onChange={e => setTempVariant({...tempVariant, stock: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400">Imagen URL (Principal)</label>
                                <input type="text" value={tempVariant.images[0] || ''} onChange={e => {
                                    const newImages = [...tempVariant.images];
                                    newImages[0] = e.target.value;
                                    setTempVariant({...tempVariant, images: newImages});
                                }} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white" />
                            </div>
                            {/* Attributes */}
                            <div>
                                <label className="text-xs text-slate-400">Color</label>
                                <input type="text" value={tempVariant.attributes.color || ''} onChange={e => setTempVariant({...tempVariant, attributes: {...tempVariant.attributes, color: e.target.value}})} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400">Capacidad/Talle</label>
                                <input type="text" value={tempVariant.attributes.capacity || ''} onChange={e => setTempVariant({...tempVariant, attributes: {...tempVariant.attributes, capacity: e.target.value}})} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-3">
                            <button type="button" onClick={() => setTempVariant(null)} className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 rounded text-white">Cancelar</button>
                            <button type="button" onClick={handleSaveVariant} className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 rounded text-white">Guardar Variante</button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg">Guardar Producto Completo</button>
                    <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg">Cancelar</button>
                  </div>
                </form>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-950 text-slate-200 uppercase font-bold">
                      <tr>
                        <th className="p-4 rounded-tl-lg">Producto</th>
                        <th className="p-4">Categoría</th>
                        <th className="p-4">Stock Total</th>
                        <th className="p-4 rounded-tr-lg text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {products.map(product => {
                         const totalStock = product.variants && product.variants.length > 0 
                            ? product.variants.reduce((acc, v) => acc + v.stock, 0)
                            : product.stock;
                         // Find category name
                         const catName = config.categories?.find(c => c.id === product.category)?.name || product.category;
                         return (
                            <tr key={product.id} className="hover:bg-slate-800/50 transition-colors">
                            <td className="p-4 flex items-center gap-3">
                                <img src={product.image} alt="" className="w-10 h-10 rounded object-cover bg-white" />
                                <div>
                                    <span className="font-medium text-white block">{product.name}</span>
                                    <span className="text-xs text-slate-500">{product.variants?.length || 0} Variantes</span>
                                </div>
                            </td>
                            <td className="p-4 capitalize">{catName}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                totalStock === 0 ? 'bg-red-900/50 text-red-400' :
                                totalStock < 5 ? 'bg-amber-900/50 text-amber-400' :
                                'bg-emerald-900/50 text-emerald-400'
                                }`}>
                                {totalStock} unid.
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                <button onClick={() => setEditingProduct(product)} className="p-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded transition-all">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteProduct(product.id)} className="p-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                </div>
                            </td>
                            </tr>
                         )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-4">Gestión de Categorías</h3>
                
                {/* Create New Category */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6">
                    <h4 className="text-sm font-bold text-blue-400 uppercase mb-3">Agregar Nueva Categoría</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="text-xs text-slate-500">ID Único (ej: "gamers")</label>
                            <input 
                                type="text" 
                                value={newCategory.id} 
                                onChange={(e) => setNewCategory({...newCategory, id: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                                placeholder="identificador_unico"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500">Nombre Visible</label>
                            <input 
                                type="text" 
                                value={newCategory.name} 
                                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                                placeholder="Nombre de la categoría"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 mb-1 block">Icono</label>
                            <div className="flex gap-2 items-center">
                                <select 
                                    value={newCategory.icon} 
                                    onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
                                    className="flex-grow bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                                >
                                    {AVAILABLE_ICONS.map(icon => (
                                        <option key={icon.id} value={icon.id}>{icon.label}</option>
                                    ))}
                                </select>
                                <button onClick={handleAddCategory} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex-shrink-0">
                                    Agregar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* List Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {config.categories?.map((cat) => (
                        <div key={cat.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-800 rounded-lg text-blue-400">
                                    {AVAILABLE_ICONS.find(i => i.id === cat.icon)?.icon || <List className="w-5 h-5"/>}
                                </div>
                                <div>
                                    <p className="font-bold text-white text-sm">{cat.name}</p>
                                    <p className="text-xs text-slate-500">ID: {cat.id}</p>
                                </div>
                            </div>
                            <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-400 hover:bg-red-900/20 p-2 rounded transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
          )}

          {activeTab === 'header' && (
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Configuración del Encabezado (Slider)</h3>
                    <button onClick={handleAddSlide} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold">
                        <Plus className="w-4 h-4" /> Agregar Slide
                    </button>
                </div>
                
                {/* Hidden File Input for Header */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleHeaderFileChange}
                />

                <div className="space-y-4">
                    {config.headerSlides?.map((slide, index) => (
                        <div key={slide.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 items-start">
                            <div className="w-full md:w-48 aspect-video bg-slate-800 rounded-lg overflow-hidden flex-shrink-0 border border-slate-700 relative group">
                                {slide.image ? (
                                    <img src={slide.image} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-600"><ImageIcon /></div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button 
                                        type="button"
                                        onClick={() => handleTriggerUpload(slide.id)} 
                                        className="bg-white text-slate-900 p-2 rounded-full hover:bg-blue-100 transition-transform hover:scale-110"
                                        title="Cambiar imagen desde dispositivo"
                                    >
                                        <Upload className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                                <div>
                                    <label className="text-xs text-slate-500">Título</label>
                                    <input 
                                        type="text" 
                                        value={slide.title}
                                        onChange={(e) => handleUpdateSlide(slide.id, 'title', e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500">Subtítulo</label>
                                    <input 
                                        type="text" 
                                        value={slide.subtitle}
                                        onChange={(e) => handleUpdateSlide(slide.id, 'subtitle', e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 flex justify-between">
                                        <span>Imagen URL / Base64</span>
                                        <button 
                                            type="button" 
                                            onClick={() => handleTriggerUpload(slide.id)}
                                            className="text-blue-400 hover:underline flex items-center gap-1"
                                        >
                                            <Upload className="w-3 h-3" /> Subir archivo
                                        </button>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={slide.image}
                                        onChange={(e) => handleUpdateSlide(slide.id, 'image', e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm truncate"
                                        placeholder="Pegar URL o usar botón de subir"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className="text-xs text-slate-500">Texto Botón</label>
                                        <input 
                                            type="text" 
                                            value={slide.ctaText}
                                            onChange={(e) => handleUpdateSlide(slide.id, 'ctaText', e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs text-slate-500">Enlace Botón</label>
                                        <input 
                                            type="text" 
                                            value={slide.ctaLink}
                                            onChange={(e) => handleUpdateSlide(slide.id, 'ctaLink', e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDeleteSlide(slide.id)}
                                className="p-2 text-slate-500 hover:text-red-500 hover:bg-slate-800 rounded-lg self-start"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                    {(!config.headerSlides || config.headerSlides.length === 0) && (
                        <p className="text-center text-slate-500 py-8">No hay slides configurados. El sitio usará el banner por defecto.</p>
                    )}
                </div>
                
                <div className="flex justify-end pt-4 border-t border-slate-800">
                    <button onClick={handleSaveConfig} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-full shadow-lg flex items-center gap-2">
                        <Save className="w-5 h-5" /> Guardar Cambios del Header
                    </button>
                </div>
            </div>
          )}

          {activeTab === 'config' && (
            <form onSubmit={handleSaveConfig} className="max-w-2xl mx-auto space-y-6">
              
              {/* General Information Box */}
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Información General (Footer)</h3>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Descripción de la Empresa</label>
                  <textarea 
                    value={config.generalInfo || ''}
                    onChange={e => setConfig({...config, generalInfo: e.target.value})}
                    placeholder="Escribe aquí la información general de tu negocio que aparecerá en el pie de página..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white h-32 focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Este texto aparecerá en el pie de página debajo del logo.</p>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Texto del Copyright (Catálogo)</label>
                  <input 
                    type="text"
                    value={config.footerText || ''}
                    onChange={e => setConfig({...config, footerText: e.target.value})}
                    placeholder="© 2026 CBLLS. Todos los derechos reservados."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Edita el año o el mensaje de derechos reservados.</p>
                </div>
              </div>

              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">WhatsApp Business</h3>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Número (Formato internacional sin +)</label>
                  <input 
                    type="text" 
                    value={config.whatsappNumber}
                    onChange={e => setConfig({...config, whatsappNumber: e.target.value})}
                    placeholder="5493364180739"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  />
                  <p className="text-xs text-slate-500 mt-1">Este número recibirá los mensajes de los botones "Consultar".</p>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Número Visible (Formato leíble)</label>
                  <input 
                    type="text" 
                    value={config.phoneDisplay}
                    onChange={e => setConfig({...config, phoneDisplay: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Redes Sociales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Instagram URL</label>
                    <input 
                      type="url" 
                      value={config.instagramUrl}
                      onChange={e => setConfig({...config, instagramUrl: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Facebook URL</label>
                    <input 
                      type="url" 
                      value={config.facebookUrl}
                      onChange={e => setConfig({...config, facebookUrl: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Twitter/X URL</label>
                    <input 
                      type="url" 
                      value={config.twitterUrl}
                      onChange={e => setConfig({...config, twitterUrl: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">LinkedIn URL</label>
                    <input 
                      type="url" 
                      value={config.linkedinUrl}
                      onChange={e => setConfig({...config, linkedinUrl: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Información de Contacto</h3>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Email Público</label>
                  <input 
                    type="email" 
                    value={config.email}
                    onChange={e => setConfig({...config, email: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Dirección Física</label>
                  <input 
                    type="text" 
                    value={config.address}
                    onChange={e => setConfig({...config, address: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center gap-2">
                  <Save className="w-5 h-5" /> Guardar Cambios Globales
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;