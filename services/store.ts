
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
    const stored = localStorage.getItem(COLLECTIONS.USER);
    callback(stored ? JSON.parse(stored) : null);
    return () => {
        listeners.auth = listeners.auth.filter(l => l !== callback);
    };
  },

  getConfig: (): AppConfig => {
    const stored = localStorage.getItem(COLLECTIONS.CONFIG);
    return stored ? JSON.parse(stored) : INITIAL_CONFIG;
  },

  getProducts: (): Product[] => {
    const stored = localStorage.getItem(COLLECTIONS.PRODUCTS);
    return stored ? JSON.parse(stored) : [];
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
    
    localStorage.setItem(COLLECTIONS.PRODUCTS, JSON.stringify(products));
    notify('products', products);
    return product;
  },

  deleteProduct: async (id: number) => {
    const products = StoreService.getProducts().filter(p => p.id !== id);
    localStorage.setItem(COLLECTIONS.PRODUCTS, JSON.stringify(products));
    notify('products', products);
  },

  saveConfig: async (config: AppConfig) => {
    localStorage.setItem(COLLECTIONS.CONFIG, JSON.stringify(config));
    notify('config', config);
    return config;
  },

  login: async (email: string, pass: string): Promise<{ success: boolean; user?: User; message?: string }> => {
    // Simulación de login
    if (pass.length < 6) return { success: false, message: 'Contraseña muy corta (min 6).' };
    
    // Admin Hardcodeado para pruebas (nahiceballos@gmail.com)
    const isAdmin = email.toLowerCase() === 'nahiceballos@gmail.com';
    
    const user: User = {
        uid: 'local-' + Date.now(),
        email,
        name: email.split('@')[0],
        isVerified: true, // Auto verificar en local
        role: isAdmin ? 'admin' : 'client'
    };
    
    localStorage.setItem(COLLECTIONS.USER, JSON.stringify(user));
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
    localStorage.setItem(COLLECTIONS.USER, JSON.stringify(user));
    notify('auth', user);
    return { success: true, user };
  },

  logout: async () => {
    localStorage.removeItem(COLLECTIONS.USER);
    notify('auth', null);
  },

  refreshSession: async (): Promise<User | null> => {
    const stored = localStorage.getItem(COLLECTIONS.USER);
    return stored ? JSON.parse(stored) : null;
  }
};
