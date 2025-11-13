import React, { useState, useEffect, useCallback } from 'react';
import { getCollectionData, deleteTalent } from '../services/firestoreService';
import type { Talent } from '../types';
import LoadingSpinner from './LoadingSpinner';
import TalentForm from './TalentForm';

const TalentManagement: React.FC = () => {
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [talentToEdit, setTalentToEdit] = useState<Talent | null>(null);

  const fetchTalents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fix: The collection name for talents is 'TALENT', not 'talent'. This ensures consistency with other parts of the application.
      const talentsData = await getCollectionData<Talent>('TALENT');
      setTalents(talentsData);
    } catch (err) {
      setError('Failed to fetch talents.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTalents();
  }, [fetchTalents]);

  const handleOpenModal = (talent: Talent | null = null) => {
    setTalentToEdit(talent);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setTalentToEdit(null);
    setIsModalOpen(false);
  };

  const handleSave = () => {
    handleCloseModal();
    fetchTalents();
  };

  const handleDelete = async (talentId: string) => {
    if (window.confirm('Are you sure you want to delete this talent? This action cannot be undone.')) {
      try {
        await deleteTalent(talentId);
        fetchTalents(); // Refetch after deleting
      } catch (err) {
        setError('Failed to delete talent. Please try again.');
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
    <div className="p-4 mx-auto max-w-4xl sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-text-primary">Manage Talents</h2>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 font-semibold text-white transition duration-150 ease-in-out rounded-lg shadow-md bg-secondary hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
        >
          + Add Talent
        </button>
      </div>

      {error && <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded-md">{error}</div>}

      <div className="p-6 border rounded-lg bg-card border-border-color">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="border-b bg-background border-border-color">
                <th className="px-4 py-3 text-sm font-medium text-text-secondary">Talent Name</th>
                <th className="px-4 py-3 text-sm font-medium text-right text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {talents.map((talent) => (
                <tr key={talent.id} className="border-b border-border-color hover:bg-background">
                  <td className="px-4 py-3 text-sm text-text-primary">{talent.nama}</td>
                  <td className="px-4 py-3 text-sm font-medium text-right">
                    <button onClick={() => handleOpenModal(talent)} className="text-primary hover:text-primary/80">Edit</button>
                    <button onClick={() => handleDelete(talent.id)} className="ml-4 text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
               {talents.length === 0 && (
                <tr>
                    <td colSpan={2} className="py-8 text-center text-text-secondary">No talents found. Add one to get started!</td>
                </tr>
               )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <TalentForm
          talentToEdit={talentToEdit}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default TalentManagement;