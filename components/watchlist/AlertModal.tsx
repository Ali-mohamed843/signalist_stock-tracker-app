'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createAlert, updateAlert } from '@/lib/actions/alert.actions';
import { toast } from 'sonner';

const ALERT_TYPE_OPTIONS = [
    { value: 'price', label: 'Price' },
];

const CONDITION_OPTIONS = [
    { value: 'upper', label: 'Greater than (>)' },
    { value: 'lower', label: 'Less than (<)' },
];

const FREQUENCY_OPTIONS = [
    { value: 'once_per_day', label: 'Once per day' },
    { value: 'once_per_hour', label: 'Once per hour' },
    { value: 'once_per_minute', label: 'Once per minute' },
];

const AlertModal = ({ alertId, alertData, action = 'create', open, setOpen }: AlertModalProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<{
        alertName: string;
        alertType: string;
        condition: 'upper' | 'lower';
        threshold: string | number;
        frequency: 'once_per_day' | 'once_per_hour' | 'once_per_minute';
    }>({
        alertName: alertData?.alertName || '',
        alertType: 'price',
        condition: (alertData?.alertType as 'upper' | 'lower') || 'upper',
        threshold: alertData?.threshold || '',
        frequency: 'once_per_day',
    });

    const isEdit = action === 'edit' && alertId;
    const symbol = alertData?.symbol || '';
    const company = alertData?.company || '';
    const stockIdentifier = company && symbol ? `${company} (${symbol})` : symbol || '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isEdit && alertId) {
                const result = await updateAlert(alertId, {
                    alertName: formData.alertName,
                    alertType: formData.condition,
                    threshold: Number(formData.threshold),
                    frequency: formData.frequency,
                });
                if (result.success) {
                    toast.success('Alert updated successfully');
                    setOpen(false);
                } else {
                    toast.error(result.error || 'Failed to update alert');
                }
            } else {
                const result = await createAlert({
                    symbol,
                    company,
                    alertName: formData.alertName,
                    alertType: formData.condition,
                    threshold: Number(formData.threshold),
                    frequency: formData.frequency,
                });
                if (result.success) {
                    toast.success('Alert created successfully');
                    setOpen(false);
                } else {
                    toast.error(result.error || 'Failed to create alert');
                }
            }
        } catch (error) {
            console.error('Failed to save alert:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="bg-gray-800 border-gray-600 text-gray-400 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white">
                        Price Alert
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                    {/* Alert Name */}
                    <div className="space-y-2">
                        <Label htmlFor="alertName" className="text-sm text-gray-400">Alert Name</Label>
                        <Input
                            id="alertName"
                            value={formData.alertName}
                            onChange={(e) => setFormData({ ...formData, alertName: e.target.value })}
                            placeholder="Apple at Discount!"
                            className="h-20 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 rounded-lg focus:border-yellow-500"
                            required
                        />
                    </div>

                    {/* Stock Identifier (read-only) */}
                    <div className="space-y-2">
                        <Label htmlFor="stockIdentifier" className="text-sm text-gray-400">Stock identifier</Label>
                        <Input
                            id="stockIdentifier"
                            value={stockIdentifier}
                            readOnly
                            className="h-20 bg-gray-700 border-gray-600 text-gray-400 rounded-lg cursor-not-allowed"
                        />
                    </div>

                    {/* Alert Type */}
                    <div className="space-y-2">
                        <Label htmlFor="alertType" className="text-sm text-gray-400">Alert type</Label>
                        <Select
                            value={formData.alertType}
                            onValueChange={(value) => setFormData({ ...formData, alertType: value })}
                        >
                            <SelectTrigger className="w-full h-20 bg-gray-700 border-gray-600 text-white rounded-lg">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600">
                                {ALERT_TYPE_OPTIONS.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                        className="text-white hover:bg-gray-600 focus:bg-gray-600"
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Condition */}
                    <div className="space-y-2">
                        <Label htmlFor="condition" className="text-sm text-gray-400">Condition</Label>
                        <Select
                            value={formData.condition}
                            onValueChange={(value) => setFormData({ ...formData, condition: value as 'upper' | 'lower' })}
                        >
                            <SelectTrigger className="w-full h-20 bg-gray-700 border-gray-600 text-white rounded-lg">
                                <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600">
                                {CONDITION_OPTIONS.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                        className="text-white hover:bg-gray-600 focus:bg-gray-600"
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Threshold Value */}
                    <div className="space-y-2">
                        <Label htmlFor="threshold" className="text-sm text-gray-400">Threshold value</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
                            <Input
                                id="threshold"
                                type="number"
                                step="1"
                                value={formData.threshold}
                                onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                                placeholder="eg. 140"
                                className="w-full h-20 pl-8 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 rounded-lg focus:border-yellow-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Frequency */}
                    <div className="space-y-2">
                        <Label htmlFor="frequency" className="text-sm text-gray-400">Frequency</Label>
                        <Select
                            value={formData.frequency}
                            onValueChange={(value) => setFormData({ ...formData, frequency: value as 'once_per_day' | 'once_per_hour' | 'once_per_minute' })}
                        >
                            <SelectTrigger className="w-full h-20 bg-gray-700 border-gray-600 text-white rounded-lg">
                                <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600">
                                {FREQUENCY_OPTIONS.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                        className="text-white hover:bg-gray-600 focus:bg-gray-600"
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Create Alert Button */}
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 text-black font-semibold text-base rounded-lg mt-6"
                        style={{ backgroundColor: '#FDD458', color: '#000' }}
                    >
                        {isLoading ? 'Creating...' : isEdit ? 'Update Alert' : 'Create Alert'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AlertModal;
