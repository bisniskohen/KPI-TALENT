import React, { useState, useEffect } from 'react';
import { addProduct, updateProduct } from '../services/firestoreService';
import type { Product, Store } from '../types';

interface ProductFormProps {
  productToEdit: Product | null;
  stores: Store[];
  onClose: () => void;
  onSave: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ productToEdit, stores, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [storeId, setStoreId] = useState('');
  const [link, setLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.nama);
      setStoreId(productToEdit.storeId);
      setLink(productToEdit.link || '');
    }
  }, [productToEdit]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !storeId) {
      setError('Product name cannot be empty and a store must be selected.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    
    try {
      if (productToEdit) {
        await updateProduct(productToEdit.id, name, storeId, link);
      } else {
        await addProduct(name, storeId, link);
      }
      onSave();
    } catch (err) {
      setError('Failed to save product. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="w-full max-w-md p-6 mx-4 border rounded-lg bg-card border-border-color">
        <div className="flex items-center justify-between pb-4 border-b border-border-color">
          <h2 className="text-xl font-bold text-text-primary">{productToEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="product-name" className="block text-sm font-medium text-text-secondary">Product Name</label>
            <input 
              type="text" 
              id="product-name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm bg-input-bg border-border-color focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="e.g., T-Shirt"
            />
          </div>
           <div>
            <label htmlFor="store" className="block text-sm font-medium text-text-secondary">Store</label>
            <select id="store" value={storeId} onChange={(e) => setStoreId(e.target.value)} required className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm bg-input-bg border-border-color focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
              <option value="" disabled>Select a store</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
            </select>
          </div>
           <div>
            <label htmlFor="product-link" className="block text-sm font-medium text-text-secondary">Product Link (Optional)</label>
            <input 
              type="url" 
              id="product-link" 
              value={link} 
              onChange={(e) => setLink(e.target.value)} 
              className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm bg-input-bg border-border-color focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="https://example.com/product/item"
            />
          </div>
          
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end pt-4 space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium border rounded-md text-text-primary bg-border-color border-border-color hover:bg-gray-600">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;