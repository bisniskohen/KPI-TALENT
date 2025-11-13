import React, { useState, useEffect } from 'react';
import { addJumlahKonten, updateJumlahKonten } from '../services/firestoreService';
import type { JumlahKonten, Talent, Store } from '../types';

interface JumlahKontenFormProps {
  recordToEdit: JumlahKonten | null;
  talents: Talent[];
  stores: Store[];
  onClose: () => void;
  onSave: () => void;
}

const JumlahKontenForm: React.FC<JumlahKontenFormProps> = ({ recordToEdit, talents, stores, onClose, onSave }) => {
  const [talentId, setTalentId] = useState('');
  const [storeId, setStoreId] = useState('');
  const [jumlah, setJumlah] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (recordToEdit) {
      setTalentId(recordToEdit.talentId);
      setStoreId(recordToEdit.storeId);
      setJumlah(recordToEdit.jumlah);
    }
  }, [recordToEdit]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!talentId || !storeId || jumlah <= 0) {
      setError('Please fill all fields and ensure count is positive.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    
    try {
      const recordData = { talentId, storeId, jumlah };
      if (recordToEdit) {
        await updateJumlahKonten(recordToEdit.id, recordData);
      } else {
        await addJumlahKonten(recordData);
      }
      onSave();
    } catch (err) {
      setError('Failed to save record. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="w-full max-w-md p-6 mx-4 border rounded-lg bg-card border-border-color">
        <div className="flex items-center justify-between pb-4 border-b border-border-color">
          <h2 className="text-xl font-bold text-text-primary">{recordToEdit ? 'Edit Content Record' : 'Add New Content Record'}</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="talent" className="block text-sm font-medium text-text-secondary">Talent</label>
            <select id="talent" value={talentId} onChange={(e) => setTalentId(e.target.value)} required className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm bg-input-bg border-border-color focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
              <option value="" disabled>Select a talent</option>
              {talents.map(t => <option key={t.id} value={t.id}>{t.nama}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="store" className="block text-sm font-medium text-text-secondary">Store</label>
            <select id="store" value={storeId} onChange={(e) => setStoreId(e.target.value)} required className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm bg-input-bg border-border-color focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
              <option value="" disabled>Select a store</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="jumlah" className="block text-sm font-medium text-text-secondary">Content Count</label>
            <input 
              type="number" 
              id="jumlah" 
              value={jumlah} 
              onChange={(e) => setJumlah(Number(e.target.value))} 
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

export default JumlahKontenForm;
