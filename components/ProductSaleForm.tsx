import React, { useState, useEffect, useMemo } from 'react';
import { addProductSale, updateProductSale } from '../services/firestoreService';
import type { ProductSale, Product, Store } from '../types';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

interface ProductSaleFormProps {
  saleToEdit: ProductSale | null;
  products: Product[];
  stores: Store[];
  onClose: () => void;
  onSave: () => void;
}

const ProductSaleForm: React.FC<ProductSaleFormProps> = ({ saleToEdit, products, stores, onClose, onSave }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [storeId, setStoreId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (saleToEdit) {
      setDate(saleToEdit.date.toDate().toISOString().split('T')[0]);
      setStoreId(saleToEdit.storeId);
      setProductId(saleToEdit.productId);
      setQuantity(saleToEdit.quantity);
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setStoreId('');
      setProductId('');
      setQuantity(1);
    }
  }, [saleToEdit]);
  
  const filteredProducts = useMemo(() => {
    if (!storeId) return [];
    return products.filter(p => p.storeId === storeId);
  }, [storeId, products]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !storeId || quantity <= 0 || !date) {
      setError('Please fill all fields and ensure quantity is positive.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    
    try {
      const saleData = { 
        storeId, 
        productId, 
        quantity,
        date: firebase.firestore.Timestamp.fromDate(new Date(`${date}T00:00:00`))
      };

      if (saleToEdit) {
        await updateProductSale(saleToEdit.id, saleData);
      } else {
        await addProductSale(saleData);
      }
      onSave();
    } catch (err) {
      setError('Failed to save sales record. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="w-full max-w-md p-6 mx-4 border rounded-lg bg-card border-border-color">
        <div className="flex items-center justify-between pb-4 border-b border-border-color">
          <h2 className="text-xl font-bold text-text-primary">{saleToEdit ? 'Edit Sale Record' : 'Add New Sale Record'}</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="saleDate" className="block text-sm font-medium text-text-secondary">Tanggal</label>
            <input type="date" id="saleDate" value={date} onChange={(e) => setDate(e.target.value)} required style={{colorScheme: 'dark'}} className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm bg-input-bg border-border-color focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/>
          </div>
          <div>
            <label htmlFor="store" className="block text-sm font-medium text-text-secondary">Toko</label>
            <select 
              id="store" 
              value={storeId} 
              onChange={(e) => {
                setStoreId(e.target.value);
                setProductId(''); 
              }} 
              required 
              className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm bg-input-bg border-border-color focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="" disabled>Select a store</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="product" className="block text-sm font-medium text-text-secondary">Produk</label>
            <select 
              id="product" 
              value={productId} 
              onChange={(e) => setProductId(e.target.value)} 
              required 
              disabled={!storeId || filteredProducts.length === 0}
              className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm bg-input-bg border-border-color focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:bg-gray-800 disabled:cursor-not-allowed"
            >
              <option value="" disabled>Select a product</option>
              {filteredProducts.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
            </select>
            {storeId && filteredProducts.length === 0 && (
              <p className="mt-1 text-xs text-text-secondary">No products found for this store.</p>
            )}
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-text-secondary">Jumlah Produk Laku</label>
            <input 
              type="number" 
              id="quantity" 
              value={quantity} 
              onChange={(e) => setQuantity(Number(e.target.value))} 
              required
              min="1"
              className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm bg-input-bg border-border-color focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
          
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end pt-4 space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium border rounded-md text-text-primary bg-border-color border-border-color hover:bg-gray-600">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductSaleForm;