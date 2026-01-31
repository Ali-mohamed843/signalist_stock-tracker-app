'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { fetchJSON } from './finnhub.actions';
import { formatMarketCapValue } from '@/lib/utils';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

async function getCurrentUserId(): Promise<string | null> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        return session?.user?.id || null;
    } catch {
        return null;
    }
}

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
    if (!email) return [];

    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        if (!db) throw new Error('MongoDB connection not found');

        // Better Auth stores users in the "user" collection
        const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

        if (!user) return [];

        const userId = (user.id as string) || String(user._id || '');
        if (!userId) return [];

        const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
        return items.map((i) => String(i.symbol));
    } catch (err) {
        console.error('getWatchlistSymbolsByEmail error:', err);
        return [];
    }
}

export async function getWatchlistWithData(): Promise<StockWithData[]> {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    try {
        await connectToDatabase();
        const watchlistDocs = await Watchlist.find({ userId }).lean();

        const token = process.env.FINNHUB_API_KEY ?? process.env.NEXT_PUBLIC_FINNHUB_API_KEY ?? '';

        // Fetch real-time data for all stocks
        const watchlistWithData = await Promise.all(
            watchlistDocs.map(async (doc) => {
                let currentPrice = 0;
                let changePercent = 0;
                let marketCap = 'N/A';
                let peRatio = 'N/A';

                try {
                    // Fetch quote data
                    const quoteUrl = `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(doc.symbol)}&token=${token}`;
                    const quote = await fetchJSON<{ c?: number; dp?: number }>(quoteUrl, 60);
                    currentPrice = quote?.c ?? 0;
                    changePercent = quote?.dp ?? 0;

                    // Fetch profile for market cap
                    const profileUrl = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(doc.symbol)}&token=${token}`;
                    const profile = await fetchJSON<{ marketCapitalization?: number }>(profileUrl, 3600);
                    if (profile?.marketCapitalization) {
                        // API returns market cap in millions
                        marketCap = formatMarketCapValue(profile.marketCapitalization * 1e6);
                    }

                    // Fetch basic financials for P/E ratio
                    const financialsUrl = `${FINNHUB_BASE_URL}/stock/metric?symbol=${encodeURIComponent(doc.symbol)}&metric=all&token=${token}`;
                    const financials = await fetchJSON<{ metric?: { peBasicExclExtraTTM?: number } }>(financialsUrl, 3600);
                    if (financials?.metric?.peBasicExclExtraTTM) {
                        peRatio = financials.metric.peBasicExclExtraTTM.toFixed(1);
                    }
                } catch (e) {
                    console.error(`Error fetching data for ${doc.symbol}:`, e);
                }

                const sign = changePercent > 0 ? '+' : '';

                return {
                    userId: doc.userId,
                    symbol: doc.symbol,
                    company: doc.company,
                    addedAt: doc.addedAt,
                    currentPrice,
                    changePercent,
                    priceFormatted: currentPrice > 0 ? `$${currentPrice.toFixed(2)}` : 'N/A',
                    changeFormatted: changePercent !== 0 ? `${sign}${changePercent.toFixed(2)}%` : 'N/A',
                    marketCap,
                    peRatio,
                } as StockWithData;
            })
        );

        return watchlistWithData;
    } catch (err) {
        console.error('getWatchlistWithData error:', err);
        return [];
    }
}

export async function addToWatchlist(symbol: string, company: string): Promise<{ success: boolean; error?: string }> {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: 'Not authenticated' };

    try {
        await connectToDatabase();

        // Check if already exists
        const existing = await Watchlist.findOne({ userId, symbol: symbol.toUpperCase() });
        if (existing) {
            return { success: false, error: 'Stock already in watchlist' };
        }

        await Watchlist.create({
            userId,
            symbol: symbol.toUpperCase(),
            company,
        });

        revalidatePath('/watchlist');
        return { success: true };
    } catch (err) {
        console.error('addToWatchlist error:', err);
        return { success: false, error: 'Failed to add to watchlist' };
    }
}

export async function removeFromWatchlist(symbol: string): Promise<{ success: boolean; error?: string }> {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: 'Not authenticated' };

    try {
        await connectToDatabase();

        const result = await Watchlist.findOneAndDelete({ userId, symbol: symbol.toUpperCase() });

        if (!result) {
            return { success: false, error: 'Stock not found in watchlist' };
        }

        revalidatePath('/watchlist');
        return { success: true };
    } catch (err) {
        console.error('removeFromWatchlist error:', err);
        return { success: false, error: 'Failed to remove from watchlist' };
    }
}