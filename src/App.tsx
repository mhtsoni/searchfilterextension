import React, { useEffect, useState } from 'react';
import { Ban, CheckCircle, PlusCircle, Trash2, Settings } from 'lucide-react';

interface BlockedSites {
  bannedDomains: string[];
  userBlockedDomains: string[];
  overrideDomains: string[];
  location: string;
  fullBannedList: Record<string, string[]>;
}

function App() {
  const [blockedSites, setBlockedSites] = useState<BlockedSites>({
    bannedDomains: [],
    userBlockedDomains: [],
    overrideDomains: [],
    location: '',
    fullBannedList: {}
  });
  const [newDomain, setNewDomain] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [editLocation, setEditLocation] = useState('');
  const [editDomains, setEditDomains] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Change this number to adjust the items per page

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_BLOCKED_DOMAINS' }, (response) => {
      setBlockedSites(response);
    });
  }, []);

  const addBlockedDomain = () => {
    if (!newDomain) return;
    const updatedBlockedDomains = [...blockedSites.userBlockedDomains, newDomain];
    const updatedSites = {
      ...blockedSites,
      userBlockedDomains: updatedBlockedDomains
    };

    chrome.runtime.sendMessage({
      type: 'UPDATE_USER_PREFERENCES',
      userBlockedDomains: updatedBlockedDomains,
      overrideDomains: blockedSites.overrideDomains
    });

    setBlockedSites(updatedSites);
    setNewDomain('');
  };

  const toggleOverride = (domain: string) => {
    const updatedOverrides = blockedSites.overrideDomains.includes(domain)
      ? blockedSites.overrideDomains.filter(d => d !== domain)
      : [...blockedSites.overrideDomains, domain];

    const updatedSites = {
      ...blockedSites,
      overrideDomains: updatedOverrides
    };

    chrome.runtime.sendMessage({
      type: 'UPDATE_USER_PREFERENCES',
      userBlockedDomains: blockedSites.userBlockedDomains,
      overrideDomains: updatedOverrides
    });

    setBlockedSites(updatedSites);
  };

  const removeUserBlock = (domain: string) => {
    const updatedBlocked = blockedSites.userBlockedDomains.filter(d => d !== domain);
    const updatedSites = {
      ...blockedSites,
      userBlockedDomains: updatedBlocked
    };

    chrome.runtime.sendMessage({
      type: 'UPDATE_USER_PREFERENCES',
      userBlockedDomains: updatedBlocked,
      overrideDomains: blockedSites.overrideDomains
    });

    setBlockedSites(updatedSites);
  };

  const updateLocationBans = () => {
    if (!editLocation || !editDomains) return;

    const domains = editDomains.split(',').map(d => d.trim());
    const updatedBannedList = {
      ...blockedSites.fullBannedList,
      [editLocation]: domains
    };

    chrome.runtime.sendMessage({
      type: 'UPDATE_BANNED_DOMAINS',
      bannedDomains: updatedBannedList
    });

    setBlockedSites(prev => ({
      ...prev,
      fullBannedList: updatedBannedList,
      bannedDomains: blockedSites.location === editLocation ? domains : prev.bannedDomains
    }));

    setEditLocation('');
    setEditDomains('');
  };

  // Filter the domains based on the search query
  const filteredBannedDomains = blockedSites.bannedDomains.filter(domain =>
    domain.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredUserBlockedDomains = blockedSites.userBlockedDomains.filter(domain =>
    domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current items for pagination
  const getPagedItems = (items: string[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  };

  // Total pages
  const totalPages = Math.ceil(filteredBannedDomains.length / itemsPerPage);

  return (
    <div className="w-96 p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Ban className="w-5 h-5" />
          Search Filter
        </h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-200"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search blocked domains"
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      {/* Settings */}
      {showSettings ? (
        <div className="mb-6 space-y-4">
          <h2 className="font-semibold">Location Settings</h2>
          <div className="space-y-2">
            <input
              type="text"
              value={Object.entries(blockedSites.fullBannedList).map(([location]) => location)[0]}
              onChange={(e) => setEditLocation(e.target.value)}
              placeholder="Location (e.g., US, UK)"
              className="w-full px-3 py-2 border rounded"
            />
            <textarea
              value={Object.entries(blockedSites.fullBannedList).map(([location, domains]) => domains.join(', '))}
              onChange={(e) => setEditDomains(e.target.value)}
              placeholder="Domains (comma-separated)"
              className="w-full px-3 py-2 border rounded h-24"
            />
            <button
              onClick={updateLocationBans}
              className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Update Location Bans
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Blocked Sites */}
          <div className="space-y-4">
            <div>
              <h2 className="font-semibold mb-2">Location-based Blocked Sites</h2>
              <ul className="space-y-2">
                {getPagedItems(filteredBannedDomains).map(domain => (
                  <li key={domain} className="flex items-center justify-between bg-white p-2 rounded shadow-sm">
                    <span>{domain}</span>
                    <button
                      onClick={() => toggleOverride(domain)}
                      className={`p-1 rounded ${
                        blockedSites.overrideDomains.includes(domain)
                          ? 'text-green-500 hover:text-green-600'
                          : 'text-gray-500 hover:text-gray-600'
                      }`}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
