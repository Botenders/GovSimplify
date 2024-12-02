import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { v4 as uuid4 } from "uuid";
import ReactMarkdown from "react-markdown";
import NewsCard from "./News";
import AttachmentPreview from "./Attachment";

const fetchResponse = async (message, agency, sessionId) => {
    const response = await fetch(
        `/message/${agency}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, sessionId })
        }
    );
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "An error occurred");
    }
    console.log(data);
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
    const [showDelayMessage, setShowDelayMessage] = useState(false);
    const [isLoadingNews, setIsLoadingNews] = useState(true);
    const [sessionId,] = useState(uuid4());
    const messagesEndRef = useRef(null);
    const loadingTimerRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const timerId = loadingTimerRef.current;
        return () => {
            if (timerId) {
                clearTimeout(timerId);
            }
        };
    }, []);

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
        setShowDelayMessage(false);

        // Set timer for delayed message
        loadingTimerRef.current = setTimeout(() => {
            setShowDelayMessage(true);
        }, 10000);

        try {
            const response = await fetchResponse(inputMessage, agency, sessionId);
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
            setShowDelayMessage(false);
            if (loadingTimerRef.current) {
                clearTimeout(loadingTimerRef.current);
            }
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
                                <div className="text-center text-gray-500 text-sm italic">
                                    This tool is intended to assist users in understanding policies from {agency} and does not constitute legal advice.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((message, index) => (
                                        <div
                                            key={index}
                                            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`flex flex-col max-w-[80%]`}>
                                                <span className="text-xs text-gray-500 mt-1 px-1">
                                                    {new Date(message.timestamp).toLocaleTimeString()}
                                                </span>
                                                {/* Message bubble with Markdown support */}
                                                <div
                                                    className={`inline-block p-4 rounded-lg w-full
                                                        ${message.isUser
                                                            ? 'bg-orange-50'
                                                            : message.isError
                                                                ? 'bg-red-50'
                                                                : 'bg-gray-50'
                                                        }`}
                                                >
                                                    {message.isUser ? (
                                                        <p className="whitespace-pre-wrap break-words text-left">
                                                            {message.text}
                                                        </p>
                                                    ) : (
                                                        <div className="prose prose-sm max-w-none text-left [&>*]:text-left [&_p]:text-left [&_ul]:text-left [&_ol]:text-left [&_li]:text-left [&_blockquote]:text-left">
                                                            <ReactMarkdown
                                                                className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                                                                components={{
                                                                    a: ({ node, ...props }) => (
                                                                        <a
                                                                            {...props}
                                                                            className="text-orange-600 hover:underline"
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                        >
                                                                            {props.children}
                                                                        </a>
                                                                    ),
                                                                    code: ({ node, inline, className, children, ...props }) => (
                                                                        <code
                                                                            className={`${inline ? 'bg-gray-100 rounded px-1' : 'block bg-gray-100 p-2 rounded-lg'} text-left`}
                                                                            {...props}
                                                                        >
                                                                            {children}
                                                                        </code>
                                                                    ),
                                                                    ul: ({ node, ...props }) => (
                                                                        <ul className="list-disc pl-4 mt-2 text-left" {...props} />
                                                                    ),
                                                                    ol: ({ node, ...props }) => (
                                                                        <ol className="list-decimal pl-4 mt-2 text-left" {...props} />
                                                                    ),
                                                                    p: ({ node, ...props }) => (
                                                                        <p className="text-left" {...props} />
                                                                    ),
                                                                    blockquote: ({ node, ...props }) => (
                                                                        <blockquote className="border-l-4 border-gray-300 pl-4 text-left" {...props} />
                                                                    ),
                                                                }}
                                                            >
                                                                {message.text}
                                                            </ReactMarkdown>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Attachment container */}
                                                <div className="mt-2 max-w-[80%] overflow-hidden flex flex-col gap-y-2">
                                                    {message.attachments?.map((attachment, attachmentIndex) => (
                                                        (attachment.content || attachment.file_uri) && (
                                                            <AttachmentPreview
                                                                key={attachmentIndex}
                                                                content={attachment}
                                                            />
                                                        )
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex flex-col items-start gap-2 p-4">
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="animate-spin text-orange-500" size={24} />
                                                <span className="text-gray-600">Referencing {agency} data...</span>
                                            </div>
                                            {showDelayMessage && (
                                                <p className="text-sm text-gray-500 ml-8">
                                                    Generation times are slower due to long context, especially for the first message.
                                                </p>
                                            )}
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