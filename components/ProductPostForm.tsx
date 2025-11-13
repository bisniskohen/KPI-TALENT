import React, { useState, useEffect, useMemo } from 'react';
import { addProductPost, updateProductPost } from '../services/firestoreService';
import type { ProductPost, Product, Store, Talent, Akun } from '../types';

interface ProductPostFormProps {
  postToEdit: ProductPost | null;
  products: Product[];
  stores: Store[];
  talents: Talent[];
  akuns: Akun[];
  onClose: () => void;
  onSave: () => void;
}

const ProductPostForm: React.FC<ProductPostFormProps> = ({ postToEdit, products, stores, talents, akuns, onClose, onSave }) => {
  const [productId, setProductId] = useState('');
  const [storeId, setStoreId] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [akunId, setAkunId] = useState('');
  const [talentId, setTalentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (postToEdit) {
      setStoreId(postToEdit.storeId);
      setProductId(postToEdit.productId);
      setVideoUrl(postToEdit.videoUrl);
      setAkunId(postToEdit.akunId || '');
      setTalentId(postToEdit.talentId || '');
    } else {
      // Reset form for a new entry
      setStoreId('');
      setProductId('');
      setVideoUrl('');
      setAkunId('');
      setTalentId('');
    }
  }, [postToEdit]);
  
  const filteredProducts = useMemo(() => {
    if (!storeId) return [];
    return products.filter(p => p.storeId === storeId);
  }, [storeId, products]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !storeId || !videoUrl.trim() || !akunId || !talentId) {
      setError('Please fill all fields.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    
    try {
      const postData = { productId, storeId, videoUrl, akunId, talentId };
      if (postToEdit) {
        await updateProductPost(postToEdit.id, postData);
      } else {
        await addProductPost(postData);
      }
      onSave();
    } catch (err) {
      setError('Failed to save post record. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="w-full max-w-md p-6 mx-4 border rounded-lg bg-card border-border-color">
        <div className="flex items-center justify-between pb-4 border-b border-border-color">
          <h2 className="text-xl font-bold text-text-primary">{postToEdit ? 'Edit Record' : 'Add New Post Record'}</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="akun" className="block text-sm font-medium text-text-secondary">Nama Akun</label>
            <select 
              id="akun" 
              value={akunId} 
              onChange={(e) => setAkunId(e.target.value)}
              required 
              className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm bg-input-bg border-border-color focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="" disabled>Select an account</option>
              {akuns.map(a => <option key={a.id} value={a.id}>{a.nama}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="host" className="block text-sm font-medium text-text-secondary">Nama Host</label>
            <select 
              id="host" 
              value={talentId} 
              onChange={(e) => setTalentId(e.target.value)}
              required 
              className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm bg-input-bg border-border-color focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="" disabled>Select a host</option>
              {talents.map(t => <option key={t.id} value={t.id}>{t.nama}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="store" className="block text-sm font-medium text-text-secondary">Toko</label>
            <select 
              id="store" 
              value={storeId} 
              onChange={(e) => {
                setStoreId(e.target.value);
                setProductId(''); // Reset product selection on store change
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
            <label htmlFor="videoUrl" className="block text-sm font-medium text-text-secondary">Link</label>
            <input 
              type="url" 
              id="videoUrl" 
              value={videoUrl} 
              onChange={(e) => setVideoUrl(e.target.value)} 
              required 
              className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm bg-input-bg border-border-color focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="https://example.com/video"
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

export default ProductPostForm;