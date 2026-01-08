
import React, { useState } from 'react';
import { Lock, MessageCircle, Send, ShieldCheck } from 'lucide-react';
import { User, AppConfig } from '../types';

interface ContactProps {
  user: User | null;
  config: AppConfig;
  onLoginReq: () => void;
}

const Contact: React.FC<ContactProps> = ({ user, config, onLoginReq }) => {
  const [message, setMessage] = useState('');
  const isAuth = user && (user.isVerified || user.role === 'admin');

  const handleSendWhatsApp = () => {
    if (!message.trim()) return;
    const encodedMessage = encodeURIComponent(`Hola CBLLS, tengo una consulta:\n\n${message}`);
    const url = `https://wa.me/${config.whatsappNumber}?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  return (
    <section className="py-24 container mx-auto px-4 text-center" id="contacto">
      <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-slate-900 rounded-[3rem] p-8 md:p-20 border border-blue-500/20 relative overflow-hidden shadow-2xl">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto space-y-10">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-white font-heading leading-tight uppercase tracking-tighter">
              ¿Necesitas Asesoría <span className="text-blue-400">Personalizada?</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed font-medium">
              Nuestro equipo está listo para ayudarte. El acceso a consultas directas es exclusivo para nuestra comunidad registrada.
            </p>
          </div>

          <div className="relative group">
            {!isAuth && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-[2px] rounded-[2rem] border border-white/5 transition-all group-hover:bg-slate-950/40">
                <div className="bg-slate-900 p-4 rounded-2xl shadow-2xl border border-white/10 mb-4">
                  <Lock className="w-8 h-8 text-blue-500" />
                </div>
                <button 
                  onClick={onLoginReq}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-900/40 transition-all active:scale-95"
                >
                  Acceso a Clientes
                </button>
              </div>
            )}
            
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isAuth ? "Escribe tu consulta aquí..." : ""}
              disabled={!isAuth}
              className={`w-full h-48 bg-slate-950 border border-white/10 rounded-[2rem] p-8 text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700 font-medium resize-none ${!isAuth ? 'blur-[1px] cursor-not-allowed' : 'shadow-inner'}`}
            />
          </div>

          {isAuth && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button 
                onClick={handleSendWhatsApp}
                disabled={!message.trim()}
                className="flex items-center justify-center gap-3 px-12 py-5 rounded-2xl font-black shadow-xl transition-all active:scale-95 text-[10px] uppercase tracking-[0.3em] bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle className="w-5 h-5" />
                Enviar vía WhatsApp
              </button>
              <button 
                onClick={() => window.location.href = `mailto:${config.email}`}
                className="flex items-center justify-center gap-3 px-12 py-5 rounded-2xl font-black shadow-xl transition-all active:scale-95 text-[10px] uppercase tracking-[0.3em] bg-slate-800 hover:bg-slate-700 text-white border border-slate-600"
              >
                <Send className="w-4 h-4" />
                Consultar por Email
              </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 pt-4">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Conexión Segura y Soporte Directo</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
