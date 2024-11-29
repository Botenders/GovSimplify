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
        <div>
            {!showChat ? (
                <Agencies 
                    setAgency={setSelectedAgency} 
                    selectedAgency={selectedAgency}
                    onContinue={handleContinue}
                />
            ) : (
                <Chat agency={selectedAgency} />
            )}
        </div>
    );
}

export default Home;