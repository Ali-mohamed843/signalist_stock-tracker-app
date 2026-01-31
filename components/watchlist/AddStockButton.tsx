'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchCommand from '@/components/SearchCommand';

interface AddStockButtonProps {
    initialStocks: StockWithWatchlistStatus[];
}

const AddStockButton = ({ initialStocks }: AddStockButtonProps) => {
    return (
        <SearchCommand
            renderAs="button"
            label="Add Stock"
            initialStocks={initialStocks}
        />
    );
};

export default AddStockButton;
