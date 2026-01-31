'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { getAlertText, formatPrice, getChangeColorClass, formatChangePercent } from '@/lib/utils';

// Stock logo component with fallback
const StockLogo = ({ symbol, company }: { symbol: string; company: string }) => {
    // Use first letter as fallback
    const initial = company.charAt(0).toUpperCase();

    // Color mapping for common stocks
    const getLogoColor = (sym: string) => {
        const colors: Record<string, string> = {
            'AAPL': 'bg-gray-600',
            'MSFT': 'bg-blue-600',
            'GOOGL': 'bg-red-500',
            'META': 'bg-blue-500',
            'TSLA': 'bg-red-600',
            'NVDA': 'bg-green-600',
            'AMZN': 'bg-orange-500',
        };
        return colors[sym] || 'bg-gray-600';
    };

    return (
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${getLogoColor(symbol)} text-white font-bold text-sm`}>
            {initial}
        </div>
    );
};

// Frequency badge component
const FrequencyBadge = ({ frequency }: { frequency?: string }) => {
    const getLabel = () => {
        switch (frequency) {
            case 'once_per_minute': return 'Once per minute';
            case 'once_per_hour': return 'Once per hour';
            case 'once_per_day':
            default: return 'Once per day';
        }
    };

    return (
        <span className="text-xs text-yellow-600 bg-yellow-600/10 px-2 py-1 rounded">
            {getLabel()}
        </span>
    );
};

const AlertsList = ({ alertData }: AlertsListProps) => {
    const handleEdit = (alertId: string) => {
        // Edit functionality will be handled by parent
        console.log('Edit alert:', alertId);
    };

    const handleDelete = async (alertId: string) => {
        // Delete functionality will be handled by parent
        console.log('Delete alert:', alertId);
    };

    if (!alertData || alertData.length === 0) {
        return (
            <div className="alert-list">
                <div className="alert-empty">
                    <p className="text-gray-500">No alerts set</p>
                    <p className="text-sm text-gray-600 mt-1">
                        Create alerts to get notified when stock prices hit your targets
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="alert-list scrollbar-hide-default">
            {alertData.map((alert) => (
                <div key={alert.id} className="alert-item">
                    <div className="flex items-start gap-3 mb-3">
                        <StockLogo symbol={alert.symbol} company={alert.company} />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-gray-300 truncate">{alert.company}</span>
                                <span className={`text-sm font-medium ${getChangeColorClass(alert.changePercent)}`}>
                                    {alert.symbol}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-white font-bold text-lg">
                                    {formatPrice(alert.currentPrice)}
                                </span>
                                <span className={`text-sm ${getChangeColorClass(alert.changePercent)}`}>
                                    {formatChangePercent(alert.changePercent)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="alert-details">
                        <div>
                            <span className="text-gray-500 text-sm">Alert:</span>
                            <p className="text-gray-300 font-medium">{getAlertText(alert)}</p>
                        </div>
                        <FrequencyBadge frequency={(alert as any).frequency} />
                    </div>

                    <div className="alert-actions">
                        <button
                            onClick={() => handleEdit(alert.id)}
                            className="alert-update-btn p-2"
                            title="Edit alert"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(alert.id)}
                            className="alert-delete-btn p-2"
                            title="Delete alert"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AlertsList;
