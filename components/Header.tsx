import React, { useState } from 'react';

type View = 'dashboard' | 'masterdata' | 'products' | 'jumlahkonten' | 'sales' | 'productsales';

interface HeaderProps {
  userEmail: string | null;
  onLogout: () => void;
  currentView: View;
  onNavigate: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ userEmail, onLogout, currentView, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinkClasses = (view: View) => 
    `px-3 py-2 text-sm font-medium rounded-md cursor-pointer ${
      currentView === view
        ? 'bg-primary text-white'
        : 'text-text-secondary hover:bg-border-color hover:text-text-primary'
    }`;
  
  const mobileNavLinkClasses = (view: View) => 
    `block px-3 py-2 text-base font-medium rounded-md cursor-pointer ${
      currentView === view
        ? 'bg-primary text-white'
        : 'text-text-secondary hover:bg-border-color hover:text-text-primary'
    }`;
  
  const handleMobileNav = (view: View) => {
    onNavigate(view);
    setIsMenuOpen(false);
  };

  return (
    <header className="relative z-10 border-b bg-card border-border-color">
      <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            <h1 className="ml-3 text-xl font-bold md:text-2xl text-text-primary">Talent KPI Dashboard</h1>
            <nav className="hidden ml-10 space-x-4 md:flex">
              <a onClick={() => onNavigate('dashboard')} className={navLinkClasses('dashboard')}>
                Dashboard
              </a>
              <a onClick={() => onNavigate('masterdata')} className={navLinkClasses('masterdata')}>
                Master Data
              </a>
              <a onClick={() => onNavigate('products')} className={navLinkClasses('products')}>
                Input Postingan
              </a>
              <a onClick={() => onNavigate('jumlahkonten')} className={navLinkClasses('jumlahkonten')}>
                Jumlah Konten
              </a>
              <a onClick={() => onNavigate('productsales')} className={navLinkClasses('productsales')}>
                Penjualan Produk
              </a>
               <a onClick={() => onNavigate('sales')} className={navLinkClasses('sales')}>
                Sales Data
              </a>
            </nav>
          </div>
          <div className="flex items-center">
            <span className="hidden mr-4 text-sm text-text-secondary md:block">{userEmail}</span>
            <button
              onClick={onLogout}
              className="hidden px-4 py-2 text-sm font-medium text-white transition duration-150 ease-in-out border border-transparent rounded-md md:block bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Logout
            </button>
             {/* Hamburger Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-border-color focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {!isMenuOpen ? (
                  <svg className="block w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full md:hidden bg-card border-b border-border-color" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a onClick={() => handleMobileNav('dashboard')} className={mobileNavLinkClasses('dashboard')}>Dashboard</a>
            <a onClick={() => handleMobileNav('masterdata')} className={mobileNavLinkClasses('masterdata')}>Master Data</a>
            <a onClick={() => handleMobileNav('products')} className={mobileNavLinkClasses('products')}>Input Postingan</a>
            <a onClick={() => handleMobileNav('jumlahkonten')} className={mobileNavLinkClasses('jumlahkonten')}>Jumlah Konten</a>
            <a onClick={() => handleMobileNav('productsales')} className={mobileNavLinkClasses('productsales')}>Penjualan Produk</a>
            <a onClick={() => handleMobileNav('sales')} className={mobileNavLinkClasses('sales')}>Sales Data</a>
          </div>
           <div className="pt-4 pb-3 border-t border-border-color">
                <div className="flex items-center px-5">
                    <div className="ml-3">
                        <div className="text-base font-medium leading-none text-text-primary">{userEmail}</div>
                    </div>
                </div>
                <div className="px-2 mt-3 space-y-1">
                    <button
                        onClick={() => { onLogout(); setIsMenuOpen(false); }}
                        className="block w-full px-3 py-2 text-base font-medium text-left rounded-md text-text-secondary hover:text-text-primary hover:bg-border-color"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
      )}
    </header>
  );
};

export default Header;