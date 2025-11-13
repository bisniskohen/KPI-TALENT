import React, { useState, useEffect } from 'react';
import { subscribeToCollection, deleteTalent, deleteProduct, deleteStore, deleteAkun } from '../services/firestoreService';
import type { Talent, Product, Store, Akun } from '../types';
import LoadingSpinner from './LoadingSpinner';
import TalentForm from './TalentForm';
import ProductForm from './ProductForm';
import StoreForm from './StoreForm';
import AkunForm from './AkunForm';

type ModalType = 'talent' | 'product' | 'store' | 'akun';

const MasterDataManagement: React.FC = () => {
  const [talents, setTalents] = useState<Talent[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [akuns, setAkuns] = useState<Akun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [modalState, setModalState] = useState<{type: ModalType | null, data: any | null}>({ type: null, data: null });

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const collectionsToLoad = { talents: false, products: false, stores: false, akuns: false };

    const checkAllLoaded = () => {
        if (Object.values(collectionsToLoad).every(loaded => loaded)) {
            setLoading(false);
        }
    };

    try {
        const unsubscribers = [
            subscribeToCollection<Talent>('TALENT', data => {
                setTalents(data);
                if (!collectionsToLoad.talents) { collectionsToLoad.talents = true; checkAllLoaded(); }
            }),
            subscribeToCollection<Product>('PRODUK', data => {
                setProducts(data);
                if (!collectionsToLoad.products) { collectionsToLoad.products = true; checkAllLoaded(); }
            }),
            subscribeToCollection<Store>('NAMA TOKO', data => {
                setStores(data);
                if (!collectionsToLoad.stores) { collectionsToLoad.stores = true; checkAllLoaded(); }
            }),
            subscribeToCollection<Akun>('NAMA AKUN', data => {
                setAkuns(data);
                if (!collectionsToLoad.akuns) { collectionsToLoad.akuns = true; checkAllLoaded(); }
            }),
        ];

        return () => unsubscribers.forEach(unsub => unsub());
    } catch (err) {
        setError('Failed to subscribe to master data.');
        console.error(err);
        setLoading(false);
    }
  }, []);

  const handleOpenModal = (type: ModalType, data: any | null = null) => {
    setModalState({ type, data });
  };

  const handleCloseModal = () => {
    setModalState({ type: null, data: null });
  };

  const handleSave = () => {
    // Data updates in real-time, just close the modal.
    handleCloseModal();
  };

  const handleDelete = async (type: ModalType, id: string) => {
    const typeName = type.charAt(0).toUpperCase() + type.slice(1);
    if (window.confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
      try {
        setError(null);
        if (type === 'talent') await deleteTalent(id);
        else if (type === 'product') await deleteProduct(id);
        else if (type === 'store') await deleteStore(id);
        else if (type === 'akun') await deleteAkun(id);
        // No need to refetch, real-time listener will update UI.
      } catch (err) {
        setError(`Failed to delete ${type}. Please try again.`);
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
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-text-primary">Manage Master Data</h2>
        <p className="text-text-secondary">Add, edit, or delete talents, products, and stores.</p>
      </div>

      {error && <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded-md">{error}</div>}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Talents Card */}
        <div className="p-6 border rounded-lg bg-card border-border-color">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Talents</h3>
            <button
              onClick={() => handleOpenModal('talent')}
              className="px-4 py-2 text-sm font-semibold text-white transition duration-150 ease-in-out rounded-lg shadow-md bg-secondary hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
            >
              + Add Talent
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
              <thead>
                <tr className="border-b bg-background border-border-color">
                  <th className="px-4 py-3 text-sm font-medium text-text-secondary">Name</th>
                  <th className="px-4 py-3 text-sm font-medium text-right text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {talents.map((talent) => (
                  <tr key={talent.id} className="border-b border-border-color hover:bg-background">
                    <td className="px-4 py-3 text-sm text-text-primary">{talent.nama}</td>
                    <td className="px-4 py-3 text-sm font-medium text-right">
                      <button onClick={() => handleOpenModal('talent', talent)} className="text-primary hover:text-primary/80">Edit</button>
                      <button onClick={() => handleDelete('talent', talent.id)} className="ml-4 text-red-600 hover:text-red-800">Delete</button>
                    </td>
                  </tr>
                ))}
                {talents.length === 0 && (<tr><td colSpan={2} className="py-8 text-center text-text-secondary">No talents found.</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>

        {/* Akun Card */}
        <div className="p-6 border rounded-lg bg-card border-border-color">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Accounts</h3>
            <button
              onClick={() => handleOpenModal('akun')}
              className="px-4 py-2 text-sm font-semibold text-white transition duration-150 ease-in-out rounded-lg shadow-md bg-secondary hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
            >
              + Add Account
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
              <thead>
                <tr className="border-b bg-background border-border-color">
                  <th className="px-4 py-3 text-sm font-medium text-text-secondary">Name</th>
                  <th className="px-4 py-3 text-sm font-medium text-right text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {akuns.map((akun) => (
                  <tr key={akun.id} className="border-b border-border-color hover:bg-background">
                    <td className="px-4 py-3 text-sm text-text-primary">{akun.nama}</td>
                    <td className="px-4 py-3 text-sm font-medium text-right">
                      <button onClick={() => handleOpenModal('akun', akun)} className="text-primary hover:text-primary/80">Edit</button>
                      <button onClick={() => handleDelete('akun', akun.id)} className="ml-4 text-red-600 hover:text-red-800">Delete</button>
                    </td>
                  </tr>
                ))}
                {akuns.length === 0 && (<tr><td colSpan={2} className="py-8 text-center text-text-secondary">No accounts found.</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>


        {/* Stores & Products Card */}
        <div className="p-6 border rounded-lg bg-card lg:col-span-2 border-border-color">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Stores & Products</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => handleOpenModal('store')}
                className="px-4 py-2 text-sm font-semibold text-white transition duration-150 ease-in-out rounded-lg shadow-md bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                + Add Store
              </button>
               <button
                onClick={() => handleOpenModal('product')}
                className="px-4 py-2 text-sm font-semibold text-white transition duration-150 ease-in-out rounded-lg shadow-md bg-secondary hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
              >
                + Add Product
              </button>
            </div>
          </div>
          <div className="space-y-6">
            {stores.length > 0 ? stores.map((store) => {
              const storeProducts = products.filter(p => p.storeId === store.id);
              return (
                <div key={store.id} className="p-4 border rounded-lg bg-background border-border-color">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-border-color">
                    <div>
                      <h4 className="font-bold text-text-primary">{store.nama}</h4>
                      <p className="text-sm text-text-secondary">{storeProducts.length} {storeProducts.length === 1 ? 'Product' : 'Products'}</p>
                    </div>
                    <div className="text-sm font-medium">
                      <button onClick={() => handleOpenModal('store', store)} className="text-primary hover:text-primary/80">Edit Store</button>
                      <button onClick={() => handleDelete('store', store.id)} className="ml-4 text-red-600 hover:text-red-800">Delete Store</button>
                    </div>
                  </div>
                  {storeProducts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left table-auto">
                        <thead className="sr-only">
                           <tr>
                              <th>Product Name</th>
                              <th>Link</th>
                              <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                          {storeProducts.map((product) => (
                            <tr key={product.id} className="border-b border-border-color last:border-b-0 hover:bg-card">
                              <td className="px-2 py-2 text-sm text-text-primary">{product.nama}</td>
                              <td className="px-2 py-2 text-sm">
                                {product.link ? (
                                    <a href={product.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        View Product
                                    </a>
                                ) : (
                                    <span className="text-text-secondary">No Link</span>
                                )}
                              </td>
                              <td className="px-2 py-2 text-sm font-medium text-right">
                                <button onClick={() => handleOpenModal('product', product)} className="text-primary hover:text-primary/80">Edit</button>
                                <button onClick={() => handleDelete('product', product.id)} className="ml-4 text-red-600 hover:text-red-800">Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="py-4 text-sm text-center text-text-secondary">No products found for this store.</p>
                  )}
                </div>
              );
            }) : (
              <p className="py-8 text-center text-text-secondary">No stores found. Add a store to get started.</p>
            )}
          </div>
        </div>

      </div>
      
      {modalState.type === 'talent' && (
        <TalentForm
          talentToEdit={modalState.data}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
      {modalState.type === 'akun' && (
        <AkunForm
          akunToEdit={modalState.data}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
      {modalState.type === 'product' && (
        <ProductForm
          productToEdit={modalState.data}
          stores={stores}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
       {modalState.type === 'store' && (
        <StoreForm
          storeToEdit={modalState.data}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default MasterDataManagement;