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
  category: string; // This stores the category ID
  price: number; // Kept for internal logic/sorting but hidden from UI
  image: string; // Main display image
  description: string;
  features?: string[]; // New: List of main highlights/specs
  isNew?: boolean;
  stock: number; // Total stock (sum of variants) or fallback
  variants: Variant[]; // List of variants
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Changed from React.ReactNode to string for JSON storage (e.g., 'smartphone', 'tv')
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
  generalInfo?: string; // Editable general text
  footerText?: string; // New: Editable copyright/year text
  headerSlides: HeaderSlide[];
  categories: Category[]; // Dynamic categories list
}

export interface User {
  uid: string;
  email: string;
  name?: string;
  isVerified: boolean;
  role: 'admin' | 'client';
}