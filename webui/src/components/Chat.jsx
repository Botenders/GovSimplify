import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Chat = ({ agency }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const news = [
        { id: 1, title: "Recent Policy Changes", date: "2024-03-15" },
        { id: 2, title: "Latest Regulations Update", date: "2024-03-14" },
        { id: 3, title: "Public Comment Period Open", date: "2024-03-13" },
        { id: 4, title: "New Guidelines Released", date: "2024-03-12" },
        { id: 5, title: "Upcoming Public Meeting", date: "2024-03-11" },
    ];

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
                        <div className="flex-1 p-4 overflow-y-auto">
                            <div className="space-y-4">
                                {news.map((item) => (
                                    <div 
                                        key={item.id}
                                        className="p-4 rounded-lg border border-gray-200 
                                                 hover:border-orange-200 hover:bg-orange-50/50
                                                 cursor-pointer transition-colors duration-75 ease-out"
                                    >
                                        <h3 className="font-semibold">{item.title}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{item.date}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-25 z-0 md:hidden transition-opacity duration-150 ease-out"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Chat Area */}
            <div className="flex-1 bg-gray-50 flex flex-col">
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
                    <h2 className="font-bold">{agency} Chat</h2>
                </div>

                <div className="flex-1 p-4">
                    <div className="h-full bg-white rounded-lg border border-gray-200 p-4 overflow-y-auto">
                        <div className="text-center text-gray-500">
                            Start your conversation with {agency}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white border-t border-gray-200">
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            placeholder="Type your message..."
                            className="flex-1 p-2 border border-gray-200 rounded-lg
                                     focus:outline-none focus:border-orange-500"
                        />
                        <button className="bg-orange-500 text-white px-4 py-2 rounded-lg whitespace-nowrap
                                         hover:bg-orange-600 transition-colors duration-75 ease-out
                                         focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;