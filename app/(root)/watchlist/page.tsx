import { Star } from 'lucide-react';
import { WatchlistTable, AlertsList, WatchlistNews, AddStockButton } from '@/components/watchlist';
import CreateAlertButton from '@/components/watchlist/CreateAlertButton';
import { getWatchlistWithData } from '@/lib/actions/watchlist.actions';
import { getAlerts } from '@/lib/actions/alert.actions';
import { getNews, searchStocks } from '@/lib/actions/finnhub.actions';

const WatchlistPage = async () => {
    // Fetch watchlist data
    const watchlist = await getWatchlistWithData();
    const alerts = await getAlerts();
    const initialStocks = await searchStocks();

    // Get symbols for news
    const symbols = watchlist.map((item) => item.symbol);
    const news = symbols.length > 0 ? await getNews(symbols) : [];

    // Check if watchlist is empty
    const isEmpty = watchlist.length === 0;

    if (isEmpty) {
        return (
            <div className="flex watchlist-empty-container">
                <div className="watchlist-empty">
                    <Star className="watchlist-star" />
                    <h2 className="empty-title">Your watchlist is empty</h2>
                    <p className="empty-description">
                        Start tracking your favorite stocks by adding them to your watchlist.
                        You'll be able to monitor prices, set alerts, and stay updated with relevant news.
                    </p>
                    <AddStockButton initialStocks={initialStocks} />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen text-gray-400 gap-8">
            {/* Watchlist and Alerts Section */}
            <section className="watchlist-container">
                {/* Watchlist Table */}
                <div className="watchlist">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="watchlist-title">Watchlist</h1>
                        <AddStockButton initialStocks={initialStocks} />
                    </div>
                    <WatchlistTable watchlist={watchlist} />
                </div>

                {/* Alerts Sidebar */}
                <div className="flex watchlist-alerts">
                    <div className="flex items-center justify-between w-full mb-4">
                        <h2 className="watchlist-title">Alerts</h2>
                        <CreateAlertButton stocks={watchlist} />
                    </div>
                    <AlertsList alertData={alerts} />
                </div>
            </section>

            {/* News Section */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="watchlist-title">News</h2>
                </div>
                <WatchlistNews news={news} />
            </section>
        </div>
    );
};

export default WatchlistPage;
