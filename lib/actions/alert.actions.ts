'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Alert, type AlertItem } from '@/database/models/alert.model';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { fetchJSON } from './finnhub.actions';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

async function getCurrentUserId(): Promise<string | null> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        return session?.user?.id || null;
    } catch {
        return null;
    }
}

export async function getAlerts(): Promise<Alert[]> {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    try {
        await connectToDatabase();
        const alertDocs = await Alert.find({ userId }).lean();

        const token = process.env.FINNHUB_API_KEY ?? process.env.NEXT_PUBLIC_FINNHUB_API_KEY ?? '';

        // Fetch current prices for all alert symbols
        const alerts = await Promise.all(
            alertDocs.map(async (doc) => {
                let currentPrice = 0;
                let changePercent = 0;

                try {
                    const url = `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(doc.symbol)}&token=${token}`;
                    const quote = await fetchJSON<{ c?: number; dp?: number }>(url, 60);
                    currentPrice = quote?.c ?? 0;
                    changePercent = quote?.dp ?? 0;
                } catch (e) {
                    console.error(`Error fetching quote for ${doc.symbol}:`, e);
                }

                return {
                    id: String(doc._id),
                    symbol: doc.symbol,
                    company: doc.company,
                    alertName: doc.alertName,
                    alertType: doc.alertType,
                    threshold: doc.threshold,
                    currentPrice,
                    changePercent,
                    frequency: doc.frequency,
                } as Alert;
            })
        );

        return alerts;
    } catch (err) {
        console.error('getAlerts error:', err);
        return [];
    }
}

export async function createAlert(data: {
    symbol: string;
    company: string;
    alertName: string;
    alertType: 'upper' | 'lower';
    threshold: number;
    frequency?: 'once_per_day' | 'once_per_hour' | 'once_per_minute';
}): Promise<{ success: boolean; error?: string }> {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: 'Not authenticated' };

    try {
        await connectToDatabase();

        await Alert.create({
            userId,
            symbol: data.symbol.toUpperCase(),
            company: data.company,
            alertName: data.alertName,
            alertType: data.alertType,
            threshold: data.threshold,
            frequency: data.frequency || 'once_per_day',
        });

        revalidatePath('/watchlist');
        return { success: true };
    } catch (err) {
        console.error('createAlert error:', err);
        return { success: false, error: 'Failed to create alert' };
    }
}

export async function updateAlert(
    alertId: string,
    data: {
        alertName?: string;
        alertType?: 'upper' | 'lower';
        threshold?: number;
        frequency?: 'once_per_day' | 'once_per_hour' | 'once_per_minute';
    }
): Promise<{ success: boolean; error?: string }> {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: 'Not authenticated' };

    try {
        await connectToDatabase();

        const result = await Alert.findOneAndUpdate(
            { _id: alertId, userId },
            { $set: data },
            { new: true }
        );

        if (!result) {
            return { success: false, error: 'Alert not found' };
        }

        revalidatePath('/watchlist');
        return { success: true };
    } catch (err) {
        console.error('updateAlert error:', err);
        return { success: false, error: 'Failed to update alert' };
    }
}

export async function deleteAlert(alertId: string): Promise<{ success: boolean; error?: string }> {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: 'Not authenticated' };

    try {
        await connectToDatabase();

        const result = await Alert.findOneAndDelete({ _id: alertId, userId });

        if (!result) {
            return { success: false, error: 'Alert not found' };
        }

        revalidatePath('/watchlist');
        return { success: true };
    } catch (err) {
        console.error('deleteAlert error:', err);
        return { success: false, error: 'Failed to delete alert' };
    }
}
