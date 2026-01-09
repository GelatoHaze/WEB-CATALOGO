
import { Product, AppConfig, User } from '../types';

// MOCK CONSTANTS - Almacenamiento Local
const COLLECTIONS = {
  PRODUCTS: 'cblls_products_local',
  CONFIG: 'cblls_config_local',
  USER: 'cblls_user_session'
};

// INITIAL CONFIG DATA
const INITIAL_CONFIG: AppConfig = {
  whatsappNumber: '5493364180739',
  instagramUrl: 'https://instagram.com/cblls',
  facebookUrl: 'https://facebook.com/cblls',
  twitterUrl: 'https://twitter.com/cblls',
  linkedinUrl: 'https://linkedin.com',
  email: 'ventas@cbllstech.com',
  address: 'San Nicolas de los Arroyos, Buenos Aires, Argentina',
  phoneDisplay: '+54 9 336 418-0739',
  generalInfo: 'Líderes en tecnología premium.',
  footerText: '© 2026 CBLLS. Todos los derechos reservados.',
  headerSlides: [
    {
      id: 'slide1',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop',
      title: 'Innovación CBLLS',
      subtitle: 'La mejor tecnología en tus manos.',
      ctaText: 'Ver Catálogo',
      ctaLink: '#productos'
    },
    {
      id: 'slide2',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=2000&auto=format&fit=crop',
      title: 'Móviles Premium',
      subtitle: 'Diseño y potencia sin compromisos.',
      ctaText: 'Ver Móviles',
      ctaLink: '#productos'
    },
    {
      id: 'slide3',
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=2000&auto=format&fit=crop',
      title: 'Hogar Inteligente',
      subtitle: 'Conecta tu vida con la última generación.',
      ctaText: 'Ver Hogar',
      ctaLink: '#productos'
    },
    {
      id: 'slide4',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2000&auto=format&fit=crop',
      title: 'Audio High-Fidelity',
      subtitle: 'Siente cada nota con nuestra colección de audio.',
      ctaText: 'Ver Audio',
      ctaLink: '#productos'
    }
  ],
  categories: [
    { id: 'mobile', name: 'Móviles', icon: 'smartphone' },
    { id: 'kitchen', name: 'Cocina', icon: 'coffee' },
    { id: 'tv', name: 'TV & Audio', icon: 'tv' },
    { id: 'computing', name: 'Cómputo', icon: 'laptop' }
  ]
};

// Sistema simple de Observadores para simular tiempo real
type Listener<T> = (data: T) => void;
const listeners = {
    products: [] as Listener<Product[]>[],
    config: [] as Listener<AppConfig>[],
    auth: [] as Listener<User | null>[],
};

const notify = (type: 'products' | 'config' | 'auth', data: any) => {
    listeners[type].forEach(l => l(data));
};

// Helper para manejar errores de almacenamiento
const safeSetItem = (key: string, value: any) => {
    try {
        const stringValue = JSON.stringify(value);
        localStorage.setItem(key, stringValue);
        return true;
    } catch (e: any) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            console.error("LocalStorage Quota Exceeded");
            alert("⚠️ ¡Espacio Lleno! Las imágenes son muy pesadas para el almacenamiento local. Intenta usar imágenes externas (URL) o reduce su calidad.");
            throw new Error("QUOTA_EXCEEDED");
        }
        console.error("Storage Error", e);
        return false;
    }
};

