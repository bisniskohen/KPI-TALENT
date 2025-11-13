import React, { useState } from 'react';
import { addSale } from '../services/firestoreService';
import type { Talent, Store, Akun } from '../types';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

interface SalesFormProps {
  talents: Talent[];
  akuns: Akun[];
  onClose: () => void;
  onSaleAdded: () => void;
}

const SalesForm: React.FC<SalesFormProps> = ({ talents, akuns, onClose, onSaleAdded }) => {
  const [talentId, setTalentId] = useState('');
  const [akunId, setAkunId] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalValue, setTotalValue] = useState(0); // GMV
  const [estimatedCommission, setEstimatedCommission] = useState(0);
  const [productViews, setProductViews] = useState(0);
  const [productClicks, setProductClicks] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<number>>) => {
    const value = e.target.value.replace(/\./g, ''); // Remove dots for parsing
    if (/^\d*$/.test(value)) { // Regex to allow only digits (or empty string)
      setter(Number(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!talentId || !akunId || !saleDate ) {
      setError('Please fill all required fields.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    
    try {
      await addSale({
        talentId,
        akunId,
        saleDate: firebase.firestore.Timestamp.fromDate(new Date(`${saleDate}T00:00:00`)),
        totalValue,
        estimatedCommission,
        productViews,
        productClicks,
      });
      onSaleAdded();
    } catch (err) {
      setError('Failed to add sale. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="w-full max-w-lg p-6 mx-4 border rounded-lg shadow-xl bg-card border-border-color overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-border-color">
          <h2 className="text-xl font-bold text-text-primary">Add New Sale</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="saleDate" className="block text-sm font-medium text-text-secondary">Tanggal</label>
            <input type="date" id="saleDate" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} required style={{colorScheme: 'dark'}} className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm bg-input-bg border-border-color focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/>
          </div>
          <div>
            <label htmlFor="talent" className="block text-sm font-medium text-text-secondary">Nama Host</label>
            <select id="talent" value={talentId} onChange={(e) => setTalentId(e.target.value)} required className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm bg-input-bg border-border-color focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
              <option value="" disabled>Select a host</option>
              {talents.map(t => <option key={t.id} value={t.id}>{t.nama}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="akun" className="block text-sm font-medium text-text-secondary">Nama Akun</label>
            <select id="akun" value={akunId} onChange={(e) => setAkunId(e.target.value)} required className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm bg-input-bg border-border-color focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
              <option value="" disabled>Select an account</option>
              {akuns.map(a => <option key={a.id} value={a.id}>{a.nama}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="gmv" className="block text-sm font-medium text-text-secondary">GMV (Rp)</label>
            <input type="text" id="gmv" value={totalValue.toLocaleString('id-ID')} onChange={(e) => handleNumberChange(e, setTotalValue)} required className="block w-full px-3 py-2 mt-1 text-right border rounded-md shadow-sm bg-input-bg border-border-color focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/>
          </div>
          <div>
            <label htmlFor="commission" className="block text-sm font-medium text-text-secondary">Estimasi Komisi (Rp)</label>
            <input type="text" id="commission" value={estimatedCommission.toLocaleString('id-ID')} onChange={(e) => handleNumberChange(e, setEstimatedCommission)} required className="block w-full px-3 py-2 mt-1 text-right border rounded-md shadow-sm bg-input-bg border-border-color focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/>
          </div>
           <div>
            <label htmlFor="views" className="block text-sm font-medium text-text-secondary">Produk Dilihat</label>
            <input type="text" id="views" value={productViews.toLocaleString('id-ID')} onChange={(e) => handleNumberChange(e, setProductViews)} required className="block w-full px-3 py-2 mt-1 text-right border rounded-md shadow-sm bg-input-bg border-border-color focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/>
          </div>
           <div>
            <label htmlFor="clicks" className="block text-sm font-medium text-text-secondary">Produk Diklik</label>
            <input type="text" id="clicks" value={productClicks.toLocaleString('id-ID')} onChange={(e) => handleNumberChange(e, setProductClicks)} required className="block w-full px-3 py-2 mt-1 text-right border rounded-md shadow-sm bg-input-bg border-border-color focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/>
          </div>
          
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end pt-4 space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium border rounded-md text-text-primary bg-border-color border-border-color hover:bg-gray-600">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Submitting...' : 'Add Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalesForm;