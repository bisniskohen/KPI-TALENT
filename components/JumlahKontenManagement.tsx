import React, { useState, useEffect, useMemo } from 'react';
import { subscribeToCollection, deleteJumlahKonten, deleteJumlahKontens } from '../services/firestoreService';
import type { JumlahKonten, JumlahKontenWithDetails, Talent, Store } from '../types';
import LoadingSpinner from './LoadingSpinner';
import JumlahKontenForm from './JumlahKontenForm';

const JumlahKontenManagement: React.FC = () => {
  const [records, setRecords] = useState<JumlahKonten[]>([]);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<JumlahKonten | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const collectionsToLoad = { records: false, talents: false, stores: false };
    const checkAllLoaded = () => {
        if (Object.values(collectionsToLoad).every(loaded => loaded)) {
            setLoading(false);
        }
    };

    try {
      const unsubscribers = [
        subscribeToCollection<JumlahKonten>('JUMLAH KONTEN', data => {
          setRecords(data.sort((a, b) => (b.tanggal?.toMillis() || 0) - (a.tanggal?.toMillis() || 0)));
          if (!collectionsToLoad.records) { collectionsToLoad.records = true; checkAllLoaded(); }
        }),
        subscribeToCollection<Talent>('TALENT', data => {
          setTalents(data);
          if (!collectionsToLoad.talents) { collectionsToLoad.talents = true; checkAllLoaded(); }
        }),
        subscribeToCollection<Store>('NAMA TOKO', data => {
          setStores(data);
          if (!collectionsToLoad.stores) { collectionsToLoad.stores = true; checkAllLoaded(); }
        }),
      ];
      return () => unsubscribers.forEach(unsub => unsub());
    } catch (err) {
      setError('Failed to fetch content count data.');
      console.error(err);
      setLoading(false);
    }
  }, []);


  const recordsWithDetails: JumlahKontenWithDetails[] = useMemo(() => {
    const talentMap = new Map(talents.map(t => [t.id, t.nama]));
    const storeMap = new Map(stores.map(s => [s.id, s.nama]));
    return records.map(record => ({
      ...record,
      talentName: talentMap.get(record.talentId) || 'Unknown Talent',
      storeName: storeMap.get(record.storeId) || 'Unknown Store',
    }));
  }, [records, talents, stores]);

  const handleOpenModal = (record: JumlahKonten | null = null) => {
    setRecordToEdit(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setRecordToEdit(null);
    setIsModalOpen(false);
  };

  const handleSave = () => {
    handleCloseModal();
    // No need to fetch, real-time updates will handle it
  };

  const handleDelete = async (recordId: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await deleteJumlahKonten(recordId);
      } catch (err) {
        setError('Failed to delete record. Please try again.');
        console.error(err);
      }
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
          setSelectedIds(recordsWithDetails.map(p => p.id));
      } else {
          setSelectedIds([]);
      }
  };

  const handleBulkDelete = async () => {
      if (selectedIds.length === 0) return;
      if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected records? This action cannot be undone.`)) {
          try {
              setError(null);
              await deleteJumlahKontens(selectedIds);
              setSelectedIds([]);
          } catch (err) {
              setError('Failed to delete selected records. Please try again.');
              console.error(err);
          }
      }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-4 mx-auto max-w-7xl sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <h2 className="text-2xl font-semibold text-text-primary">Manage Content Count</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 font-semibold text-white transition duration-150 ease-in-out rounded-lg shadow-md bg-secondary hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
          >
            + Add Record
          </button>
          {selectedIds.length > 0 && (
            <button onClick={handleBulkDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                Delete Selected ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {error && <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded-md">{error}</div>}

      <div className="p-6 border rounded-lg bg-card border-border-color">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="border-b bg-background border-border-color">
                <th className="px-4 py-3">
                    <input 
                        type="checkbox"
                        className="w-4 h-4 rounded text-primary bg-input-bg border-border-color focus:ring-primary"
                        onChange={handleSelectAll}
                        checked={recordsWithDetails.length > 0 && selectedIds.length === recordsWithDetails.length}
                        ref={el => el && (el.indeterminate = selectedIds.length > 0 && selectedIds.length < recordsWithDetails.length)}
                    />
                </th>
                <th className="px-4 py-3 text-sm font-medium text-text-secondary">Date</th>
                <th className="px-4 py-3 text-sm font-medium text-text-secondary">Talent</th>
                <th className="px-4 py-3 text-sm font-medium text-text-secondary">Store</th>
                <th className="px-4 py-3 text-sm font-medium text-text-secondary">Count</th>
                <th className="px-4 py-3 text-sm font-medium text-right text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recordsWithDetails.map((record) => (
                <tr key={record.id} className={`border-b border-border-color hover:bg-background ${selectedIds.includes(record.id) ? 'bg-primary/20' : ''}`}>
                  <td className="px-4 py-3">
                      <input 
                          type="checkbox"
                          className="w-4 h-4 rounded text-primary bg-input-bg border-border-color focus:ring-primary"
                          checked={selectedIds.includes(record.id)}
                          onChange={() => handleSelect(record.id)}
                      />
                  </td>
                  <td className="px-4 py-3 text-sm text-text-primary">{record.tanggal ? record.tanggal.toDate().toLocaleDateString() : 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{record.talentName}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{record.storeName}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{record.jumlah}</td>
                  <td className="px-4 py-3 text-sm font-medium text-right">
                    <button onClick={() => handleOpenModal(record)} className="text-primary hover:text-primary/80">Edit</button>
                    <button onClick={() => handleDelete(record.id)} className="ml-4 text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
               {recordsWithDetails.length === 0 && (
                <tr>
                    <td colSpan={6} className="py-8 text-center text-text-secondary">No records found. Add one to get started!</td>
                </tr>
               )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <JumlahKontenForm
          recordToEdit={recordToEdit}
          talents={talents}
          stores={stores}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default JumlahKontenManagement;