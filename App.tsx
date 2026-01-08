
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Categories from './components/Categories';
import Products from './components/Products';
import Features from './components/Features';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import { Product, AppConfig, User } from './types';
import { StoreService } from './services/store';
import { X, AlertCircle, RefreshCw, Check, LogIn, UserPlus } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  authMode: 'login' | 'register' | 'verification-check';
  setAuthMode: (mode: 'login' | 'register' | 'verification-check') => void;
  formData: any;
  setFormData: (data: any) => void;
  loading: boolean;
  error: string;
  success: string;
  onSubmit: (e: React.FormEvent) => void;
  onCheckVerification: () => void;
  onLogout: () => void;
  user: User | null;
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, onClose, authMode, setAuthMode, formData, setFormData, 
  loading, error, success, onSubmit, onCheckVerification, onLogout, user 
}) => {
  
  useEffect(() => {
    if (isOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/98 animate-in fade-in duration-200" onClick={onClose}></div>
      
      <div className="bg-slate-900 rounded-[2.5rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] w-full max-w-md relative overflow-hidden animate-in zoom-in-95 duration-200 will-change-transform">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors z-20"><X className="w-6 h-6" /></button>
        
        {authMode !== 'verification-check' && (
            <div className="flex border-b border-white/5">
                <button onClick={() => setAuthMode('login')} className={`flex-1 py-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${authMode === 'login' ? 'bg-blue-600/10 text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}>Entrar</button>
                <button onClick={() => setAuthMode('register')} className={`flex-1 py-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${authMode === 'register' ? 'bg-blue-600/10 text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}>Unirse</button>
            </div>
        )}

        <div className="p-10 md:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                {authMode === 'verification-check' ? 'Verificación' : authMode === 'login' ? 'Bienvenido' : 'Nueva Cuenta'}
            </h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                {authMode === 'verification-check' ? 'Confirma tu identidad' : 'Acceso exclusivo CBLLS'}
            </p>
          </div>

          {authMode !== 'verification-check' ? (
            <form onSubmit={onSubmit} className="space-y-4">
                {authMode === 'register' && (
                  <input type="text" placeholder="NOMBRE COMPLETO" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-5 text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-700 text-sm font-bold" required />
                )}
                <input type="email" placeholder="CORREO ELECTRÓNICO" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-5 text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-700 text-sm font-bold" required />
                <input type="password" placeholder="CONTRASEÑA" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-5 text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-700 text-sm font-bold" required />
                
                {error && (
                    <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
                        <AlertCircle className="w-4 h-4" /> {error}
                    </div>
                )}
                {success && (
                    <div className="flex items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                        <Check className="w-4 h-4" /> {success}
                    </div>
                )}

                <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl text-white font-black uppercase text-[10px] tracking-[0.3em] mt-6 transition-all shadow-xl shadow-blue-900/40 active:scale-95 flex items-center justify-center gap-3">
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : (authMode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />)}
                    {loading ? 'Procesando...' : (authMode === 'login' ? 'Acceder ahora' : 'Crear mi cuenta')}
                </button>
            </form>
          ) : (
            <div className="text-center space-y-8">
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                    Hemos enviado un enlace a <br/><span className="text-white font-black">{user?.email}</span>. <br/>Revisa tu correo para continuar.
                </p>
                <button onClick={onCheckVerification} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 py-5 rounded-2xl text-white font-black uppercase text-[10px] tracking-[0.3em] transition-all flex items-center justify-center gap-3">
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Confirmar Verificación
                </button>
                <button onClick={onLogout} className="text-slate-500 hover:text-white text-[10px] uppercase font-black tracking-[0.3em] transition-colors">Cerrar Sesión</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isAdminView, setIsAdminView] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<AppConfig>(StoreService.getConfig());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'verification-check'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');

  // 1. Suscripciones a Datos (Una sola vez al montar)
  useEffect(() => {
    const unsubProducts = StoreService.subscribeToProducts((updatedProducts) => {
      setProducts(updatedProducts);
      setLoading(false);
    });

    const unsubConfig = StoreService.subscribeToConfig((updatedConfig) => {
      setConfig(updatedConfig);
    });

    const unsubAuth = StoreService.subscribeToAuth((u) => {
        setUser(u);
    });

    return () => {
      unsubProducts();
      unsubConfig();
      unsubAuth();
    };
  }, []);

  // 2. Efecto para manejar el cierre automático del modal tras verificación
  useEffect(() => {
    if (user && (user.isVerified || user.role === 'admin') && authMode === 'verification-check') {
        setAuthModalOpen(false);
        setFormData({ name: '', email: '', password: '' });
        setAuthMode('login'); // Resetear para la próxima
    }
  }, [user, authMode]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(''); setAuthLoading(true);
    if (authMode === 'login') {
      const res = await StoreService.login(formData.email, formData.password);
      if (res.success && res.user) {
        // El useEffect de arriba cerrará el modal si está verificado
        if (!res.user.isVerified && res.user.role !== 'admin') {
            setAuthMode('verification-check');
        }
      } else {
        setLoginError(res.message || 'Error de acceso');
      }
    } else {
      const res = await StoreService.register(formData.name, formData.email, formData.password);
      if (res.success) {
        setAuthMode('verification-check');
      } else {
        setLoginError(res.message || 'Error en registro');
      }
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await StoreService.logout();
    setIsAdminView(false); 
    setAuthModalOpen(false);
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const isVisible = p.isActive || (user?.role === 'admin');
    return matchesCategory && isVisible;
  });

  const handleOpenAuth = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-600/30">
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => {
            setAuthModalOpen(false);
            setLoginError('');
            setLoginSuccess('');
        }}
        authMode={authMode} setAuthMode={setAuthMode}
        formData={formData} setFormData={setFormData}
        loading={authLoading} error={loginError} success={loginSuccess}
        onSubmit={handleAuthSubmit} 
        onCheckVerification={async () => {
            setAuthLoading(true);
            const u = await StoreService.refreshSession();
            if (u?.isVerified) { 
                // La actualización del usuario disparará el useEffect para cerrar
            } else {
                setLoginError('Verificación aún no detectada');
            }
            setAuthLoading(false);
        }} 
        onLogout={handleLogout} 
        user={user}
      />
      
      <Navbar 
        config={config} user={user} 
        onNavigate={handleOpenAuth} 
        onLogout={handleLogout} 
        onToggleAdmin={() => setIsAdminView(!isAdminView)} 
        isAdminView={isAdminView}
      />
      
      {isAdminView ? (
        <div className="pt-32 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <AdminPanel onLogout={handleLogout} onDataChange={() => {}} />
        </div>
      ) : (
        <>
          <Hero config={config} />
          <main className="relative z-10">
            <Categories selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} categories={config.categories} />
            <section id="productos" className="py-24 bg-slate-900/20 border-y border-white/5">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
                   <div className="text-center md:text-left">
                     <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-3">Catálogo</h3>
                     <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em]">Hardware de Vanguardia</p>
                   </div>
                   <div className="bg-slate-950/80 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-sm">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{filteredProducts.length} Productos Disponibles</span>
                   </div>
                </div>
                <Products 
                    products={filteredProducts} 
                    isLoading={loading} 
                    config={config} 
                    user={user} 
                    onLoginReq={handleOpenAuth} 
                />
              </div>
            </section>
            <Features />
            <Contact 
              user={user} 
              config={config} 
              onLoginReq={handleOpenAuth} 
            />
          </main>
          <Footer config={config} />
        </>
      )}
    </div>
  );
};

export default App;