export const StoreService = {
  // Suscripción a productos (Local)
  subscribeToProducts: (callback: (products: Product[]) => void) => {
    listeners.products.push(callback);
    callback(StoreService.getProducts());
    return () => {
        listeners.products = listeners.products.filter(l => l !== callback);
    };
  },

  // Suscripción a configuración (Local)
  subscribeToConfig: (callback: (config: AppConfig) => void) => {
    listeners.config.push(callback);
    callback(StoreService.getConfig());
    return () => {
        listeners.config = listeners.config.filter(l => l !== callback);
    };
  },

  // Suscripción a autenticación (Local/Session)
  subscribeToAuth: (callback: (user: User | null) => void) => {
    listeners.auth.push(callback);
    try {
        const stored = localStorage.getItem(COLLECTIONS.USER);
        callback(stored ? JSON.parse(stored) : null);
    } catch (e) {
        callback(null);
    }
    return () => {
        listeners.auth = listeners.auth.filter(l => l !== callback);
    };
  },

  getConfig: (): AppConfig => {
    try {
        const stored = localStorage.getItem(COLLECTIONS.CONFIG);
        const parsed = stored ? JSON.parse(stored) : {};
        
        return {
            ...INITIAL_CONFIG,
            ...parsed,
            headerSlides: (parsed.headerSlides && Array.isArray(parsed.headerSlides) && parsed.headerSlides.length > 0) 
                ? parsed.headerSlides 
                : INITIAL_CONFIG.headerSlides,
            categories: (parsed.categories && Array.isArray(parsed.categories) && parsed.categories.length > 0) 
                ? parsed.categories 
                : INITIAL_CONFIG.categories
        };
    } catch (e) {
        console.error("Error reading config, reverting to default", e);
        localStorage.removeItem(COLLECTIONS.CONFIG);
        return INITIAL_CONFIG;
    }
  },

  getProducts: (): Product[] => {
    try {
        const stored = localStorage.getItem(COLLECTIONS.PRODUCTS);
        const parsed = stored ? JSON.parse(stored) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error("Error reading products", e);
        return [];
    }
  },

  saveProduct: async (product: Product) => {
    if (product.id === 0) product.id = Date.now();
    
    // Normalización de stock
    if (product.variants && product.variants.length > 0) {
      product.stock = product.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
      product.price = product.variants[0].price;
    }

    const products = StoreService.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
        products[index] = product;
    } else {
        products.push(product);
    }
    
    // Usamos el helper seguro
    if (safeSetItem(COLLECTIONS.PRODUCTS, products)) {
        notify('products', products);
        return product;
    } else {
        throw new Error("No se pudo guardar el producto");
    }
  },

  deleteProduct: async (id: number) => {
    const products = StoreService.getProducts().filter(p => p.id !== id);
    safeSetItem(COLLECTIONS.PRODUCTS, products);
    notify('products', products);
  },

  saveConfig: async (config: AppConfig) => {
    // Usamos el helper seguro
    if (safeSetItem(COLLECTIONS.CONFIG, config)) {
        notify('config', config);
        return config;
    } else {
        throw new Error("No se pudo guardar la configuración");
    }
  },

  login: async (email: string, pass: string): Promise<{ success: boolean; user?: User; message?: string }> => {
    if (pass.length < 6) return { success: false, message: 'Contraseña muy corta (min 6).' };
    
    const isAdmin = email.toLowerCase() === 'nahiceballos@gmail.com';
    
    const user: User = {
        uid: 'local-' + Date.now(),
        email,
        name: email.split('@')[0],
        isVerified: true, 
        role: isAdmin ? 'admin' : 'client'
    };
    
    safeSetItem(COLLECTIONS.USER, user);
    notify('auth', user);
    return { success: true, user };
  },

  register: async (name: string, email: string, pass: string): Promise<{ success: boolean; user?: User; message?: string }> => {
    const user: User = {
        uid: 'local-' + Date.now(),
        email,
        name,
        isVerified: true,
        role: 'client'
    };
    safeSetItem(COLLECTIONS.USER, user);
    notify('auth', user);
    return { success: true, user };
  },

  logout: async () => {
    localStorage.removeItem(COLLECTIONS.USER);
    notify('auth', null);
  },

  refreshSession: async (): Promise<User | null> => {
    try {
        const stored = localStorage.getItem(COLLECTIONS.USER);
        return stored ? JSON.parse(stored) : null;
    } catch (e) {
        return null;
    }
  }
};
