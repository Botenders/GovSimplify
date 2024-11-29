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

    return (
        <div className="fixed inset-0 flex flex-col">
            <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
                <div className="text-xl font-bold">Federal Agency Guide</div>
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
        </div>
    );
}

export default Home;