
import React from 'react';
import { MapPin, Phone, MessageCircle, Instagram, Facebook, Linkedin, Twitter } from 'lucide-react';
import { AppConfig } from '../types';

interface FooterProps {
  config: AppConfig;
}

const Footer: React.FC<FooterProps> = ({ config }) => {
  return (
    <footer className="bg-slate-950 pt-24 pb-12 border-t border-slate-900 text-slate-400">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand Column - Parte inferior izquierda del layout principal */}
          <div className="space-y-8">
            <div className="relative group inline-block">
              <div className="absolute inset-0 bg-blue-500/10 rounded-xl blur-xl transition-all duration-500 group-hover:bg-blue-500/20"></div>
              <img 
                src="logo.png" 
                alt="CBLLS Brand Logo" 
                className="relative h-16 md:h-20 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs italic">
              {config.generalInfo || 'Tecnología y electrodomésticos de alta gama. Calidad premium y garantía asegurada en cada compra.'}
            </p>
            <div className="flex gap-4">
                <a href={config.instagramUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all duration-300"><Instagram className="w-5 h-5" /></a>
                <a href={config.facebookUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all duration-300"><Facebook className="w-5 h-5" /></a>
                <a href={config.linkedinUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all duration-300"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="text-white font-black mb-8 text-xs uppercase tracking-[0.3em]">Navegación</h4>
            <ul className="space-y-5 text-sm font-medium">
                <li><a href="#inicio" className="hover:text-blue-400 transition-colors">Inicio</a></li>
                <li><a href="#productos" className="hover:text-blue-400 transition-colors">Catálogo Completo</a></li>
                <li><a href="#categorias" className="hover:text-blue-400 transition-colors">Categorías</a></li>
                <li><a href="#contacto" className="hover:text-blue-400 transition-colors">Contacto Directo</a></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-white font-black mb-8 text-xs uppercase tracking-[0.3em]">Asistencia</h4>
            <ul className="space-y-5 text-sm font-medium">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Términos de Servicio</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Políticas de Garantía</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Métodos de Envío</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Preguntas Frecuentes</a></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-white font-black mb-8 text-xs uppercase tracking-[0.3em]">Ubicación</h4>
            <ul className="space-y-6 text-sm">
              <li className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                <span className="leading-relaxed">{config.address}</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-emerald-500 shrink-0" />
                <a href={`https://wa.me/${config.whatsappNumber}`} target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors font-bold">
                  {config.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-4">
                <MessageCircle className="w-5 h-5 text-blue-500 shrink-0" />
                <a href={`mailto:${config.email}`} className="hover:text-blue-400 transition-colors font-bold">{config.email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-600">
          <p>{config.footerText || '© 2026 CBLLS. Innovación Premium.'}</p>
          <div className="flex gap-8">
            <span className="hover:text-slate-400 cursor-pointer transition-colors">Seguridad</span>
            <span className="hover:text-slate-400 cursor-pointer transition-colors">Privacidad</span>
            <span className="hover:text-slate-400 cursor-pointer transition-colors">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
