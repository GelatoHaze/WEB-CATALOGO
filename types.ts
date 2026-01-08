
import React from 'react';

export interface Variant {
  id: string;
  name: string; // e.g. "Titanium Blue - 256GB"
  attributes: {
    color?: string;
    capacity?: string;
    ram?: string;
    [key: string]: string | undefined;
  };
  price: number;
  stock: number;
  images: string[]; // Array of image URLs specific to this variant
}

export interface Product {
  id: number;
  name: string;
  category: string; 
  price: number; 
  image: string; 
  description: string;
  features?: string[];
  isNew?: boolean;
  isActive: boolean; // Control de visibilidad
  stock: number; 
  variants: Variant[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface HeaderSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

export interface AppConfig {
  whatsappNumber: string;
  instagramUrl: string;
  facebookUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  email: string;
  address: string;
  phoneDisplay: string;
  generalInfo?: string; 
  footerText?: string; 
  headerSlides: HeaderSlide[];
  categories: Category[];
}

export interface User {
  uid: string;
  email: string;
  name?: string;
  isVerified: boolean;
  role: 'admin' | 'client';
}
