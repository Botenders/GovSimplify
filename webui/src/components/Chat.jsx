import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import NewsCard from "./News";

const fetchResponse = async (message, agency) => {
    const response = await fetch(
        `/message/${agency}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        }
    );
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "An error occurred");
    }
    return data;
};

const fetchNews = async (agencyName) => {
    const response = await fetch(`/news/${agencyName}`);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "An error occurred");
    }
    return data.results;
};

const Chat = ({ agency, agencyName }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [news, setNews] = useState([]);
    const [isLoadingNews, setIsLoadingNews] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const loadNews = async () => {
            setIsLoadingNews(true);
            try {
                const newsData = await fetchNews(agencyName);
                setNews(newsData || []);
            } catch (error) {
                console.error("Error fetching news:", error);
                setNews([]);
            } finally {
                setIsLoadingNews(false);
            }
        };

        loadNews();
    }, [agencyName]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const userMessage = {
            text: inputMessage,
            timestamp: new Date().toISOString(),
            isUser: true
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage("");
        setIsLoading(true);

        try {
            const response = await fetchResponse(inputMessage, agency);
            setMessages(prev => [...prev, { ...response, isUser: false }]);
        } catch (error) {
            console.error("Error fetching response:", error);
            setMessages(prev => [...prev, {
                text: "I apologize, but I encountered an error. Please try again.",
                timestamp: new Date().toISOString(),
                isUser: false,
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex">
            {/* Sidebar */}
            <div
                className={`fixed md:relative bg-white border-r border-gray-200 
          h-full flex flex-col z-10
          ${isSidebarOpen ? 'w-80 translate-x-0' : 'w-80 -translate-x-full md:w-0'}
          transition-transform duration-150 ease-out`}
            >
                {isSidebarOpen && (
                    <>
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold">{agency} News</h2>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                            >
                                <ChevronLeft size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-4 space-y-4">
                                {isLoadingNews ? (
                                    <div className="flex justify-center p-4">
                                        <Loader2 className="animate-spin text-orange-500" size={24} />
                                    </div>
                                ) : news.length > 0 ? (
                                    news.map((article) => (
                                        <NewsCard key={article.article_id} article={article} />
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500 p-4">
                                        No news available
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Rest of the component remains the same */}
            {/* Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-25 z-0 md:hidden transition-opacity duration-150 ease-out"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Chat Area */}
            <div className="flex-1 bg-gray-50 flex flex-col h-full">
                <div className="p-4 bg-white border-b border-gray-200 flex items-center gap-3">
                    {!isSidebarOpen && (
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 hover:bg-gray-100 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                        >
                            <ChevronRight size={20} />
                        </button>
                    )}
                    <img src={`agencies/${agency}.svg`} alt="Botenders" className="h-8" />
                    <h2 className="font-bold">{agency} Policy Assistant</h2>
                </div>

                <div className="flex-1 p-4 min-h-0 overflow-hidden">
                    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
                        <div className="flex-1 p-4 overflow-y-auto">
                            {messages.length === 0 ? (
                                <div className="text-center text-gray-500">
                                    Ask a question about {agency} policies
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((message, index) => (
                                        <div
                                            key={index}
                                            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`flex flex-col max-w-[80%]`}>
                                                <div
                                                    className={`inline-block p-4 rounded-lg 
                            ${message.isUser
                                                            ? 'bg-orange-50'
                                                            : message.isError
                                                                ? 'bg-red-50'
                                                                : 'bg-gray-50'
                                                        }`}
                                                >
                                                    <p className="whitespace-pre-wrap break-words text-left">{message.text}</p>
                                                </div>
                                                <span className="text-xs text-gray-500 mt-1 px-1">
                                                    {new Date(message.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex items-center justify-start p-4">
                                            <Loader2 className="animate-spin text-orange-500" size={24} />
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white border-t border-gray-200">
                    <form onSubmit={handleSubmit} className="flex items-center gap-3">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 p-2 border border-gray-200 rounded-lg
                     focus:outline-none focus:border-orange-500"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !inputMessage.trim()}
                            className="bg-orange-500 text-white px-4 py-2 rounded-lg whitespace-nowrap
                     hover:bg-orange-600 transition-colors duration-75 ease-out
                     focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                     disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Chat;