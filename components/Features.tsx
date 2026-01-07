import React from 'react';
import { ShieldCheck, Truck, CreditCard, Phone } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: <ShieldCheck className="w-7 h-7" />,
      title: 'Garantía Extendida',
      description: 'Soporte oficial y garantía de fábrica en todos los equipos.',
    },
    {
      icon: <Truck className="w-7 h-7" />,
      title: 'Logística Segura',
      description: 'Envíos asegurados y rastreables a todo el territorio nacional.',
    },
    {
      icon: <CreditCard className="w-7 h-7" />,
      title: 'Pagos Flexibles',
      description: 'Aceptamos diversas tarjetas y planes de financiamiento.',
    },
    {
      icon: <Phone className="w-7 h-7" />,
      title: 'Atención 24/7',
      description: 'Soporte técnico especializado siempre disponible para ti.',
    },
  ];

  return (
    <section className="py-20 bg-slate-900 border-y border-slate-800 relative overflow-hidden">
        {/* Background blobs for flair */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-900/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-8 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-blue-500/30 transition-all hover:bg-slate-800/50 hover:-translate-y-2 duration-300 group"
            >
              <div className="w-16 h-16 bg-slate-700/30 rounded-2xl flex items-center justify-center text-blue-400 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg group-hover:shadow-blue-500/20">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 font-heading">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;