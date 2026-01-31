'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AlertModal from './AlertModal';

interface CreateAlertButtonProps {
    stocks: StockWithData[];
}

const CreateAlertButton = ({ stocks }: CreateAlertButtonProps) => {
    const [open, setOpen] = useState(false);
    const [selectedStock, setSelectedStock] = useState<{ symbol: string; company: string } | null>(null);

    const handleClick = () => {
        // Use first stock from watchlist as default, or empty
        if (stocks.length > 0) {
            setSelectedStock({ symbol: stocks[0].symbol, company: stocks[0].company });
        }
        setOpen(true);
    };

    return (
        <>
            <Button className="add-alert" onClick={handleClick}>
                <Plus className="h-4 w-4" />
                Create Alert
            </Button>

            <AlertModal
                open={open}
                setOpen={setOpen}
                alertData={selectedStock ? {
                    symbol: selectedStock.symbol,
                    company: selectedStock.company,
                    alertName: '',
                    alertType: 'upper',
                    threshold: '',
                } : undefined}
            />
        </>
    );
};

export default CreateAlertButton;
