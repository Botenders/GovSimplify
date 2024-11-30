import React from 'react';
import { ExternalLink, Newspaper } from 'lucide-react';

const NewsCard = ({ article }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const truncateText = (text, maxLength) => {
        if (text?.length > maxLength) {
            return text.substring(0, maxLength) + '...';
        }
        return text;
    };

    return (
        <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
        >
            <div className="p-3 rounded-lg border border-gray-200 
                hover:border-orange-200 hover:bg-orange-50/50
                transition-colors duration-75 ease-out max-w-2xl">
                <div className="flex gap-3">
                    <div className="flex-shrink-0 w-16 h-16">
                        {article.image_url ? (
                            <div className="w-full h-full rounded overflow-hidden bg-gray-100">
                                <img
                                    src={article.image_url}
                                    alt={article.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = 'newspaper.svg';
                                        e.target.alt = 'Placeholder';
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
                                <Newspaper className="w-8 h-8 text-gray-400" />
                            </div>
                        )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                            <h3 className="font-medium text-gray-900 group-hover:text-orange-600 
                                text-sm leading-snug line-clamp-2 flex-grow">
                                {article.title}
                            </h3>
                            <ExternalLink className="flex-shrink-0 w-3 h-3 text-gray-400 
                                group-hover:text-orange-500 mt-0.5" />
                        </div>

                        <p className="mt-1 text-xs text-gray-600 line-clamp-2 leading-snug">
                            {truncateText(article.description || article.content, 120)}
                        </p>

                        <div className="mt-1 flex items-center gap-1.5 text-xs">
                            <span className="text-gray-500 whitespace-nowrap">
                                {formatDate(article.pubDate)}
                            </span>
                            {article.source_name && (
                                <>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-gray-500 truncate max-w-[150px]">
                                        {article.source_name}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </a>
    );
};

export default NewsCard;