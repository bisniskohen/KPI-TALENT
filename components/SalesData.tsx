import React, { useState, useEffect, useMemo } from 'react';
import { subscribeToCollection, deleteSale } from '../services/firestoreService';
import type { Talent, Sale, SaleWithDetails, Akun } from '../types';
import LoadingSpinner from './LoadingSpinner';
import SalesForm from './SalesForm';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

type SortKeys = keyof SaleWithDetails;
type SortDirection = 'ascending' | 'descending';

const SalesData: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [akuns, setAkuns] = useState<Akun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saleToEdit, setSaleToEdit] = useState<SaleWithDetails | null>(null);

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: SortKeys; direction: SortDirection }>({ key: 'saleDate', direction: 'descending' });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedAkun, setSelectedAkun] = useState('');
  const [selectedTalent, setSelectedTalent] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const collectionsToLoad = { sales: false, talents: false, akuns: false };

    const checkAllLoaded = () => {
        if (Object.values(collectionsToLoad).every(loaded => loaded)) {
            setLoading(false);
        }
    };

    try {
        const unsubscribers = [
            subscribeToCollection<Sale>('sales', data => {
                setSales(data);
                if (!collectionsToLoad.sales) { collectionsToLoad.sales = true; checkAllLoaded(); }
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
        setError('Failed to subscribe to sales data.');
        console.error(err);
        setLoading(false);
    }
  }, []);

  const salesWithDetails: SaleWithDetails[] = useMemo(() => {
    const talentMap = new Map(talents.map(t => [t.id, t.nama]));
    const akunMap = new Map(akuns.map(a => [a.id, a.nama]));

    return sales.map(sale => ({
      ...sale,
      talentName: talentMap.get(sale.talentId) || 'Unknown',
      akunName: akunMap.get(sale.akunId) || 'Unknown',
    }));
  }, [sales, talents, akuns]);

  const filteredSales = useMemo(() => {
    return salesWithDetails.filter(sale => {
      if (!sale.saleDate) return false; // Exclude sales without a date
      const saleDate = sale.saleDate.toDate();
      
      // Date filtering
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (saleDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (saleDate > end) return false;
      }
      // Akun filtering
      if (selectedAkun && sale.akunId !== selectedAkun) {
        return false;
      }
      // Talent (Host) filtering
      if (selectedTalent && sale.talentId !== selectedTalent) {
        return false;
      }
      return true;
    });
  }, [salesWithDetails, startDate, endDate, selectedAkun, selectedTalent]);

  const sortedSales = useMemo(() => {
    let sortableItems = [...filteredSales];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;
        
        let comparison = 0;
        if (aValue > bValue) {
          comparison = 1;
        } else if (aValue < bValue) {
          comparison = -1;
        }
        
        return sortConfig.direction === 'ascending' ? comparison : -comparison;
      });
    }
    return sortableItems;
  }, [filteredSales, sortConfig]);
  
  const totalPages = Math.ceil(sortedSales.length / itemsPerPage);
  const currentSales = sortedSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const requestSort = (key: SortKeys) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const handleOpenModal = (sale: SaleWithDetails | null = null) => {
    setSaleToEdit(sale);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSaleToEdit(null);
    setIsModalOpen(false);
  };

  const handleSave = () => {
    handleCloseModal();
  };

  const handleDelete = async (saleId: string) => {
    if (window.confirm('Are you sure you want to delete this sale record? This action cannot be undone.')) {
      try {
        setError(null);
        await deleteSale(saleId);
      } catch (err) {
        setError('Failed to delete sale. Please try again.');
        console.error(err);
      }
    }
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedAkun('');
    setSelectedTalent('');
    setCurrentPage(1);
  };
  
  const handleExportExcel = () => {
    const dataToExport = sortedSales.map(sale => ({
        'Tanggal': sale.saleDate ? sale.saleDate.toDate().toLocaleDateString('id-ID') : 'N/A',
        'Nama Host': sale.talentName,
        'Nama Akun': sale.akunName,
        'GMV (Rp)': sale.totalValue,
        'Est. Komisi (Rp)': sale.estimatedCommission,
        'Produk Dilihat': sale.productViews,
        'Produk Diklik': sale.productClicks,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SalesData');
    XLSX.writeFile(workbook, 'SalesData.xlsx');
  };

  const handleExportPdf = () => {
      const doc = new jsPDF();
      doc.text('Sales Data Report', 14, 15);
      const tableColumn = ['Tanggal', 'Nama Host', 'Nama Akun', 'GMV (Rp)', 'Est. Komisi (Rp)', 'Dilihat', 'Diklik'];
      const tableRows: (string | number)[][] = [];

      sortedSales.forEach(sale => {
          const saleData = [
              sale.saleDate ? sale.saleDate.toDate().toLocaleDateString('id-ID') : 'N/A',
              sale.talentName,
              sale.akunName,
              sale.totalValue.toLocaleString('id-ID'),
              sale.estimatedCommission.toLocaleString('id-ID'),
              sale.productViews.toLocaleString('id-ID'),
              sale.productClicks.toLocaleString('id-ID')
          ];
          tableRows.push(saleData);
      });

      autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 20,
          headStyles: { fillColor: [79, 70, 229] }, // primary color
          theme: 'striped',
      });

      doc.save('SalesData.pdf');
  };

  const getSortIndicator = (key: SortKeys) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  const SortableHeader = ({ tkey, label, align = 'left' }: { tkey: SortKeys; label: string; align?: 'left' | 'right' }) => (
    <th className={`px-4 py-3 text-sm font-medium cursor-pointer text-text-secondary text-${align}`} onClick={() => requestSort(tkey)}>
      {label} {getSortIndicator(tkey)}
    </th>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-4 mx-auto max-w-7xl sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-text-primary">All Sales Data</h2>
        <div className="flex space-x-2">
            <button onClick={() => handleOpenModal()} className="px-4 py-2 text-sm font-medium text-white rounded-md bg-secondary hover:bg-secondary/90">
                + Add Sale
            </button>
            <button onClick={handleExportExcel} className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-primary/90">
                Export to Excel
            </button>
            <button onClick={handleExportPdf} className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-primary/90">
                Export to PDF
            </button>
        </div>
      </div>
      {error && <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded-md">{error}</div>}

      {/* Filter Section */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 mb-8 border rounded-lg bg-card border-border-color">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <div className="relative">
            <label htmlFor="start-date" className="block text-sm font-medium text-text-secondary">Dari Tanggal</label>
            <input type="date" id="start-date" value={startDate} onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }} style={{colorScheme: 'dark'}} className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm bg-input-bg border-border-color focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
          </div>
          <div className="relative">
            <label htmlFor="end-date" className="block text-sm font-medium text-text-secondary">Sampai Tanggal</label>
            <input type="date" id="end-date" value={endDate} onChange={e => { setEndDate(e.target.value); setCurrentPage(1); }} style={{colorScheme: 'dark'}} className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm bg-input-bg border-border-color focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
          </div>
          <div className="relative">
             <label htmlFor="akun-filter" className="block text-sm font-medium text-text-secondary">Akun</label>
             <select id="akun-filter" value={selectedAkun} onChange={e => { setSelectedAkun(e.target.value); setCurrentPage(1); }} className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm bg-input-bg border-border-color focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                <option value="">Semua Akun</option>
                {akuns.map(akun => <option key={akun.id} value={akun.id}>{akun.nama}</option>)}
             </select>
          </div>
          <div className="relative">
             <label htmlFor="talent-filter" className="block text-sm font-medium text-text-secondary">Host</label>
             <select id="talent-filter" value={selectedTalent} onChange={e => { setSelectedTalent(e.target.value); setCurrentPage(1); }} className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm bg-input-bg border-border-color focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                <option value="">Semua Host</option>
                {talents.map(talent => <option key={talent.id} value={talent.id}>{talent.nama}</option>)}
             </select>
          </div>
        </div>
        <button
          onClick={handleResetFilters}
          className="px-4 py-2 mt-4 text-sm font-medium border rounded-md self-end text-text-primary bg-border-color border-border-color hover:bg-gray-600"
        >
          Reset Filter
        </button>
      </div>


      <div className="p-6 border rounded-lg bg-card border-border-color">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="border-b bg-background border-border-color">
                <SortableHeader tkey="saleDate" label="Date" />
                <SortableHeader tkey="talentName" label="Nama Host" />
                <SortableHeader tkey="akunName" label="Nama Akun" />
                <SortableHeader tkey="totalValue" label="GMV" align="right"/>
                <SortableHeader tkey="estimatedCommission" label="Est. Komisi" align="right"/>
                <SortableHeader tkey="productViews" label="Dilihat" align="right"/>
                <SortableHeader tkey="productClicks" label="Diklik" align="right"/>
                <th className="px-4 py-3 text-sm font-medium text-right text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentSales.map((sale) => (
                <tr key={sale.id} className="border-b border-border-color hover:bg-background">
                  <td className="px-4 py-3 text-sm text-text-primary">{sale.saleDate ? sale.saleDate.toDate().toLocaleDateString() : 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{sale.talentName}</td>
                   <td className="px-4 py-3 text-sm text-text-primary">{sale.akunName}</td>
                  <td className="px-4 py-3 text-sm font-medium text-right text-text-primary">
                    Rp {sale.totalValue.toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-right text-text-primary">
                    Rp {sale.estimatedCommission.toLocaleString('id-ID')}
                  </td>
                   <td className="px-4 py-3 text-sm text-right text-text-primary">{sale.productViews.toLocaleString('id-ID')}</td>
                   <td className="px-4 py-3 text-sm text-right text-text-primary">{sale.productClicks.toLocaleString('id-ID')}</td>
                   <td className="px-4 py-3 text-sm font-medium text-right">
                    <button onClick={() => handleOpenModal(sale)} className="text-primary hover:text-primary/80">Edit</button>
                    <button onClick={() => handleDelete(sale.id)} className="ml-4 text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
               {sortedSales.length === 0 && (
                <tr>
                    <td colSpan={8} className="py-8 text-center text-text-secondary">No sales data found for the selected filters.</td>
                </tr>
               )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
                 <span className="text-sm text-text-secondary">
                    Halaman {currentPage} dari {totalPages}
                </span>
                <div className="flex space-x-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm border rounded-md text-text-primary bg-card border-border-color disabled:opacity-50 hover:bg-border-color">
                        Sebelumnya
                    </button>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 text-sm border rounded-md text-text-primary bg-card border-border-color disabled:opacity-50 hover:bg-border-color">
                        Berikutnya
                    </button>
                </div>
            </div>
        )}
      </div>

      {isModalOpen && (
        <SalesForm
            saleToEdit={saleToEdit}
            talents={talents}
            akuns={akuns}
            onClose={handleCloseModal}
            onSave={handleSave}
        />
      )}
    </div>
  );
};

export default SalesData;