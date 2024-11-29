// Home.jsx
import React, { useState } from 'react';
import Agencies from './Agencies';
import Chat from './Chat';

const Home = () => {
    const [selectedAgency, setSelectedAgency] = useState(null);
    const [showChat, setShowChat] = useState(false);

    const handleContinue = () => {
        setShowChat(true);
    };

    const handleLogoClick = () => {
        if (showChat) {
            setShowChat(false); // Only hide chat if it's currently showing
        }
    };

    return (
        <div className="fixed inset-0 flex flex-col">
            <header className="h-16 bg-cyan-900 border-b border-gray-200 flex items-center px-6">
                <div className="flex items-center">
                    <img
                        src="/logo.svg"
                        alt="Botenders"
                        className="h-8 transform transition-transform duration-200 cursor-pointer hover:scale-105"
                        onClick={handleLogoClick}
                    />
                    <span className="ml-2 text-lg font-bold text-white">
                        GovSimplify
                    </span>
                </div>
            </header>

            <main className="flex-1 overflow-hidden">
                {!showChat ? (
                    <Agencies
                        setAgency={setSelectedAgency}
                        selectedAgency={selectedAgency}
                        onContinue={handleContinue}
                    />
                ) : (
                    <Chat agency={selectedAgency} />
                )}
            </main>

            <footer className="h-14 bg-gray-200 border-t border-gray-300 flex items-center justify-center">
                <div className="text-sm text-gray-500">
                    &copy; 2024 Botenders, Inc.
                    <a
                        href="https://github.com/Botenders/GovSimplify"
                        target="_blank"
                        rel="noreferrer"
                        className="ml-2 text-orange-500"
                    >
                        Source Code
                    </a>
                </div>
            </footer>
        </div>
    );
}

export default Home;