// Home.jsx
import React, { useState } from 'react';
import Agencies from './Agencies';
import Chat from './Chat';

const Home = () => {
    const [selectedAgency, setSelectedAgency] = useState(null);
    const [agencyName, setAgencyName] = useState('');
    const [showChat, setShowChat] = useState(false);

    const handleContinue = () => {
        setShowChat(true);
    };

    const handleLogoClick = () => {
        window.location.href = 'https://botenders.com';
    };

    const handleTitleClick = () => {
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
                    <div className="ml-2 flex flex-col items-start">
                        <span
                            className="text-lg font-bold text-white transform transition-transform duration-200 cursor-pointer hover:scale-105"
                            onClick={handleTitleClick}
                        >
                            GovSimplify
                        </span>
                        <span className="text-[10px] text-gray-300 leading-tight">
                            By Botenders, powered by Google Gemini
                        </span>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-hidden">
                {!showChat ? (
                    <Agencies
                        setAgency={setSelectedAgency}
                        selectedAgency={selectedAgency}
                        setAgencyName={setAgencyName}
                        onContinue={handleContinue}
                    />
                ) : (
                    <Chat agency={selectedAgency} agencyName={agencyName} />
                )}
            </main>

            <footer className="h-14 bg-gray-200 border-t border-gray-300 flex items-center justify-between px-4">
                {/* Left: Copyright Message */}
                <div className="text-sm text-gray-500">
                    &copy; 2024 Botenders, Inc. <a 
                        href="https://www.apache.org/licenses/LICENSE-2.0"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-500 hover:underline"
                    >
                        Apache License 2.0
                    </a>
                </div>

                {/* Right: Social Media Links */}
                <div className="flex items-center gap-4">
                    <img
                        src="/github-mark.svg"
                        alt="GitHub"
                        onClick={() => window.open('https://github.com/Botenders/GovSimplify', '_blank')}
                        className="h-6 cursor-pointer"
                    />
                    <img
                        src="/linkedin.svg"
                        alt="LinkedIn"
                        onClick={() => window.open('https://linkedin.com/company/botenders', '_blank')}
                        className="h-6 cursor-pointer"
                    />
                </div>
            </footer>
        </div>
    );
}

export default Home;