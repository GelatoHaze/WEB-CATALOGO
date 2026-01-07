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
import { LogIn, UserPlus, Mail, Lock, User as UserIcon, X, AlertCircle, RefreshCw, Check, ArrowLeft, KeyRound } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'admin'
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<AppConfig>(StoreService.getConfig());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // Auth State
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'verification-check' | 'forgot-password'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');

  // Initial Load & Auth Subscription
  useEffect(() => {
    loadData();
    // Subscribe to Firebase Auth State
    const unsubscribe = StoreService.subscribeToAuth((currentUser) => {
        setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const loadData = () => {
    setLoading(true);
    const loadedProducts = StoreService.getProducts();
    const loadedConfig = StoreService.getConfig();
    setProducts(loadedProducts);
    setConfig(loadedConfig);
    setTimeout(() => setLoading(false), 300);
  };

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === selectedCategory));
    }
  }, [selectedCategory, products]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');
    setAuthLoading(true);

    if (authMode === 'login') {
      const result = await StoreService.login(formData.email, formData.password);
      
      if (result.success && result.user) {
        setUser(result.user);
        
        if (result.user.isVerified) {
            if (result.user.role === 'admin') {
                setCurrentView('admin');
            }
            setAuthModalOpen(false);
            setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        } else {
            // User logged in but not verified
            setAuthMode('verification-check');
        }
      } else {
        setLoginError(result.message || 'Error al iniciar sesión.');
      }

    } else if (authMode === 'register') {
      if (formData.password !== formData.confirmPassword) {
        setLoginError('Las contraseñas no coinciden.');
        setAuthLoading(false);
        return;
      }
      
      if (formData.password.length < 6) {
        setLoginError('La contraseña debe tener al menos 6 caracteres.');
        setAuthLoading(false);
        return;
      }

      const result = await StoreService.register(formData.name, formData.email, formData.password);
      
      if (result.success && result.user) {
          setUser(result.user);
          setAuthMode('verification-check');
          setLoginSuccess(result.message || 'Verifica tu correo.');
      } else {
          setLoginError(result.message || 'Error en el registro.');
      }
    } else if (authMode === 'forgot-password') {
        if (!formData.email) {
            setLoginError('Por favor ingresa tu correo.');
            setAuthLoading(false);
            return;
        }
        const result = await StoreService.recoverPassword(formData.email);
        if (result.success) {
            setLoginSuccess(result.message);
            // Optionally clear form or redirect to login after a delay, 
            // but showing success message here is good UX.
        } else {
            setLoginError(result.message || 'Error al enviar correo de recuperación.');
        }
    }
    setAuthLoading(false);
  };

  const handleCheckVerification = async () => {
      setAuthLoading(true);
      setLoginError('');
      const updatedUser = await StoreService.refreshSession();
      if (updatedUser) {
          setUser(updatedUser);
          if (updatedUser.isVerified) {
              setAuthModalOpen(false);
              setFormData({ name: '', email: '', password: '', confirmPassword: '' });
              setAuthMode('login'); // Reset for next time
              alert('¡Verificación exitosa! Acceso concedido.');
          } else {
              setLoginError('Aún no detectamos la verificación. Si ya hiciste clic en el enlace, espera unos segundos e intenta nuevamente.');
          }
      }
      setAuthLoading(false);
  };

  const handleResendEmail = async () => {
      setAuthLoading(true);
      const res = await StoreService.resendVerification();
      if (res.success) {
          setLoginSuccess(res.message);
      } else {
          setLoginError(res.message);
      }
      setAuthLoading(false);
  };

  const handleLogout = async () => {
    await StoreService.logout();
    setUser(null);
    setCurrentView('home');
    setAuthModalOpen(false);
  };

  const openLogin = () => {
    if (user) {
        if (user.role === 'admin' && user.isVerified) {
            setCurrentView('admin');
        } else if (!user.isVerified) {
            setAuthMode('verification-check');
            setAuthModalOpen(true);
        } else {
            alert(`Hola ${user.name || 'Usuario'}, ya has iniciado sesión y estás verificado.`);
        }
    } else {
        setAuthMode('login');
        setAuthModalOpen(true);
    }
  };

  const AuthModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-md relative overflow-hidden animate-fade-in-up">
        <button 
            onClick={() => setAuthModalOpen(false)}
            className="absolute top-4 right-4 text-slate-500 hover:text-white z-20"
        >
            <X className="w-6 h-6" />
        </button>

        {/* Header / Tabs */}
        {authMode !== 'verification-check' && authMode !== 'forgot-password' && (
            <div className="flex text-center border-b border-slate-800">
            <button 
                onClick={() => { setAuthMode('login'); setLoginError(''); setLoginSuccess(''); }}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${authMode === 'login' ? 'bg-slate-800/50 text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'}`}
            >
                Iniciar Sesión
            </button>
            <button 
                onClick={() => { setAuthMode('register'); setLoginError(''); setLoginSuccess(''); }}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${authMode === 'register' ? 'bg-slate-800/50 text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'}`}
            >
                Registrarse
            </button>
            </div>
        )}

        <div className="p-8">
          <div className="text-center mb-8">
            {authMode === 'verification-check' ? (
                <>
                    <div className="w-16 h-16 bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-400 animate-pulse">
                        <Mail className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Verifica tu Correo</h2>
                    <p className="text-slate-400 text-sm mb-4">
                        Hemos enviado un enlace a <strong>{user?.email || formData.email}</strong>.
                    </p>
                    <p className="text-slate-500 text-xs bg-slate-800/50 p-3 rounded-lg border border-slate-800">
                        Por favor revisa tu bandeja de entrada (y spam). Haz clic en el enlace y luego presiona el botón de abajo.
                    </p>
                </>
            ) : authMode === 'forgot-password' ? (
                <>
                    <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-400">
                        <KeyRound className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Recuperar Contraseña</h2>
                    <p className="text-slate-400 text-xs">
                        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                    </p>
                </>
            ) : (
                <>
                    <h2 className="text-2xl font-bold text-white mb-2">
                    {authMode === 'login' ? 'Bienvenido de nuevo' : 'Crear una cuenta'}
                    </h2>
                    <p className="text-slate-400 text-xs">
                    {authMode === 'login' ? 'Ingresa para consultar precios.' : 'Únete para ofertas exclusivas.'}
                    </p>
                </>
            )}
          </div>

          {authMode !== 'verification-check' ? (
            <form onSubmit={handleAuthSubmit} className="space-y-4">
                
                {authMode === 'register' && (
                <div className="relative group">
                    <UserIcon className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors placeholder:text-slate-600"
                    placeholder="Nombre Completo"
                    required
                    />
                </div>
                )}

                <div className="relative group">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors placeholder:text-slate-600"
                    placeholder="Correo Electrónico"
                    required
                />
                </div>

                {authMode !== 'forgot-password' && (
                    <div className="relative group">
                        <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                        <input 
                            type="password" 
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors placeholder:text-slate-600"
                            placeholder="Contraseña"
                            required
                        />
                    </div>
                )}

                {authMode === 'login' && (
                    <div className="flex justify-end">
                        <button 
                            type="button"
                            onClick={() => { setAuthMode('forgot-password'); setLoginError(''); setLoginSuccess(''); }}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>
                )}

                {authMode === 'register' && (
                <div className="relative group">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                    type="password" 
                    value={formData.confirmPassword}
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors placeholder:text-slate-600"
                    placeholder="Confirmar Contraseña"
                    required
                    />
                </div>
                )}

                {loginError && (
                <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-xs text-center flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {loginError}
                </div>
                )}

                {loginSuccess && (
                <div className="p-3 bg-green-900/20 border border-green-900/50 rounded-lg text-green-400 text-xs text-center flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> {loginSuccess}
                </div>
                )}

                <button 
                    type="submit" 
                    disabled={authLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-900/20 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                >
                {authLoading ? 'Procesando...' : (
                    <>
                    {authMode === 'login' ? <LogIn className="w-4 h-4" /> : 
                     authMode === 'forgot-password' ? <Mail className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    {authMode === 'login' ? 'Ingresar' : 
                     authMode === 'forgot-password' ? 'Enviar Correo' : 'Registrarse'}
                    </>
                )}
                </button>

                {authMode === 'forgot-password' && (
                    <button 
                        type="button"
                        onClick={() => { setAuthMode('login'); setLoginError(''); setLoginSuccess(''); }}
                        className="w-full text-slate-500 hover:text-white text-sm py-2 transition-colors flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
                    </button>
                )}
            </form>
          ) : (
            <div className="space-y-4">
                {loginError && (
                    <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-xs text-center">
                        {loginError}
                    </div>
                )}
                {loginSuccess && (
                    <div className="p-3 bg-green-900/20 border border-green-900/50 rounded-lg text-green-400 text-xs text-center">
                        {loginSuccess}
                    </div>
                )}

                <button 
                    onClick={handleCheckVerification}
                    disabled={authLoading}
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/20 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                >
                    {authLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                    {authLoading ? 'Verificando...' : 'Ya verifiqué mi correo'}
                </button>

                <div className="flex justify-between pt-2">
                    <button 
                        onClick={handleResendEmail}
                        disabled={authLoading}
                        className="text-xs text-blue-400 hover:text-blue-300 underline disabled:opacity-50"
                    >
                        Reenviar correo
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="text-xs text-slate-500 hover:text-slate-300"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500 selection:text-white">
      {isAuthModalOpen && <AuthModal />}
      
      {currentView === 'admin' && user?.role === 'admin' ? (
        <AdminPanel onLogout={handleLogout} onDataChange={loadData} />
      ) : (
        <>
          <Navbar config={config} user={user} onNavigate={openLogin} />
          <Hero config={config} />
          <main>
            <Categories 
                selectedCategory={selectedCategory} 
                onSelectCategory={setSelectedCategory} 
                categories={config.categories}
            />
            
            <section id="productos" className="py-12 bg-slate-900/50 min-h-[500px]">
              <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-white">Catálogo de Productos</h3>
                  <span className="text-slate-400 text-sm">{filteredProducts.length} resultados</span>
                </div>
                <Products 
                    products={filteredProducts} 
                    isLoading={loading} 
                    config={config} 
                    user={user}
                    onLoginReq={() => {
                        if (user && !user.isVerified) {
                            setAuthMode('verification-check');
                        } else {
                            setAuthMode('login');
                        }
                        setAuthModalOpen(true);
                    }}
                />
              </div>
            </section>

            <Features />
            <Contact />
          </main>
          <Footer config={config} />
        </>
      )}
    </div>
  );
};

export default App;