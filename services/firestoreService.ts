


import { db } from '../firebase';
// Fix: Import firebase for serverTimestamp and use v8 firestore methods.
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
// Fix: Import JumlahKonten to be used in new functions.
import type { Sale, ProductPost, ProductSale, JumlahKonten } from '../types';

// Fix: Add missing function to get collection data.
// Generic function to get all documents from a collection once
export const getCollectionData = async <T,>(collectionName: string): Promise<T[]> => {
  try {
    const querySnapshot = await db.collection(collectionName).get();
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    return data;
  } catch (error) {
    console.error(`Error getting documents from collection ${collectionName}:`, error);
    throw error;
  }
};

// Generic function to subscribe to real-time updates from a collection
export const subscribeToCollection = <T,>(collectionName: string, callback: (data: T[]) => void): () => void => {
  const unsubscribe = db.collection(collectionName).onSnapshot(
    (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
      callback(data);
    },
    (error) => {
      console.error(`Error listening to collection ${collectionName}:`, error);
    }
  );
  return unsubscribe;
};


// Function to add a new sale record
type NewSaleData = Omit<Sale, 'id'>;

export const addSale = async (saleData: NewSaleData) => {
  try {
    // Fix: Use v8 API for adding documents. The timestamp is now provided by the client.
    const docRef = await db.collection('sales').add({
      ...saleData,
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

// Function to update an existing sale record
export const updateSale = async (id: string, data: Partial<NewSaleData>) => {
  try {
    await db.collection('sales').doc(id).update(data);
  } catch (e) {
    console.error("Error updating sale: ", e);
    throw e;
  }
};

// Function to delete a sale record
export const deleteSale = async (id: string) => {
  try {
    await db.collection('sales').doc(id).delete();
  } catch (e) {
    console.error("Error deleting sale: ", e);
    throw e;
  }
};


// Function to add a new talent
export const addTalent = async (name: string) => {
  try {
    const docRef = await db.collection('TALENT').add({ nama: name });
    return docRef.id;
  } catch (e) {
    console.error("Error adding talent: ", e);
    throw e;
  }
};

// Function to update an existing talent
export const updateTalent = async (id: string, name: string) => {
  try {
    await db.collection('TALENT').doc(id).update({ nama: name });
  } catch (e) {
    console.error("Error updating talent: ", e);
    throw e;
  }
};

// Function to delete a talent
export const deleteTalent = async (id: string) => {
  try {
    await db.collection('TALENT').doc(id).delete();
  } catch (e) {
    console.error("Error deleting talent: ", e);
    throw e;
  }
};

// Function to add a new store
export const addStore = async (name: string) => {
  try {
    const docRef = await db.collection('NAMA TOKO').add({ nama: name });
    return docRef.id;
  } catch (e) {
    console.error("Error adding store: ", e);
    throw e;
  }
};

// Function to update an existing store
export const updateStore = async (id: string, name: string) => {
  try {
    await db.collection('NAMA TOKO').doc(id).update({ nama: name });
  } catch (e) {
    console.error("Error updating store: ", e);
    throw e;
  }
};

// Function to delete a store
export const deleteStore = async (id: string) => {
  try {
    await db.collection('NAMA TOKO').doc(id).delete();
  } catch (e) {
    console.error("Error deleting store: ", e);
    throw e;
  }
};

// Function to add a new product
export const addProduct = async (name: string, storeId: string, link: string) => {
    try {
      const docRef = await db.collection('PRODUK').add({ nama: name, storeId: storeId, link: link });
      return docRef.id;
    } catch (e) {
      console.error("Error adding product: ", e);
      throw e;
    }
  };
  
  // Function to update an existing product
  export const updateProduct = async (id: string, name: string, storeId: string, link: string) => {
    try {
      await db.collection('PRODUK').doc(id).update({ nama: name, storeId: storeId, link: link });
    } catch (e) {
      console.error("Error updating product: ", e);
      throw e;
    }
  };
  
  // Function to delete a product
  export const deleteProduct = async (id: string) => {
    try {
      await db.collection('PRODUK').doc(id).delete();
    } catch (e) {
      console.error("Error deleting product: ", e);
      throw e;
    }
  };

// Function to add a new product post
type NewProductPostData = Omit<ProductPost, 'id' | 'date'>;
export const addProductPost = async (postData: NewProductPostData) => {
  try {
    const docRef = await db.collection('productPosts').add({
      ...postData,
      date: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding product post: ", e);
    throw e;
  }
};

// Function to update an existing product post
export const updateProductPost = async (id: string, postData: { productId: string, storeId: string, videoUrl: string, akunId: string, talentId: string }) => {
  try {
    await db.collection('productPosts').doc(id).update(postData);
  } catch (e) {
    console.error("Error updating product post: ", e);
    throw e;
  }
};

// Function to delete a product post
export const deleteProductPost = async (id: string) => {
  try {
    await db.collection('productPosts').doc(id).delete();
  } catch (e) {
    console.error("Error deleting product post: ", e);
    throw e;
  }
};

// Function to add a new product sale record
type NewProductSaleData = Omit<ProductSale, 'id'>;
export const addProductSale = async (data: NewProductSaleData) => {
  try {
    const docRef = await db.collection('productSales').add({
      ...data,
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding product sale: ", e);
    throw e;
  }
};

// Function to update an existing product sale record
export const updateProductSale = async (id: string, data: { storeId: string, productId: string, quantity: number, date: firebase.firestore.Timestamp }) => {
  try {
    await db.collection('productSales').doc(id).update(data);
  } catch (e) {
    console.error("Error updating product sale: ", e);
    throw e;
  }
};

// Function to delete a product sale record
export const deleteProductSale = async (id: string) => {
  try {
    await db.collection('productSales').doc(id).delete();
  } catch (e) {
    console.error("Error deleting product sale: ", e);
    throw e;
  }
};

// Fix: Add missing functions for JumlahKonten feature.
// Function to add a new JumlahKonten record
type NewJumlahKontenData = Omit<JumlahKonten, 'id' | 'tanggal'>;
export const addJumlahKonten = async (data: NewJumlahKontenData) => {
  try {
    const docRef = await db.collection('JUMLAH KONTEN').add({
      ...data,
      tanggal: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding jumlah konten: ", e);
    throw e;
  }
};

// Fix: Add missing functions for JumlahKonten feature.
// Function to update an existing JumlahKonten record
export const updateJumlahKonten = async (id: string, data: { talentId: string, storeId: string, jumlah: number }) => {
  try {
    await db.collection('JUMLAH KONTEN').doc(id).update(data);
  } catch (e) {
    console.error("Error updating jumlah konten: ", e);
    throw e;
  }
};

// Fix: Add missing functions for JumlahKonten feature.
// Function to delete a JumlahKonten record
export const deleteJumlahKonten = async (id: string) => {
  try {
    await db.collection('JUMLAH KONTEN').doc(id).delete();
  } catch (e) {
    console.error("Error deleting jumlah konten: ", e);
    throw e;
  }
};

// Function to add a new account
export const addAkun = async (name: string) => {
  try {
    const docRef = await db.collection('NAMA AKUN').add({ nama: name });
    return docRef.id;
  } catch (e) {
    console.error("Error adding account: ", e);
    throw e;
  }
};

// Function to update an existing account
export const updateAkun = async (id: string, name: string) => {
  try {
    await db.collection('NAMA AKUN').doc(id).update({ nama: name });
  } catch (e) {
    console.error("Error updating account: ", e);
    throw e;
  }
};

// Function to delete an account
export const deleteAkun = async (id: string) => {
  try {
    await db.collection('NAMA AKUN').doc(id).delete();
  } catch (e) {
    console.error("Error deleting account: ", e);
    throw e;
  }
};


// --- Bulk Delete Functions ---

// Generic batch delete helper to handle more than 500 items
const batchDelete = async (collectionName: string, ids: string[]) => {
  if (!ids || ids.length === 0) return;
  // Firestore allows a maximum of 500 operations in a single batch.
  const batchArray: Promise<void>[] = [];
  for (let i = 0; i < ids.length; i += 500) {
    const chunk = ids.slice(i, i + 500);
    const batch = db.batch();
    chunk.forEach(id => {
        const docRef = db.collection(collectionName).doc(id);
        batch.delete(docRef);
    });
    batchArray.push(batch.commit());
  }
  await Promise.all(batchArray);
};

// Function to delete multiple sales
export const deleteSales = async (ids: string[]) => {
  try {
    await batchDelete('sales', ids);
  } catch (e) {
    console.error("Error deleting sales: ", e);
    throw e;
  }
};

// Function to delete multiple talents
export const deleteTalents = async (ids: string[]) => {
    try {
        await batchDelete('TALENT', ids);
    } catch (e) {
        console.error("Error deleting talents: ", e);
        throw e;
    }
};

// Function to delete multiple stores
export const deleteStores = async (ids: string[]) => {
    try {
        await batchDelete('NAMA TOKO', ids);
    } catch (e) {
        console.error("Error deleting stores: ", e);
        throw e;
    }
};

// Function to delete multiple products
export const deleteProducts = async (ids: string[]) => {
    try {
        await batchDelete('PRODUK', ids);
    } catch (e) {
        console.error("Error deleting products: ", e);
        throw e;
    }
};

// Function to delete multiple product posts
export const deleteProductPosts = async (ids: string[]) => {
    try {
        await batchDelete('productPosts', ids);
    } catch (e) {
        console.error("Error deleting product posts: ", e);
        throw e;
    }
};

// Function to delete multiple product sales
export const deleteProductSales = async (ids: string[]) => {
    try {
        await batchDelete('productSales', ids);
    } catch (e) {
        console.error("Error deleting product sales: ", e);
        throw e;
    }
};

// Function to delete multiple JumlahKonten records
export const deleteJumlahKontens = async (ids: string[]) => {
    try {
        await batchDelete('JUMLAH KONTEN', ids);
    } catch (e) {
        console.error("Error deleting jumlah konten records: ", e);
        throw e;
    }
};

// Function to delete multiple accounts
export const deleteAkuns = async (ids:string[]) => {
    try {
        await batchDelete('NAMA AKUN', ids);
    } catch (e) {
        console.error("Error deleting accounts: ", e);
        throw e;
    }
};