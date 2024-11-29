import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const Agencies = ({ setAgency, selectedAgency, onContinue }) => {
    const [selected, setSelected] = useState(selectedAgency);
    const [searchQuery, setSearchQuery] = useState('');
    const [announceSelection, setAnnounceSelection] = useState('');

    useEffect(() => {
        setAgency(selected);
        setSelected(selectedAgency);
    }, [selected, selectedAgency, setAgency]);

    const agencies = [
        { id: "EPA", name: "EPA", fullName: "Environmental Protection Agency", logo: "EPA.svg", category: "Environment" },
        { id: "SEC", name: "SEC", fullName: "Securities and Exchange Commission", logo: "SEC.svg", category: "Finance" },
        { id: "FAA", name: "FAA", fullName: "Federal Aviation Administration", logo: "FAA.svg", category: "Transportation" },
        { id: "FERC", name: "FERC", fullName: "Federal Energy Regulatory Commission", logo: "FERC.svg", category: "Energy" },
        { id: "FDA", name: "FDA", fullName: "Food and Drug Administration", logo: "FDA.svg", category: "Health" },
        { id: "FMCSA", name: "FMCSA", fullName: "Federal Motor Carrier Safety Administration", logo: "FMCSA.svg", category: "Transportation" },
        { id: "NIH", name: "NIH", fullName: "National Institutes of Health", logo: "NIH.svg", category: "Health" },
        { id: "DOT", name: "DOT", fullName: "Department of Transportation", logo: "DOT.svg", category: "Transportation" },
        { id: "USCG", name: "USCG", fullName: "United States Coast Guard", logo: "USCG.svg", category: "Defense" },
        { id: "ITA", name: "ITA", fullName: "International Trade Administration", logo: "ITA.svg", category: "Trade" },
        { id: "NRC", name: "NRC", fullName: "Nuclear Regulatory Commission", logo: "NRC.svg", category: "Energy" },
        { id: "NOAA", name: "NOAA", fullName: "National Oceanic and Atmospheric Administration", logo: "NOAA.svg", category: "Science" },
        { id: "FCC", name: "FCC", fullName: "Federal Communications Commission", logo: "FCC.svg", category: "Communications" },
        { id: "FEMA", name: "FEMA", fullName: "Federal Emergency Management Agency", logo: "FEMA.svg", category: "Emergency" },
        { id: "FRS", name: "FRS", fullName: "Federal Reserve System", logo: "FRS.svg", category: "Finance" },
        { id: "ITC", name: "ITC", fullName: "International Trade Commission", logo: "ITC.svg", category: "Trade" },
        { id: "DOS", name: "DOS", fullName: "Department of State", logo: "DOS.svg", category: "Foreign Affairs" },
        { id: "VA", name: "VA", fullName: "Department of Veterans Affairs", logo: "VA.svg", category: "Veterans" },
        { id: "HUD", name: "HUD", fullName: "Department of Housing and Urban Development", logo: "HUD.svg", category: "Housing" },
        { id: "CMS", name: "CMS", fullName: "Centers for Medicare & Medicaid Services", logo: "CMS.svg", category: "Health" },
        { id: "PHMSA", name: "PHMSA", fullName: "Pipeline and Hazardous Materials Safety Administration", logo: "PHMSA.svg", category: "Transportation" },
        { id: "NHTSA", name: "NHTSA", fullName: "National Highway Traffic Safety Administration", logo: "NHTSA.svg", category: "Transportation" },
        { id: "DOE", name: "DOE", fullName: "Department of Energy", logo: "DOE.svg", category: "Energy" },
        { id: "DOD", name: "DOD", fullName: "Department of Defense", logo: "DOD.svg", category: "Defense" },
        { id: "USPS", name: "USPS", fullName: "United States Postal Service", logo: "USPS.svg", category: "Communications" },
        { id: "ED", name: "ED", fullName: "Department of Education", logo: "ED.svg", category: "Education" },
        { id: "MARAD", name: "MARAD", fullName: "Maritime Administration", logo: "MARAD.svg", category: "Transportation" },
        { id: "FRA", name: "FRA", fullName: "Federal Railroad Administration", logo: "FRA.svg", category: "Transportation" },
        { id: "OSHA", name: "OSHA", fullName: "Occupational Safety and Health Administration", logo: "OSHA.svg", category: "Labor" },
        { id: "STB", name: "STB", fullName: "Surface Transportation Board", logo: "STB.svg", category: "Transportation" },
        { id: "NSF", name: "NSF", fullName: "National Science Foundation", logo: "NSF.svg", category: "Science" },
        { id: "FWS", name: "FWS", fullName: "Fish and Wildlife Service", logo: "FWS.svg", category: "Environment" },
        { id: "IRS", name: "IRS", fullName: "Internal Revenue Service", logo: "IRS.svg", category: "Finance" },
        { id: "USCBP", name: "USCBP", fullName: "U.S. Customs and Border Protection", logo: "USCBP.svg", category: "Defense" },
        { id: "USDA", name: "USDA", fullName: "United States Department of Agriculture", logo: "USDA.svg", category: "Agriculture" },
        { id: "FS", name: "FS", fullName: "Forest Service", logo: "FS.svg", category: "Environment" },
        { id: "FHWA", name: "FHWA", fullName: "Federal Highway Administration", logo: "FHWA.svg", category: "Transportation" },
        { id: "CRC", name: "CRC", fullName: "Civil Rights Commission", logo: "CRC.svg", category: "Civil Rights" },
        { id: "EERE", name: "EERE", fullName: "Office of Energy Efficiency and Renewable Energy", logo: "EERE.svg", category: "Energy" },
        { id: "APHIS", name: "APHIS", fullName: "Animal and Plant Health Inspection Service", logo: "APHIS.svg", category: "Agriculture" },
        { id: "AMS", name: "AMS", fullName: "Agricultural Marketing Service", logo: "AMS.svg", category: "Agriculture" },
        { id: "FDIC", name: "FDIC", fullName: "Federal Deposit Insurance Corporation", logo: "FDIC.svg", category: "Finance" },
        { id: "FMC", name: "FMC", fullName: "Federal Maritime Commission", logo: "FMC.svg", category: "Transportation" },
        { id: "DOL", name: "DOL", fullName: "Department of Labor", logo: "DOL.svg", category: "Labor" },
        { id: "CDC", name: "CDC", fullName: "Centers for Disease Control and Prevention", logo: "CDC.svg", category: "Health" },
        { id: "CFTC", name: "CFTC", fullName: "Commodity Futures Trading Commission", logo: "CFTC.svg", category: "Finance" },
        { id: "NCUA", name: "NCUA", fullName: "National Credit Union Administration", logo: "NCUA.svg", category: "Finance" },
        { id: "USCIS", name: "USCIS", fullName: "U.S. Citizenship and Immigration Services", logo: "USCIS.svg", category: "Immigration" },
        { id: "OPM", name: "OPM", fullName: "Office of Personnel Management", logo: "OPM.svg", category: "Government" },
        { id: "DHS", name: "DHS", fullName: "Department of Homeland Security", logo: "DHS.svg", category: "Defense" },
        { id: "OFAC", name: "OFAC", fullName: "Office of Foreign Assets Control", logo: "OFAC.svg", category: "Finance" },
        { id: "FTC", name: "FTC", fullName: "Federal Trade Commission", logo: "FTC.svg", category: "Trade" }
    ];

    const filteredAgencies = agencies.filter(agency =>
        agency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agency.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelection = (agencyId) => {
        setSelected(agencyId);
        setAgency(agencyId);
        setAnnounceSelection(`Selected ${agencies.find(a => a.id === agencyId).fullName}`);
        setTimeout(() => setAnnounceSelection(''), 1000);
    };

    const handleKeyPress = (event, agencyId) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleSelection(agencyId);
        }
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="p-4 bg-white">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="search"
                        placeholder="Search agencies..."
                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 min-h-0">
                <div className="sr-only" role="status" aria-live="polite">
                    {announceSelection}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredAgencies.map((agency) => (
                        <button
                            key={agency.id}
                            onClick={() => handleSelection(agency.id)}
                            onKeyDown={(e) => handleKeyPress(e, agency.id)}
                            className={`
                                w-full h-[240px]
                                p-6 rounded-lg
                                flex flex-col items-center
                                transition-all duration-200
                                focus-visible:outline-none
                                focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2
                                ${selected === agency.id
                                    ? 'border border-orange-500 bg-orange-50 shadow-lg focus-visible:ring-0'
                                    : 'border border-gray-200 hover:border-orange-200 hover:bg-orange-50/50'}
                            `}
                            aria-label={`Select ${agency.fullName}`}
                            aria-selected={selected === agency.id}
                            role="option"
                        >
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <div className="mb-4 rounded-full overflow-hidden bg-gray-100 p-2">
                                    <img
                                        src={`/agencies/${agency.logo}`}
                                        alt={`${agency.name} logo`}
                                        className="w-16 h-16 object-fill"
                                    />
                                </div>
                                <span className="text-xl font-bold mb-2">{agency.name}</span>
                                <div className="h-[60px] flex flex-col items-center justify-center">
                                    <div className="absolute opacity-0 pointer-events-none">
                                        <span className="text-sm text-gray-600 text-center">{agency.fullName}</span>
                                        <span className="text-xs text-gray-500 mt-2">{agency.category}</span>
                                    </div>
                                    {selected === agency.id ? (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onContinue();
                                            }}
                                            className="
                                                w-full bg-orange-600 text-white px-6 py-2 rounded-full
                                                transition-all duration-200
                                                hover:bg-orange-700
                                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2
                                                shadow-md
                                            "
                                            aria-label={`Continue with ${agency.name}`}
                                        >
                                            Continue
                                        </button>
                                    ) : (
                                        <>
                                            <span className="text-sm text-gray-600 text-center">{agency.fullName}</span>
                                            <span className="text-xs text-gray-500 mt-2">{agency.category}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {filteredAgencies.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No agencies found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Agencies;