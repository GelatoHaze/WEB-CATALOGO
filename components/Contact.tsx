import React from 'react';
import { Lock } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <section className="py-24 container mx-auto px-4 text-center" id="contacto">
      <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-slate-900 rounded-[2rem] p-8 md:p-20 border border-blue-500/20 relative overflow-hidden shadow-2xl">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-5xl font-black text-white font-heading leading-tight">
            ¿Necesitas Asesoría <span className="text-blue-400">Personalizada?</span>
          </h2>
          <p className="text-slate-300 text-lg md:text-xl leading-relaxed">
            Nuestro equipo de expertos está listo para ayudarte a encontrar el producto perfecto para tus necesidades técnicas y comerciales. Garantizamos respuesta en menos de 2 horas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button className="flex items-center justify-center gap-3 px-10 py-4 rounded-full font-bold shadow-lg transition-all transform hover:scale-105 text-lg bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30 hover:shadow-amber-600/40">
              <Lock className="w-5 h-5" />
              Acceso a Clientes
            </button>
            <button className="flex items-center justify-center gap-3 px-10 py-4 rounded-full font-bold shadow-lg transition-all transform hover:scale-105 text-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-600">
              Contactar Soporte
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;