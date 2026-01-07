import React, { useState, useEffect } from 'react';
import { Instagram, Facebook, LogIn, Menu, X, User as UserIcon, CircuitBoard } from 'lucide-react';
import { AppConfig, User } from '../types';

interface NavbarProps {
  config: AppConfig;
  user: User | null;
  onNavigate: () => void; // Now just triggers the auth modal
}

const Navbar: React.FC<NavbarProps> = ({ config, user, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTo = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: 'Inicio', href: '#inicio' },
    { name: 'Productos', href: '#productos' },
    { name: 'Categorías', href: '#categorias' },
    { name: 'Contacto', href: '#contacto' },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 py-4 ${
        isScrolled ? 'bg-slate-950/90 backdrop-blur-md shadow-lg border-b border-slate-800' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo Area */}
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => handleScrollTo('#inicio')}>
            <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
              <div className="absolute inset-0 bg-blue-500 rounded-xl blur opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
              <div className="relative w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 shadow-xl group-hover:scale-105 transition-transform duration-300 ring-1 ring-white/10 group-hover:ring-blue-500/50 flex items-center justify-center">
                <CircuitBoard className="w-7 h-7 text-blue-400 group-hover:text-white transition-colors" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-slate-400 tracking-wider uppercase drop-shadow-sm font-heading group-hover:from-blue-400 group-hover:to-white transition-all duration-300">
                CBLLS
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="text-slate-300 hover:text-blue-400 font-medium transition-colors text-sm uppercase tracking-wide hover:shadow-[0_2px_10px_rgba(59,130,246,0.2)]"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-3 border-r border-slate-700 pr-4 mr-1">
              <a href={config.instagramUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-pink-500 transition-colors transform hover:scale-110">
                <Instagram className="w-5 h-5" />
              </a>
              <a href={config.facebookUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-500 transition-colors transform hover:scale-110">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
            <button 
              onClick={onNavigate}
              className={`flex items-center gap-2 text-white transition-all text-sm font-bold px-4 py-2 rounded-full shadow-lg active:scale-95 ${
                user ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
              }`}
            >
              {user ? <UserIcon className="w-4 h-4" /> : <LogIn className="w-4 h-4" />} 
              {user ? (user.email === 'admin@cblls.com' ? 'Admin' : 'Mi Cuenta') : 'Acceso'}
            </button>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden text-slate-300 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
          <div className="bg-slate-900/95 rounded-xl p-4 border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.href}
                  className="text-slate-300 hover:text-blue-400 font-medium transition-colors text-sm uppercase tracking-wide px-2 py-1 rounded hover:bg-slate-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-700 flex flex-col gap-4">
              <div className="flex items-center gap-4 justify-center">
                <a href={config.instagramUrl} className="text-slate-400 hover:text-pink-500"><Instagram className="w-6 h-6" /></a>
                <a href={config.facebookUrl} className="text-slate-400 hover:text-blue-500"><Facebook className="w-6 h-6" /></a>
              </div>
              <button 
                onClick={() => { onNavigate(); setIsMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 text-white bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold"
              >
                {user ? <UserIcon className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                {user ? (user.email === 'admin@cblls.com' ? 'Ir al Panel' : 'Mi Cuenta') : 'Iniciar Sesión'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;