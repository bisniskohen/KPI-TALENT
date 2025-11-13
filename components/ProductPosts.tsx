import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { subscribeToCollection, deleteProductPost } from '../services/firestoreService';
import type { ProductPost, ProductPostWithDetails, Product, Store, Talent, Akun } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ProductPostForm from './ProductPostForm';

const ProductPosts: React.FC = () => {
  const [posts, setPosts] = useState<ProductPost[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [akuns, setAkuns] = useState<Akun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<ProductPost | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const collectionsToLoad = { posts: false, products: false, stores: false, talents: false, akuns: false };

    const checkAllLoaded = () => {
        if (Object.values(collectionsToLoad).every(loaded => loaded)) {
            setLoading(false);
        }
    };

    try {
        const unsubscribers = [
            subscribeToCollection<ProductPost>('productPosts', data => {
                setPosts(data.sort((a, b) => (b.date?.toMillis() || 0) - (a.date?.toMillis() || 0)));
                if (!collectionsToLoad.posts) { collectionsToLoad.posts = true; checkAllLoaded(); }
            }),
            subscribeToCollection<Product>('PRODUK', data => {
                setProducts(data);
                if (!collectionsToLoad.products) { collectionsToLoad.products = true; checkAllLoaded(); }
            }),
            subscribeToCollection<Store>('NAMA TOKO', data => {
                setStores(data);
                if (!collectionsToLoad.stores) { collectionsToLoad.stores = true; checkAllLoaded(); }
            }),
            subscribeToCollection<Talent>('TALENT', data => {
                setTalents(data);
                if (!collectionsToLoad.talents) { collectionsToLoad.talents = true; checkAllLoaded(); }
            }),
            subscribeToCollection<Akun>('NAMA AKUN', data => {
                setAkuns(data);
                if (!collectionsToLoad.akuns) { collectionsToLoad.akuns = true; checkAllLoaded(); }
            }),
        ];
        
        return () => unsubscribers.forEach(unsub => unsub());
    } catch (err) {
      setError('Failed to subscribe to product post data.');
      console.error(err);
      setLoading(false);
    }
  }, []);


  const postsWithDetails: ProductPostWithDetails[] = useMemo(() => {
    const productMap = new Map(products.map(p => [p.id, p.nama]));
    const storeMap = new Map(stores.map(s => [s.id, s.nama]));
    const talentMap = new Map(talents.map(t => [t.id, t.nama]));
    const akunMap = new Map(akuns.map(a => [a.id, a.nama]));
    return posts.map(post => ({
      ...post,
      productName: productMap.get(post.productId) || 'Unknown Product',
      storeName: storeMap.get(post.storeId) || 'Unknown Store',
      talentName: talentMap.get(post.talentId) || 'Unknown Host',
      akunName: akunMap.get(post.akunId) || 'Unknown Account',
    }));
  }, [posts, products, stores, talents, akuns]);

  const handleOpenModal = (post: ProductPost | null = null) => {
    setPostToEdit(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setPostToEdit(null);
    setIsModalOpen(false);
  };

  const handleSave = () => {
    handleCloseModal();
    // No need to fetch data, it's real-time
  };

  const handleDelete = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post record?')) {
      try {
        await deleteProductPost(postId);
        // No need to fetch data
      } catch (err) {
        setError('Failed to delete post record. Please try again.');
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-text-primary">Input Postingan</h2>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 font-semibold text-white transition duration-150 ease-in-out rounded-lg shadow-md bg-secondary hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
        >
          + Add Post Record
        </button>
      </div>

      {error && <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded-md">{error}</div>}

      <div className="p-6 border rounded-lg bg-card border-border-color">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="border-b bg-background border-border-color">
                <th className="px-4 py-3 text-sm font-medium text-text-secondary">Date</th>
                <th className="px-4 py-3 text-sm font-medium text-text-secondary">Nama Akun</th>
                <th className="px-4 py-3 text-sm font-medium text-text-secondary">Nama Host</th>
                <th className="px-4 py-3 text-sm font-medium text-text-secondary">Toko</th>
                <th className="px-4 py-3 text-sm font-medium text-text-secondary">Produk</th>
                <th className="px-4 py-3 text-sm font-medium text-text-secondary">Link</th>
                <th className="px-4 py-3 text-sm font-medium text-right text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {postsWithDetails.map((post) => (
                <tr key={post.id} className="border-b border-border-color hover:bg-background">
                  <td className="px-4 py-3 text-sm text-text-primary">{post.date ? post.date.toDate().toLocaleDateString() : 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{post.akunName}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{post.talentName}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{post.storeName}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{post.productName}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">
                    <a href={post.videoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      View Video
                    </a>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-right">
                    <button onClick={() => handleOpenModal(post)} className="text-primary hover:text-primary/80">Edit</button>
                    <button onClick={() => handleDelete(post.id)} className="ml-4 text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
               {postsWithDetails.length === 0 && (
                <tr>
                    <td colSpan={7} className="py-8 text-center text-text-secondary">No post records found. Add one to get started!</td>
                </tr>
               )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <ProductPostForm
          postToEdit={postToEdit}
          products={products}
          stores={stores}
          talents={talents}
          akuns={akuns}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ProductPosts;