import React, { useState, useEffect, useMemo } from 'react';
import { subscribeToCollection, deleteProductSale, deleteProductSales } from '../services/firestoreService';
import type { ProductSale, ProductSaleWithDetails, Product, Store } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ProductSaleForm from './ProductSaleForm';

const ProductSalesManagement: React.FC = () => {
  const [sales, setSales] = useState<ProductSale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saleToEdit, setSaleToEdit] = useState<ProductSale | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const collectionsToLoad = { sales: false, products: false, stores: false };

    const checkAllLoaded = () => {
        if (Object.values(collectionsToLoad).every(loaded => loaded)) {
            setLoading(false);
        }
    };
    
    try {
        const unsubscribers = [
            subscribeToCollection<ProductSale>('productSales', data => {
                setSales(data.sort((a, b) => (b.date?.toMillis() || 0) - (a.date?.toMillis() || 0)));
                if (!collectionsToLoad.sales) { collectionsToLoad.sales = true; checkAllLoaded(); }
            }),
            subscribeToCollection<Product>('PRODUK', data => {
                setProducts(data);
                if (!collectionsToLoad.products) { collectionsToLoad.products = true; checkAllLoaded(); }
            }),
            subscribeToCollection<Store>('NAMA TOKO', data => {
                setStores(data);
                if (!collectionsToLoad.stores) { collectionsToLoad.stores = true; checkAllLoaded(); }
            }),
        ];

        return () => unsubscribers.forEach(unsub => unsub());
    } catch (err) {
      setError('Failed to subscribe to product sales data.');
      console.error(err);
      setLoading(false);
    }
  }, []);

  const salesWithDetails: ProductSaleWithDetails[] = useMemo(() => {
    const productMap = new Map(products.map(p => [p.id, p.nama]));
    const storeMap = new Map(stores.map(s => [s.id, s.nama]));
    return sales.map(sale => ({
      ...sale,
      productName: productMap.get(sale.productId) || 'Unknown Product',
      storeName: storeMap.get(sale.storeId) || 'Unknown Store',
    }));
  }, [sales, products, stores]);

  const handleOpenModal = (sale: ProductSale | null = null) => {
    setSaleToEdit(sale);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSaleToEdit(null);
    setIsModalOpen(false);
  };

  const handleSave = () => {
    handleCloseModal();
    // No need to fetch data
  };

  const handleDelete = async (saleId: string) => {
    if (window.confirm('Are you sure you want to delete this sales record?')) {
      try {
        await deleteProductSale(saleId);
        // No need to fetch data
      } catch (err) {
        setError('Failed to delete sales record. Please try again.');
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
          setSelectedIds(salesWithDetails.map(p => p.id));
      } else {
          setSelectedIds([]);
      }
  };

  const handleBulkDelete = async () => {
      if (selectedIds.length === 0) return;
      if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected sale records? This action cannot be undone.`)) {
          try {
              setError(null);
              await deleteProductSales(selectedIds);
              setSelectedIds([]);
          } catch (err) {
              setError('Failed to delete selected sales. Please try again.');
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
        <h2 className="text-2xl font-semibold text-text-primary">Manage Product Sales</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 font-semibold text-white transition duration-150 ease-in-out rounded-lg shadow-md bg-secondary hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
          >
            + Add Sale Record
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
                        checked={salesWithDetails.length > 0 && selectedIds.length === salesWithDetails.length}
                        ref={el => el && (el.indeterminate = selectedIds.length > 0 && selectedIds.length < salesWithDetails.length)}
                    />
                </th>
                <th className="px-4 py-3 text-sm font-medium text-text-secondary">Date</th>
                <th className="px-4 py-3 text-sm font-medium text-text-secondary">Store</th>
                <th className="px-4 py-3 text-sm font-medium text-text-secondary">Product</th>
                <th className="px-4 py-3 text-sm font-medium text-text-secondary">Quantity Sold</th>
                <th className="px-4 py-3 text-sm font-medium text-right text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {salesWithDetails.map((sale) => (
                <tr key={sale.id} className={`border-b border-border-color hover:bg-background ${selectedIds.includes(sale.id) ? 'bg-primary/20' : ''}`}>
                  <td className="px-4 py-3">
                      <input 
                          type="checkbox"
                          className="w-4 h-4 rounded text-primary bg-input-bg border-border-color focus:ring-primary"
                          checked={selectedIds.includes(sale.id)}
                          onChange={() => handleSelect(sale.id)}
                      />
                  </td>
                  <td className="px-4 py-3 text-sm text-text-primary">{sale.date ? sale.date.toDate().toLocaleDateString() : 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{sale.storeName}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{sale.productName}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{sale.quantity}</td>
                  <td className="px-4 py-3 text-sm font-medium text-right">
                    <button onClick={() => handleOpenModal(sale)} className="text-primary hover:text-primary/80">Edit</button>
                    <button onClick={() => handleDelete(sale.id)} className="ml-4 text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
               {salesWithDetails.length === 0 && (
                <tr>
                    <td colSpan={6} className="py-8 text-center text-text-secondary">No records found. Add one to get started!</td>
                </tr>
               )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <ProductSaleForm
          saleToEdit={saleToEdit}
          products={products}
          stores={stores}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ProductSalesManagement;