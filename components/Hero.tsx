
import React, { useState, useEffect } from 'react';
import { MessageCircle, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { AppConfig } from '../types';

interface HeroProps {
  config: AppConfig;
}

const Hero: React.FC<HeroProps> = ({ config }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Protección robusta: Si no hay slides en la config, usa un default para evitar crash
  const defaultSlide = {
      id: 'default',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop',
      title: 'Innovación y Tecnología Premium',
      subtitle: 'Explora nuestra selección exclusiva de productos de alta gama.',
      ctaText: 'Ver Catálogo',
      ctaLink: '#productos'
  };

  const slides = (config && config.headerSlides && config.headerSlides.length > 0) 
    ? config.headerSlides 
    : [defaultSlide];

  // 1. Preload Logic: Calentar la caché del navegador para evitar flash en el primer cambio
  useEffect(() => {
    slides.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
      // No necesitamos lógica de estado aquí, solo forzar la descarga en caché
    });
  }, [slides]);

  // Lógica del Intervalo
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000); // Aumentado a 6s para dar más tiempo a la lectura y disfrute de la imagen
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

  // Safe access to current slide for text content
  const activeSlide = slides[currentSlide] || defaultSlide;

  return (
    // CHANGE: h-screen -> h-[100dvh] para soporte móvil robusto
    <section id="inicio" className="relative h-[100dvh] md:h-[95vh] bg-slate-950 overflow-hidden group">
      
      {/* 
        OPTIMIZACIÓN CRÍTICA: 
        Los gradientes ahora están FUERA del bucle .map de las imágenes.
        Esto evita que el gradiente parpadee (fades out) cuando cambia la imagen,
        manteniendo la legibilidad del texto y la atmósfera constante.
        Z-Index: 20 (encima de las imágenes, debajo del texto)
      */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/50 to-transparent z-20 pointer-events-none select-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-20 pointer-events-none select-none"></div>

      {/* Image Slider Stack */}
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div 
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out will-change-opacity ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            aria-hidden={!isActive}
          >
            <img
              src={slide.image}
              alt={slide.title}
              // Optimizaciones de carga
              loading={index === 0 ? "eager" : undefined}
              decoding="async"
              // Animación "Ken Burns" suave
              className={`w-full h-full object-cover object-center transform-gpu will-change-transform transition-transform duration-[12000ms] ease-out ${
                isActive ? 'scale-110 translate-x-0' : 'scale-100 translate-x-0'
              }`}
              style={{ 
                // Evita layout shift forzando el renderizado correcto
                objectPosition: 'center'
              }}
            />
          </div>
        );
      })}

      {/* Hero Content (Z-30 para estar encima de gradientes e imágenes) */}
      <div className="relative z-30 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-4xl space-y-6 md:space-y-10">
          <div className="flex items-center gap-3 animate-fade-in-up">
            <div className="h-px w-8 md:w-12 bg-blue-500"></div>
            <span className="text-blue-500 font-black text-[10px] md:text-sm uppercase tracking-[0.5em] flex items-center gap-2">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4" /> Innovación Sin Límites
            </span>
          </div>
          
          {/* 
             Key trick: Usamos key={activeSlide.id} SOLO en el contenedor de texto.
             Esto permite que el texto se anime (entre) cada vez que cambia el slide,
             sin forzar el desmontaje del componente padre (Hero).
          */}
          <div key={activeSlide.id} className="space-y-4 md:space-y-10">
              <h1 className="text-4xl sm:text-5xl md:text-8xl font-black text-white leading-[1.1] tracking-tighter drop-shadow-2xl font-heading animate-[fadeInLeft_0.8s_ease-out]">
                {activeSlide.title.split(' ').map((word, i) => (
                    <span key={i} className={i % 2 !== 0 ? 'text-blue-500' : ''}>{word} </span>
                ))}
              </h1>
              
              <p className="text-slate-300 text-base md:text-2xl max-w-xl drop-shadow-lg leading-relaxed font-medium animate-[fadeInLeft_1s_ease-out]">
                {activeSlide.subtitle}
              </p>
          </div>
          
          {/* Botones estáticos (no dependen del slide.id para evitar parpadeo de UI) */}
          <div className="flex flex-col sm:flex-row gap-4 md:gap-5 pt-6 md:pt-8 animate-[fadeInUp_1.2s_ease-out]">
            <a
              href={activeSlide.ctaLink}
              onClick={(e) => handleScrollTo(e, activeSlide.ctaLink)}
              className="group relative overflow-hidden text-center bg-blue-600 hover:bg-blue-500 text-white px-8 md:px-12 py-4 md:py-5 rounded-2xl font-black transition-all shadow-2xl shadow-blue-900/40 uppercase tracking-widest text-xs md:text-sm"
            >
              <span className="relative z-10">{activeSlide.ctaText}</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </a>
            
            <button 
              onClick={(e) => handleScrollTo(e, '#contacto')}
              className="flex items-center justify-center gap-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 hover:border-slate-700 text-white px-8 md:px-12 py-4 md:py-5 rounded-2xl font-black transition-all shadow-2xl uppercase tracking-widest text-xs md:text-sm active:scale-95 group"
            >
              <MessageCircle className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
              Solicitar Cotización
            </button>
          </div>
        </div>
      </div>

      {/* Navigation UI */}
      {slides.length > 1 && (
        <div className="absolute bottom-10 md:bottom-20 right-4 md:right-12 z-30 flex items-center gap-4">
          <button 
            onClick={prevSlide}
            className="p-3 md:p-4 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 text-white rounded-2xl backdrop-blur-md transition-all hover:-translate-y-1 active:translate-y-0 group"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:text-blue-400" />
          </button>
          <div className="h-px w-8 md:w-12 bg-slate-800"></div>
          <button 
            onClick={nextSlide}
            className="p-3 md:p-4 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 text-white rounded-2xl backdrop-blur-md transition-all hover:-translate-y-1 active:translate-y-0 group"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:text-blue-400" />
          </button>
        </div>
      )}

      {/* Side pagination indicators */}
      <div className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-4 md:gap-6">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Ir al slide ${idx + 1}`}
            className={`w-1 rounded-full transition-all duration-500 ${
              idx === currentSlide ? 'h-10 md:h-16 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]' : 'h-3 md:h-4 bg-slate-800 hover:bg-slate-600'
            }`}
          ></button>
        ))}
      </div>
    </section>
  );
};

export default Hero;
