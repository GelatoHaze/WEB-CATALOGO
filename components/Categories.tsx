
import React from 'react';
import { Smartphone, Coffee, Tv, Refrigerator, Laptop, Watch, Headphones, Camera, Home, Gamepad, Shirt, Car, Music, Box } from 'lucide-react';
import { Category } from '../types';

interface CategoriesProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  categories: Category[];
}

const ICON_MAP: Record<string, React.ReactNode> = {
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

const Categories: React.FC<CategoriesProps> = ({ selectedCategory, onSelectCategory, categories = [] }) => {
  
  // Combine "All" with user categories, protecting against undefined
  const safeCategories = Array.isArray(categories) ? categories : [];
  
  const allCategories = [
    { id: 'all', name: 'Todo', icon: 'all' },
    ...safeCategories
  ];

  const getIcon = (iconName: string) => {
    if (iconName === 'all') {
      return (
        <div className="grid grid-cols-2 gap-0.5 w-6 h-6 place-content-center p-1">
            <div className="w-full h-full bg-current rounded-[1px]"></div>
            <div className="w-full h-full bg-current rounded-[1px]"></div>
            <div className="w-full h-full bg-current rounded-[1px]"></div>
            <div className="w-full h-full bg-current rounded-[1px]"></div>
        </div>
      );
    }
    return ICON_MAP[iconName] || <Box className="w-6 h-6" />;
  };

  return (
    <section className="py-20 container mx-auto px-4" id="categorias">
      <div className="text-center mb-16">
        <span className="text-blue-500 font-bold tracking-widest text-sm uppercase mb-2 block">Nuestras Colecciones</span>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-heading">Explora por Categoría</h2>
        <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto rounded-full"></div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {allCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3 group
              ${selectedCategory === cat.id 
                ? 'bg-blue-900/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                : 'bg-slate-900 border-slate-800 hover:border-blue-500/50 hover:bg-slate-800'
              }`}
          >
            <div className={`p-3 rounded-full transition-colors ${
              selectedCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-blue-400'
            }`}>
              {getIcon(cat.icon)}
            </div>
            <span className={`font-semibold text-sm ${selectedCategory === cat.id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default Categories;
