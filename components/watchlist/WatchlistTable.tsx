'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Plus } from 'lucide-react';
import { WATCHLIST_TABLE_HEADER } from '@/lib/constants';
import AlertModal from './AlertModal';

const WatchlistTable = ({ watchlist }: WatchlistTableProps) => {
    const router = useRouter();
    const [alertModalOpen, setAlertModalOpen] = useState(false);
    const [selectedStock, setSelectedStock] = useState<{ symbol: string; company: string } | null>(null);

    const handleRowClick = (symbol: string) => {
        router.push(`/stocks/${symbol.toLowerCase()}`);
    };

    const handleAddAlert = (stock: StockWithData, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedStock({ symbol: stock.symbol, company: stock.company });
        setAlertModalOpen(true);
    };

    return (
        <>
            <div className="watchlist-table">
                <table className="w-full">
                    <thead>
                        <tr className="table-header-row">
                            {WATCHLIST_TABLE_HEADER.slice(0, -1).map((header) => (
                                <th
                                    key={header}
                                    className="table-header text-left py-3 px-4 text-sm font-medium"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {watchlist.map((stock) => (
                            <tr
                                key={stock.symbol}
                                className="table-row"
                                onClick={() => handleRowClick(stock.symbol)}
                            >
                                <td className="table-cell py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                        <span>{stock.company}</span>
                                    </div>
                                </td>
                                <td className="table-cell py-4 px-4 text-gray-400">
                                    {stock.symbol}
                                </td>
                                <td className="table-cell py-4 px-4">
                                    {stock.priceFormatted}
                                </td>
                                <td className={`table-cell py-4 px-4 ${stock.changePercent && stock.changePercent > 0
                                    ? 'text-green-500'
                                    : stock.changePercent && stock.changePercent < 0
                                        ? 'text-red-500'
                                        : 'text-gray-400'
                                    }`}>
                                    {stock.changeFormatted}
                                </td>
                                <td className="table-cell py-4 px-4 text-gray-400">
                                    {stock.marketCap}
                                </td>
                                <td className="table-cell py-4 px-4 text-gray-400">
                                    {stock.peRatio}
                                </td>
                                <td className="table-cell py-4 px-4">
                                    <button
                                        className="add-alert"
                                        onClick={(e) => handleAddAlert(stock, e)}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Alert
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Alert Modal */}
            {selectedStock && (
                <AlertModal
                    open={alertModalOpen}
                    setOpen={setAlertModalOpen}
                    alertData={{
                        symbol: selectedStock.symbol,
                        company: selectedStock.company,
                        alertName: '',
                        alertType: 'upper',
                        threshold: '',
                    }}
                />
            )}
        </>
    );
};

export default WatchlistTable;
