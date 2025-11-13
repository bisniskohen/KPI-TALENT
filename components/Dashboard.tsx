import React, { useState, useEffect, useMemo } from 'react';
import { subscribeToCollection } from '../services/firestoreService';
import type { Talent, Store, Product, Sale, Akun, ProductPost, ProductSale } from '../types';
import LoadingSpinner from './LoadingSpinner';
import SalesForm from './SalesForm';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SalesMetricsChart from './SalesMetricsChart';

const Dashboard: React.FC = () => {
  const [talents, setTalents] = useState<Talent[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [akuns, setAkuns] = useState<Akun[]>([]);
  const [posts, setPosts] = useState<ProductPost[]>([]);
  const [productSales, setProductSales] = useState<ProductSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('all');

  useEffect(() => {
    setLoading(true);
    setError(null);

    const collectionsToLoad = {
        talents: false, stores: false, products: false, sales: false, akuns: false, posts: false, productSales: false
    };

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
            subscribeToCollection<Store>('NAMA TOKO', data => {
                setStores(data);
                if (!collectionsToLoad.stores) { collectionsToLoad.stores = true; checkAllLoaded(); }
            }),
            subscribeToCollection<Product>('PRODUK', data => {
                setProducts(data);
                if (!collectionsToLoad.products) { collectionsToLoad.products = true; checkAllLoaded(); }
            }),
            subscribeToCollection<Sale>('sales', data => {
                setSales(data);
                if (!collectionsToLoad.sales) { collectionsToLoad.sales = true; checkAllLoaded(); }
            }),
            subscribeToCollection<Akun>('NAMA AKUN', data => {
                setAkuns(data);
                if (!collectionsToLoad.akuns) { collectionsToLoad.akuns = true; checkAllLoaded(); }
            }),
            subscribeToCollection<ProductPost>('productPosts', data => {
                setPosts(data);
                if (!collectionsToLoad.posts) { collectionsToLoad.posts = true; checkAllLoaded(); }
            }),
            subscribeToCollection<ProductSale>('productSales', data => {
                setProductSales(data);
                if (!collectionsToLoad.productSales) { collectionsToLoad.productSales = true; checkAllLoaded(); }
            }),
        ];

        return () => unsubscribers.forEach(unsub => unsub());
    } catch (err) {
        setError('Failed to subscribe to dashboard data. Please check your Firestore collections and permissions.');
        console.error(err);
        setLoading(false);
    }
  }, []);

  const dashboardData = useMemo(() => {
    if (loading) return null;

    const start = startDate ? new Date(startDate) : null;
    if (start) start.setHours(0, 0, 0, 0);
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    const filteredSales = sales.filter(sale => {
        const saleDate = sale.saleDate.toDate();
        if (start && saleDate < start) return false;
        if (end && saleDate > end) return false;
        return true;
    });

    const filteredPosts = posts.filter(post => {
        const postDate = post.date.toDate();
        if (start && postDate < start) return false;
        if (end && postDate > end) return false;
        return true;
    });
    
    const filteredProductSales = productSales.filter(sale => {
        const saleDate = sale.date.toDate();
        if (start && saleDate < start) return false;
        if (end && saleDate > end) return false;
        return true;
    });

    const talentMap = new Map(talents.map(t => [t.id, t.nama]));
    const akunMap = new Map(akuns.map(a => [a.id, a.nama]));

    const totalRevenue = filteredSales.reduce((acc, sale) => acc + sale.totalValue, 0);
    const totalCommission = filteredSales.reduce((acc, sale) => acc + sale.estimatedCommission, 0);
    const totalViews = filteredSales.reduce((acc, sale) => acc + sale.productViews, 0);
    const totalClicks = filteredSales.reduce((acc, sale) => acc + sale.productClicks, 0);

    const totalSalesCount = filteredSales.length;
    const totalPosts = filteredPosts.length;
    
    const salesByTalent = new Map<string, number>();
    filteredSales.forEach(sale => {
      const currentSales = salesByTalent.get(sale.talentId) || 0;
      salesByTalent.set(sale.talentId, currentSales + sale.totalValue);
    });

    const topTalentEntry = [...salesByTalent.entries()].sort((a, b) => b[1] - a[1])[0];
    const topTalent = topTalentEntry ? { name: talentMap.get(topTalentEntry[0]) || 'Unknown' } : { name: 'N/A' };
    
    const topPerformingTalents = [...salesByTalent.entries()]
        .map(([id, totalValue]) => ({
            id,
            name: talentMap.get(id) || 'Unknown',
            totalValue,
        }))
        .sort((a, b) => b.totalValue - a.totalValue);

    const salesByAccountMap = new Map<string, { totalValue: number, totalViews: number }>();
    filteredSales.forEach(sale => {
      const current = salesByAccountMap.get(sale.akunId) || { totalValue: 0, totalViews: 0 };
      salesByAccountMap.set(sale.akunId, {
        totalValue: current.totalValue + sale.totalValue,
        totalViews: current.totalViews + sale.productViews
      });
    });
    const salesByAccount = [...salesByAccountMap.entries()]
      .map(([id, data]) => ({
        id,
        name: akunMap.get(id) || 'Unknown',
        totalValue: data.totalValue,
        totalViews: data.totalViews,
      }))
      .sort((a, b) => b.totalValue - a.totalValue);
      
    const accountAnalysisMap = new Map<string, {
      promotedStores: Set<string>;
      promotedProducts: Set<string>;
      totalPosts: number;
    }>();

    filteredPosts.forEach(post => {
        if (!accountAnalysisMap.has(post.akunId)) {
            accountAnalysisMap.set(post.akunId, {
                promotedStores: new Set(),
                promotedProducts: new Set(),
                totalPosts: 0,
            });
        }
        const current = accountAnalysisMap.get(post.akunId)!;
        current.promotedStores.add(post.storeId);
        current.promotedProducts.add(post.productId);
        current.totalPosts += 1;
    });

    const accountAnalysis = [...accountAnalysisMap.entries()]
        .map(([akunId, data]) => ({
            id: akunId,
            name: akunMap.get(akunId) || 'Unknown Account',
            promotedStoresCount: data.promotedStores.size,
            promotedProductsCount: data.promotedProducts.size,
            totalPosts: data.totalPosts,
        }))
        .sort((a, b) => b.totalPosts - a.totalPosts);

    const allSalesMetrics = [
        { name: 'Total GMV', value: totalRevenue, type: 'currency' },
        { name: 'Total Estimasi Komisi', value: totalCommission, type: 'currency' },
        { name: 'Total Produk Dilihat', value: totalViews, type: 'number' },
        { name: 'Total Produk Diklik', value: totalClicks, type: 'number' },
    ];

    const salesMetrics = selectedMetric === 'all' 
        ? allSalesMetrics 
        : allSalesMetrics.filter(metric => metric.name === selectedMetric);

    return {
      totalRevenue,
      totalSalesCount,
      totalPosts,
      topTalent,
      topPerformingTalents,
      salesByAccount,
      accountAnalysis,
      salesMetrics,
      allSalesMetrics,
    };
  }, [loading, sales, talents, stores, products, akuns, posts, productSales, startDate, endDate, selectedMetric]);
  
  const handleSaleAdded = () => {
    // Data updates in real-time, just close the modal.
    setIsModalOpen(false);
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  if (loading || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 m-4 text-red-700 bg-red-100 border border-red-400 rounded-md">{error}</div>;
  }

  return (
    <div className="p-4 mx-auto max-w-7xl sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-text-primary">Dashboard Summary</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 font-semibold text-white transition duration-150 ease-in-out rounded-lg shadow-md bg-secondary hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
        >
          + Add Sale
        </button>
      </div>

      {/* Filter Section */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 mb-8 border rounded-lg bg-card border-border-color">
        <div className="flex flex-wrap items-center gap-4">
          <h3 className="text-lg font-semibold text-text-primary">Filter Tanggal:</h3>
          <div className="relative">
            <label htmlFor="start-date" className="text-sm font-medium text-text-secondary">Dari</label>
            <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{colorScheme: 'dark'}} className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm bg-input-bg border-border-color focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
          </div>
          <div className="relative">
            <label htmlFor="end-date" className="text-sm font-medium text-text-secondary">Sampai</label>
            <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{colorScheme: 'dark'}} className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm bg-input-bg border-border-color focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
          </div>
        </div>
        <button
          onClick={handleResetFilters}
          className="px-4 py-2 text-sm font-medium border rounded-md text-text-primary bg-border-color border-border-color hover:bg-gray-600"
        >
          Reset Filter
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 border rounded-lg bg-card border-border-color">
          <h3 className="text-lg font-medium text-text-secondary">Total Revenue</h3>
          <p className="mt-2 text-3xl font-bold text-text-primary">
            Rp {dashboardData.totalRevenue.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="p-6 border rounded-lg bg-card border-border-color">
          <h3 className="text-lg font-medium text-text-secondary">Total Sales Transactions</h3>
          <p className="mt-2 text-3xl font-bold text-text-primary">{dashboardData.totalSalesCount}</p>
        </div>
        <div className="p-6 border rounded-lg bg-card border-border-color">
          <h3 className="text-lg font-medium text-text-secondary">Top Performing Talent</h3>
          <p className="mt-2 text-3xl font-bold truncate text-text-primary">
            {dashboardData.topTalent.name}
          </p>
        </div>
        <div className="p-6 border rounded-lg bg-card border-border-color">
          <h3 className="text-lg font-medium text-text-secondary">Total Content Posts</h3>
          <p className="mt-2 text-3xl font-bold text-text-primary">{dashboardData.totalPosts}</p>
        </div>
      </div>

      {/* Data Tables & Charts */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="p-6 border rounded-lg bg-card border-border-color">
           <h3 className="mb-4 text-lg font-semibold text-text-primary">Performa Host Terbaik (Top 5)</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.topPerformingTalents.slice(0, 5)} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" tickFormatter={(value) => `Rp${(Number(value)/1000000)}jt`} stroke="#9ca3af"/>
                    <YAxis dataKey="name" type="category" width={80} stroke="#9ca3af"/>
                    <Tooltip
                        cursor={{fill: '#374151'}}
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                        formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'GMV']}
                    />
                    <Bar dataKey="totalValue" fill="#4f46e5" name="GMV" />
                </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="p-6 border rounded-lg bg-card border-border-color">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">Penjualan per Akun</h3>
          <div className="overflow-x-auto max-h-80">
             <table className="w-full text-left table-auto">
              <thead>
                <tr className="border-b bg-background border-border-color">
                  <th className="px-4 py-2 text-sm font-medium text-text-secondary">Akun</th>
                  <th className="px-4 py-2 text-sm font-medium text-right text-text-secondary">Revenue</th>
                  <th className="px-4 py-2 text-sm font-medium text-right text-text-secondary">Total Tayangan</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.salesByAccount.slice(0, 10).map((akun) => (
                  <tr key={akun.id} className="border-b border-border-color hover:bg-background">
                    <td className="px-4 py-2 text-sm text-text-primary">{akun.name}</td>
                    <td className="px-4 py-2 text-sm font-medium text-right text-text-primary">
                      Rp {akun.totalValue.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-right text-text-primary">
                      {akun.totalViews.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
                {dashboardData.salesByAccount.length === 0 && (<tr><td colSpan={3} className="py-8 text-center text-text-secondary">No sales data.</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </div>

       {/* New Full-Width Chart Section */}
        <div className="p-6 mt-8 border rounded-lg bg-card border-border-color">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Analisa Metrik Penjualan</h3>
              <div className="relative">
                  <label htmlFor="metric-filter" className="sr-only">Filter Metrik</label>
                  <select 
                      id="metric-filter" 
                      value={selectedMetric}
                      onChange={e => setSelectedMetric(e.target.value)}
                      className="block w-full px-3 py-2 pr-8 border rounded-md shadow-sm bg-input-bg border-border-color focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  >
                      <option value="all">Semua Metrik</option>
                      {dashboardData.allSalesMetrics.map(metric => (
                          <option key={metric.name} value={metric.name}>{metric.name}</option>
                      ))}
                  </select>
              </div>
            </div>
            <SalesMetricsChart data={dashboardData.salesMetrics} />
        </div>

      {/* New Detailed Analysis Section */}
      <div className="p-6 mt-8 border rounded-lg bg-card border-border-color">
        <h3 className="mb-4 text-lg font-semibold text-text-primary">Analisa Detail per Akun</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
                <thead>
                    <tr className="border-b bg-background border-border-color">
                        <th className="px-4 py-3 text-sm font-medium text-text-secondary">Nama Akun</th>
                        <th className="px-4 py-3 text-sm font-medium text-right text-text-secondary">Total Toko Dipromosikan</th>
                        <th className="px-4 py-3 text-sm font-medium text-right text-text-secondary">Total Produk Dipromosikan</th>
                        <th className="px-4 py-3 text-sm font-medium text-right text-text-secondary">Jumlah Postingan</th>
                    </tr>
                </thead>
                <tbody>
                    {dashboardData.accountAnalysis.map((akun) => (
                        <tr key={akun.id} className="border-b border-border-color hover:bg-background">
                            <td className="px-4 py-3 text-sm text-text-primary">{akun.name}</td>
                            <td className="px-4 py-3 text-sm font-medium text-right text-text-primary">{akun.promotedStoresCount}</td>
                            <td className="px-4 py-3 text-sm font-medium text-right text-text-primary">{akun.promotedProductsCount}</td>
                            <td className="px-4 py-3 text-sm font-medium text-right text-text-primary">{akun.totalPosts}</td>
                        </tr>
                    ))}
                    {dashboardData.accountAnalysis.length === 0 && (
                        <tr>
                            <td colSpan={4} className="py-8 text-center text-text-secondary">No account data available for the selected period.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>

      {isModalOpen && (
        <SalesForm
          talents={talents}
          akuns={akuns}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaleAdded}
        />
      )}
    </div>
  );
};

export default Dashboard;