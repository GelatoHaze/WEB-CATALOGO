import React, { useState, useEffect } from 'react';
import { Instagram, LogIn, Menu, X, LogOut, ShieldCheck, LayoutDashboard, Cpu } from 'lucide-react';
import { AppConfig, User } from '../types';

interface NavbarProps {
  config: AppConfig;
  user: User | null;
  onNavigate: () => void;
  onLogout: () => void;
  onToggleAdmin: () => void;
  isAdminView: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ config, user, onNavigate, onLogout, onToggleAdmin, isAdminView }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menú móvil al cambiar a vista admin o redimensionar
  useEffect(() => {
    setIsMenuOpen(false);
    // Prevent scrolling when menu is open
    if (isMenuOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
  }, [isAdminView, isMenuOpen]);

  const handleScrollTo = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const isAdmin = user?.role === 'admin';

  const Logo = () => (
    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => isAdminView ? onToggleAdmin() : handleScrollTo('#inicio')}>
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500/30 rounded-lg blur-lg group-hover:bg-blue-500/50 transition-all"></div>
        <div className="relative bg-gradient-to-br from-blue-600 to-blue-400 p-2 rounded-xl shadow-lg shadow-blue-900/40">
          <Cpu className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-black text-white tracking-tighter leading-none">CBLLS</span>
        <span className="text-[8px] font-black text-blue-500 uppercase tracking-[0.3em] leading-none mt-1">Tech Premium</span>
      </div>
    </div>
  );

  return (
    <nav className={`fixed w-full z-[200] transition-all duration-300 py-4 ${isScrolled || isAdminView || isMenuOpen ? 'bg-slate-950 border-b border-white/10 shadow-2xl' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Logo />

          <div className="hidden lg:flex items-center gap-10">
            {!isAdminView && (
              <div className="flex items-center gap-8">
                {['Inicio', 'Categorías', 'Productos', 'Contacto'].map(link => (
                  <button key={link} onClick={() => handleScrollTo(`#${link.toLowerCase().replace('í', 'i')}`)} className="text-[10px] font-black text-slate-400 hover:text-blue-400 uppercase tracking-[0.2em] transition-colors">
                    {link}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-6">
              {isAdmin && (
                <button 
                  onClick={onToggleAdmin} 
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${isAdminView ? 'bg-slate-800 text-white border border-slate-700' : 'bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600 hover:text-white'}`}
                >
                  {isAdminView ? <LayoutDashboard className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  {isAdminView ? 'Vista Web' : 'Modo Admin'}
                </button>
              )}

              {user ? (
                <div className="flex items-center gap-5 pl-6 border-l border-white/10">
                   <div className="text-right">
                      <p className="text-[11px] font-black text-white leading-none tracking-tight">{user.name}</p>
                      <p className="text-[8px] text-blue-500 uppercase font-black tracking-widest mt-1">{user.role}</p>
                   </div>
                   <button onClick={onLogout} className="p-2 bg-slate-900 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><LogOut className="w-4 h-4" /></button>
                </div>
              ) : (
                <button onClick={onNavigate} className="bg-white text-slate-950 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all shadow-xl active:scale-95">
                  Ingresar
                </button>
              )}
            </div>
          </div>

          <button className="lg:hidden p-2 text-white relative z-[210]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - CHANGE: h-[100dvh] ensures it covers the mobile browser bar area */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-0 h-[100dvh] bg-slate-950 z-[190] pt-24 pb-8 px-8 flex flex-col gap-8 animate-in fade-in slide-in-from-top-4 duration-300">
          {!isAdminView && ['Inicio', 'Categorías', 'Productos', 'Contacto'].map(link => (
            <button key={link} onClick={() => handleScrollTo(`#${link.toLowerCase().replace('í', 'i')}`)} className="text-2xl font-black text-white text-left uppercase tracking-tighter">{link}</button>
          ))}
          {isAdmin && (
            <button onClick={() => { onToggleAdmin(); setIsMenuOpen(false); }} className="text-2xl font-black text-blue-500 text-left uppercase tracking-tighter border-t border-white/5 pt-8">
              {isAdminView ? 'Regresar a la Web' : 'Panel de Gestión'}
            </button>
          )}
          <div className="mt-auto space-y-4 pb-safe">
            {user ? (
              <button onClick={onLogout} className="w-full py-5 bg-red-500/10 text-red-500 rounded-2xl font-black uppercase text-xs tracking-widest">Cerrar Sesión</button>
            ) : (
              <button onClick={() => { onNavigate(); setIsMenuOpen(false); }} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest">Iniciar Sesión</button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;