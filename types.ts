// Fix: Use Timestamp from v8 compatibility packages for consistency.
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

export interface Talent {
  id: string;
  nama: string;
}

export interface Store {
  id: string;
  nama: string;
}

export interface Akun {
  id: string;
  nama: string;
}

export interface Product {
  id: string;
  nama: string;
  storeId: string;
  link?: string;
}

export interface ProductWithDetails extends Product {
  storeName: string;
}

export interface Sale {
  id: string;
  talentId: string;
  akunId: string;
  // Fix: Use namespaced Timestamp type from v8 compat library.
  saleDate: firebase.firestore.Timestamp;
  totalValue: number; // GMV
  estimatedCommission: number;
  productViews: number;
  productClicks: number;
}

export interface SaleWithDetails extends Sale {
  talentName: string;
  akunName: string;
}

export interface ProductPost {
  id: string;
  productId: string;
  storeId: string;
  videoUrl: string;
  date: firebase.firestore.Timestamp;
  akunId: string;
  talentId: string;
}

export interface ProductPostWithDetails extends ProductPost {
  productName: string;
  storeName: string;
  akunName: string;
  talentName: string;
}

// Fix: Add missing types for JumlahKonten feature.
export interface JumlahKonten {
  id: string;
  talentId: string;
  storeId: string;
  jumlah: number;
  tanggal: firebase.firestore.Timestamp;
}

// Fix: Add missing types for JumlahKonten feature.
export interface JumlahKontenWithDetails extends JumlahKonten {
  talentName: string;
  storeName: string;
}

export interface ProductSale {
  id: string;
  storeId: string;
  productId: string;
  quantity: number;
  date: firebase.firestore.Timestamp;
}

export interface ProductSaleWithDetails extends ProductSale {
  storeName: string;
  productName: string;
}