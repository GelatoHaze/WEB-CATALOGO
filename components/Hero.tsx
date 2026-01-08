
import React, { useState, useEffect } from 'react';
import { MessageCircle, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { AppConfig } from '../types';

interface HeroProps {
  config: AppConfig;
}

const Hero: React.FC<HeroProps> = ({ config }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = config.headerSlides && config.headerSlides.length > 0 ? config.headerSlides : [
    {
      id: 'default',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop',
      title: 'Innovación y Tecnología Premium',
      subtitle: 'Explora nuestra selección exclusiva de productos de alta gama.',
      ctaText: 'Ver Catálogo',
      ctaLink: '#productos'
    }
  ];

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const handleScrollTo = (e: React.MouseEvent, id: string) => {
    if (id.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(id);
      if (element) {
        const offset = 80; // Altura aproximada de la Navbar
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <section id="inicio" className="relative h-screen md:h-[95vh] bg-slate-950 overflow-hidden group">
      {/* Dynamic Background */}
      {slides.map((slide, index) => (
        <div 
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10"></div>
          <img
            src={slide.image}
            alt={slide.title}
            className={`w-full h-full object-cover filter brightness-50 contrast-125 transition-transform duration-[12000ms] ease-out ${
              index === currentSlide ? 'scale-110 translate-x-4' : 'scale-100 translate-x-0'
            }`}
          />
        </div>
      ))}

      {/* Hero Content */}
      <div className="relative z-20 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-4xl space-y-6 md:space-y-10">
          <div className="flex items-center gap-3 animate-fade-in-up">
            <div className="h-px w-12 bg-blue-500"></div>
            <span className="text-blue-500 font-black text-xs md:text-sm uppercase tracking-[0.5em] flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Innovación Sin Límites
            </span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black text-white leading-[1.1] tracking-tighter drop-shadow-2xl font-heading animate-[fadeInLeft_0.8s_ease-out]">
            {slides[currentSlide].title.split(' ').map((word, i) => (
                <span key={i} className={i % 2 !== 0 ? 'text-blue-500' : ''}>{word} </span>
            ))}
          </h1>
          
          <p className="text-slate-300 text-lg md:text-2xl max-w-xl drop-shadow-lg leading-relaxed font-medium animate-[fadeInLeft_1s_ease-out]">
            {slides[currentSlide].subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 pt-8 animate-[fadeInUp_1.2s_ease-out]">
            <a
              href={slides[currentSlide].ctaLink}
              onClick={(e) => handleScrollTo(e, slides[currentSlide].ctaLink)}
              className="group relative overflow-hidden text-center bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-2xl font-black transition-all shadow-2xl shadow-blue-900/40 uppercase tracking-widest text-sm"
            >
              <span className="relative z-10">{slides[currentSlide].ctaText}</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </a>
            
            <button 
              onClick={(e) => handleScrollTo(e, '#contacto')}
              className="flex items-center justify-center gap-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 hover:border-slate-700 text-white px-12 py-5 rounded-2xl font-black transition-all shadow-2xl uppercase tracking-widest text-sm active:scale-95 group"
            >
              <MessageCircle className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
              Solicitar Cotización
            </button>
          </div>
        </div>
      </div>

      {/* Navigation UI */}
      {slides.length > 1 && (
        <div className="absolute bottom-20 right-4 md:right-12 z-30 flex items-center gap-4">
          <button 
            onClick={prevSlide}
            className="p-4 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 text-white rounded-2xl backdrop-blur-md transition-all hover:-translate-y-1 active:translate-y-0"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="h-px w-12 bg-slate-800"></div>
          <button 
            onClick={nextSlide}
            className="p-4 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 text-white rounded-2xl backdrop-blur-md transition-all hover:-translate-y-1 active:translate-y-0"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Side pagination indicators */}
      <div className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-6">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-1 rounded-full transition-all duration-500 ${
              idx === currentSlide ? 'h-16 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]' : 'h-4 bg-slate-800 hover:bg-slate-600'
            }`}
          ></button>
        ))}
      </div>
    </section>
  );
};

export default Hero;
