
import React, { useState } from 'react';
import useAuth from './hooks/useAuth';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import LoadingSpinner from './components/LoadingSpinner';
import Header from './components/Header';
import { auth } from './firebase';
import MasterDataManagement from './components/MasterDataManagement';
import ProductPosts from './components/ProductPosts';
import SalesData from './components/SalesData';
import ProductSalesManagement from './components/ProductSalesManagement';
import JumlahKontenManagement from './components/JumlahKontenManagement';

type View = 'dashboard' | 'masterdata' | 'products' | 'jumlahkonten' | 'sales' | 'productsales';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [view, setView] = useState<View>('dashboard');

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {user ? (
        <>
          <Header
            userEmail={user.email}
            onLogout={handleLogout}
            currentView={view}
            onNavigate={setView}
          />
          <main>
            <div className={view === 'dashboard' ? '' : 'hidden'}><Dashboard /></div>
            <div className={view === 'masterdata' ? '' : 'hidden'}><MasterDataManagement /></div>
            <div className={view === 'products' ? '' : 'hidden'}><ProductPosts /></div>
            <div className={view === 'jumlahkonten' ? '' : 'hidden'}><JumlahKontenManagement /></div>
            <div className={view === 'sales' ? '' : 'hidden'}><SalesData /></div>
            <div className={view === 'productsales' ? '' : 'hidden'}><ProductSalesManagement /></div>
          </main>
        </>
      ) : (
        <Login />
      )}
    </div>
  );
};

export default App;