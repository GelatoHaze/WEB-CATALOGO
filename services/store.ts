import { Product, AppConfig, User } from '../types';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyAnMSIHno0eas5CbxntABGRBXWnTiGBQk8",
  authDomain: "cblls-web.firebaseapp.com",
  projectId: "cblls-web",
  storageBucket: "cblls-web.firebasestorage.app",
  messagingSenderId: "519428914276",
  appId: "1:519428914276:web:8d2e4c862cb5f3561ef371"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initial Data
const INITIAL_PRODUCTS: Product[] = [];

const INITIAL_CONFIG: AppConfig = {
  whatsappNumber: '5493364180739',
  instagramUrl: 'https://instagram.com',
  facebookUrl: 'https://facebook.com',
  twitterUrl: 'https://twitter.com',
  linkedinUrl: 'https://linkedin.com',
  email: 'ventas@cbllstech.com',
  address: 'San Nicolas de los Arroyos, Buenos Aires, Argentina',
  phoneDisplay: '+54 9 336 418-0739',
  generalInfo: 'Catálogo digital líder en productos tecnológicos y electrodomésticos de alta gama. Calidad premium y garantía asegurada en cada compra.',
  footerText: '© 2026 CBLLS. Todos los derechos reservados.',
  headerSlides: [
    {
      id: 'slide1',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop',
      title: 'Bienvenido a CBLLS',
      subtitle: 'Configura tu catálogo desde el panel de administración.',
      ctaText: 'Ir al Admin',
      ctaLink: '#'
    }
  ],
  categories: [
    { id: 'mobile', name: 'Móviles', icon: 'smartphone' },
    { id: 'kitchen', name: 'Cocina', icon: 'coffee' },
    { id: 'tv', name: 'TV & Audio', icon: 'tv' },
    { id: 'home', name: 'Hogar', icon: 'refrigerator' },
    { id: 'computing', name: 'Cómputo', icon: 'laptop' },
    { id: 'wearables', name: 'Wearables', icon: 'watch' },
    { id: 'photo', name: 'Fotografía', icon: 'camera' },
  ]
};

const STORAGE_KEYS = {
  PRODUCTS: 'cblls_products',
  CONFIG: 'cblls_config',
};

// Helper to map Firebase User to App User
const mapUser = (fbUser: FirebaseUser): User => {
  return {
    uid: fbUser.uid,
    email: fbUser.email || '',
    name: fbUser.displayName || '',
    isVerified: fbUser.emailVerified,
    // Simple frontend role mapping. Secure backend rules would be needed for real protection.
    role: fbUser.email === 'admin@cblls.com' ? 'admin' : 'client'
  };
};

export const StoreService = {
  // --- Products (LocalStorage) ---
  getProducts: (): Product[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(stored);
  },

  saveProduct: (product: Product) => {
    const products = StoreService.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      product.id = Date.now();
      products.push(product);
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return products;
  },

  deleteProduct: (id: number) => {
    const products = StoreService.getProducts();
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
    return filtered;
  },

  // --- Configuration (LocalStorage) ---
  getConfig: (): AppConfig => {
    const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(INITIAL_CONFIG));
      return INITIAL_CONFIG;
    }
    const config = JSON.parse(stored);
    if (!config.categories) {
        config.categories = INITIAL_CONFIG.categories;
    }
    return config;
  },

  saveConfig: (config: AppConfig) => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    return config;
  },

  // --- Auth (Firebase Real) ---
  
  subscribeToAuth: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        callback(mapUser(firebaseUser));
      } else {
        callback(null);
      }
    });
  },

  // Forces a reload of the user data from Firebase to check for emailVerified status update
  refreshSession: async (): Promise<User | null> => {
    if (auth.currentUser) {
      try {
        await auth.currentUser.reload();
        // Force token refresh to ensure claims/status are propagated
        await auth.currentUser.getIdToken(true);
        return mapUser(auth.currentUser);
      } catch (e) {
        console.error("Error reloading user", e);
        return null;
      }
    }
    return null;
  },

  register: async (name: string, email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(userCredential.user, { displayName: name });
      
      // Send verification email
      await sendEmailVerification(userCredential.user);
      
      // NOTE: We do NOT sign out here anymore. We keep the user logged in 
      // but in an "unverified" state so they can click "I Verified" later.

      return { 
        success: true, 
        message: 'Cuenta creada. Hemos enviado un enlace de verificación a tu correo.',
        user: mapUser(userCredential.user)
      };
    } catch (error: any) {
      let message = 'Error en el registro.';
      if (error.code === 'auth/email-already-in-use') message = 'El correo ya está registrado.';
      if (error.code === 'auth/weak-password') message = 'La contraseña debe tener al menos 6 caracteres.';
      if (error.code === 'auth/invalid-email') message = 'El formato del correo es inválido.';
      
      return { success: false, message };
    }
  },

  login: async (email: string, pass: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      
      // We return success even if unverified, the UI will handle the blocking
      return { success: true, user: mapUser(userCredential.user) };
    } catch (error: any) {
      let message = 'Error al iniciar sesión.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Correo o contraseña incorrectos.';
      }
      if (error.code === 'auth/too-many-requests') {
        message = 'Demasiados intentos. Por favor intenta más tarde.';
      }
      return { success: false, message };
    }
  },

  recoverPassword: async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Se ha enviado un correo para restablecer tu contraseña.' };
    } catch (error: any) {
      let message = 'Error al enviar el correo.';
      if (error.code === 'auth/user-not-found') message = 'No existe una cuenta registrada con este correo.';
      if (error.code === 'auth/invalid-email') message = 'El formato del correo es inválido.';
      return { success: false, message };
    }
  },

  resendVerification: async () => {
    if (auth.currentUser && !auth.currentUser.emailVerified) {
        try {
            await sendEmailVerification(auth.currentUser);
            return { success: true, message: 'Correo reenviado.' };
        } catch (e: any) {
            if (e.code === 'auth/too-many-requests') {
                return { success: false, message: 'Espera unos minutos antes de reenviar.' };
            }
            return { success: false, message: 'Error al reenviar correo.' };
        }
    }
    return { success: false, message: 'No hay sesión activa.' };
  },

  logout: async () => {
    await signOut(auth);
  }
};