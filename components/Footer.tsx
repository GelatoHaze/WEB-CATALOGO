import React from 'react';
import { MapPin, Phone, MessageCircle, Instagram, Facebook, Linkedin, Twitter, CircuitBoard } from 'lucide-react';
import { AppConfig } from '../types';

interface FooterProps {
  config: AppConfig;
}

const Footer: React.FC<FooterProps> = ({ config }) => {
  return (
    <footer className="bg-slate-950 pt-20 pb-10 border-t border-slate-800 text-slate-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-700 shadow-lg flex items-center justify-center bg-slate-900 bg-gradient-to-br from-slate-800 to-slate-950">
                 <CircuitBoard className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-2xl font-black text-white tracking-wide uppercase font-heading">CBLLS</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">
              {config.generalInfo || 'Catálogo digital líder en productos tecnológicos y electrodomésticos de alta gama. Calidad premium y garantía asegurada en cada compra.'}
            </p>
            <div className="flex gap-4">
                <a href={config.instagramUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
                <a href={config.facebookUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
                <a href={config.linkedinUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
                <a href={config.twitterUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg font-heading">Navegación</h4>
            <ul className="space-y-4 text-sm">
                <li><a href="#inicio" className="hover:text-blue-400 transition-colors">Inicio</a></li>
                <li><a href="#productos" className="hover:text-blue-400 transition-colors">Productos Destacados</a></li>
                <li><a href="#categorias" className="hover:text-blue-400 transition-colors">Categorías</a></li>
                <li><a href="#contacto" className="hover:text-blue-400 transition-colors">Contacto</a></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg font-heading">Legal</h4>
            <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Términos y Condiciones</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Política de Privacidad</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Garantía de Productos</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Preguntas Frecuentes</a></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg font-heading">Contáctanos</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                <span>{config.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-green-500 shrink-0" />
                <a href={`https://wa.me/${config.whatsappNumber}`} target="_blank" rel="noreferrer" className="hover:text-green-400 transition-colors">
                  {config.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-blue-500 shrink-0" />
                <a href={`mailto:${config.email}`} className="hover:text-blue-400 transition-colors">{config.email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>{config.footerText || '© 2026 CBLLS. Todos los derechos reservados.'}</p>
          <div className="flex gap-6">
            <span>Privacidad</span>
            <span>Cookies</span>
            <span>Accesibilidad</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;