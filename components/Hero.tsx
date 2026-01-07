import React, { useState, useEffect } from 'react';
import { MessageCircle, ChevronRight, ChevronLeft } from 'lucide-react';
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
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section id="inicio" className="relative h-[85vh] md:h-[90vh] bg-slate-900 overflow-hidden group">
      {/* Background Image Layer */}
      {slides.map((slide, index) => (
        <div 
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/70 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10"></div>
          <img
            src={slide.image}
            alt={slide.title}
            className={`w-full h-full object-cover filter brightness-75 contrast-125 transition-transform duration-[10000ms] ${
              index === currentSlide ? 'scale-110' : 'scale-100'
            }`}
          />
        </div>
      ))}

      {/* Content Layer */}
      <div className="relative z-20 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-3xl space-y-8 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight drop-shadow-2xl font-heading">
            {slides[currentSlide].title}
          </h1>
          <p className="text-slate-200 text-lg md:text-xl max-w-lg drop-shadow-lg leading-relaxed font-medium">
            {slides[currentSlide].subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <a
              href={slides[currentSlide].ctaLink}
              className="text-center bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-bold transition-all transform hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] active:translate-y-0"
            >
              {slides[currentSlide].ctaText}
            </a>
            <button className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-full font-bold transition-all transform hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] active:translate-y-0">
              <MessageCircle className="w-5 h-5" />
              Solicitar Cotización
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows (Only if multiple slides) */}
      {slides.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition-all hover:scale-110"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition-all hover:scale-110"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Decorative dots */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentSlide ? 'w-8 bg-blue-500 shadow-lg shadow-blue-500/50' : 'w-2 bg-slate-600 hover:bg-slate-400'
            }`}
          ></button>
        ))}
      </div>
    </section>
  );
};

export default Hero;