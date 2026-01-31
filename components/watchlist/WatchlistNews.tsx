import Link from 'next/link';
import { formatTimeAgo } from '@/lib/utils';

const WatchlistNews = ({ news }: WatchlistNewsProps) => {
    if (!news || news.length === 0) {
        return (
            <div className="p-6 text-center text-gray-500">
                <p>No news available for your watchlist</p>
            </div>
        );
    }

    // Get tag color based on stock symbol
    const getTagColor = (symbol: string) => {
        const colors: Record<string, string> = {
            'GOOGL': 'text-blue-400',
            'AAPL': 'text-gray-300',
            'TSLA': 'text-red-400',
            'NVDA': 'text-green-400',
            'MSFT': 'text-blue-500',
            'META': 'text-blue-300',
            'AMZN': 'text-orange-400',
        };
        return colors[symbol] || 'text-green-500';
    };

    return (
        <div className="watchlist-news">
            {news.map((article) => (
                <article key={article.id} className="news-item">
                    {/* Stock tag */}
                    <div className={`news-tag ${getTagColor(article.related)}`}>
                        {article.related || article.category.toUpperCase()}
                    </div>

                    {/* Title */}
                    <h3 className="news-title">
                        {article.headline}
                    </h3>

                    {/* Meta info */}
                    <div className="news-meta">
                        <span>{article.source}</span>
                        <span className="mx-2">•</span>
                        <span>{formatTimeAgo(article.datetime)}</span>
                    </div>

                    {/* Summary */}
                    <p className="news-summary">
                        {article.summary}
                    </p>

                    {/* Read more link */}
                    <Link
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="news-cta inline-flex items-center gap-1"
                    >
                        Read More
                        <span aria-hidden="true">→</span>
                    </Link>
                </article>
            ))}
        </div>
    );
};

export default WatchlistNews;
