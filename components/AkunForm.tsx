import React, { useState, useEffect } from 'react';
import { addAkun, updateAkun } from '../services/firestoreService';
import type { Akun } from '../types';

interface AkunFormProps {
  akunToEdit: Akun | null;
  onClose: () => void;
  onSave: () => void;
}

const AkunForm: React.FC<AkunFormProps> = ({ akunToEdit, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (akunToEdit) {
      setName(akunToEdit.nama);
    }
  }, [akunToEdit]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Account name cannot be empty.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    
    try {
      if (akunToEdit) {
        await updateAkun(akunToEdit.id, name);
      } else {
        await addAkun(name);
      }
      onSave();
    } catch (err) {
      setError('Failed to save account. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="w-full max-w-md p-6 mx-4 border rounded-lg bg-card border-border-color">
        <div className="flex items-center justify-between pb-4 border-b border-border-color">
          <h2 className="text-xl font-bold text-text-primary">{akunToEdit ? 'Edit Account' : 'Add New Account'}</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="akun-name" className="block text-sm font-medium text-text-secondary">Account Name</label>
            <input 
              type="text" 
              id="akun-name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm bg-input-bg border-border-color focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="e.g., Main Account"
            />
          </div>
          
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end pt-4 space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium border rounded-md text-text-primary bg-border-color border-border-color hover:bg-gray-600">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Saving...' : 'Save Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AkunForm;