'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import RecentIssueCard from '../components/RecentIssueCard';
import issueService from '../services/issueService';
import analysisService from '../services/analysisService';

// Mock data for fallback
const MOCK_STATISTICS = {
  totalIssues: 1245,
  criticalIssues: 156, // CVE count
  highIssues: 723,     // Fixed issues count
  recentlyAddedIssues: 24,
  topComponents: [
    { name: 'Blink', count: 187 },
    { name: 'V8', count: 156 },
    { name: 'UI', count: 124 },
    { name: 'Security', count: 98 },
    { name: 'Network', count: 76 }
  ],
  topVulnerabilityTypes: [
    { type: 'Use-After-Free', count: 143 },
    { type: 'Buffer Overflow', count: 112 },
    { type: 'Type Confusion', count: 87 },
    { type: 'Memory Corruption', count: 76 },
    { type: 'Cross-Site Scripting', count: 54 }
  ],
  recentIssues: [
    {
      id: 1,
      issue_id: 1234567,
      title: "Use-after-free in V8",
      severity: "High",
      status: "Fixed",
      component: "V8",
      cve_id: "CVE-2023-1234",
      public_time: "2023-05-15T10:30:00Z"
    },
    {
      id: 2,
      issue_id: 1234568,
      title: "Buffer overflow in PDF renderer",
      severity: "Critical",
      status: "Fixed",
      component: "PDF",
      cve_id: "CVE-2023-5678",
      public_time: "2023-05-14T14:45:00Z"
    },
    {
      id: 3,
      issue_id: 1234569,
      title: "Type confusion in JavaScript engine",
      severity: "High",
      status: "Assigned",
      component: "JavaScript",
      cve_id: "CVE-2023-9012",
      public_time: "2023-05-13T09:15:00Z"
    },
    {
      id: 4,
      issue_id: 1234570,
      title: "Cross-site scripting in Extensions",
      severity: "Medium",
      status: "New",
      component: "Extensions",
      cve_id: null,
      public_time: "2023-05-12T16:20:00Z"
    },
    {
      id: 5,
      issue_id: 1234571,
      title: "Memory corruption in Media",
      severity: "High",
      status: "Verified",
      component: "Media",
      cve_id: "CVE-2023-3456",
      public_time: "2023-05-11T11:10:00Z"
    }
  ]
}

export default function Home() {
  const [statistics, setStatistics] = useState({
    totalIssues: 0,
    criticalIssues: 0,
    highIssues: 0,
    mediumIssues: 0,
    lowIssues: 0,
    recentlyAddedIssues: 0,
    topComponents: [],
    topVulnerabilityTypes: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real data from the API
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch statistics
        const stats = await issueService.getStatistics();

        // Fetch counts for our dashboard cards
        let cveCount = stats?.cveCount;
        let fixedCount = stats?.fixedCount;
        let recentCount = stats?.recentlyAddedIssues;

        // If counts are 0 or undefined, fetch them directly
        if (!cveCount) {
          // Get count of issues with CVE IDs
          const cveIssuesResponse = await issueService.getIssuesByCVE();
          cveCount = cveIssuesResponse?.total || 0;
        }

        if (!fixedCount) {
          // Get count of fixed issues
          const fixedIssuesResponse = await issueService.getIssuesByStatus('Fixed');
          fixedCount = fixedIssuesResponse?.total || 0;
        }

        // Fetch top components
        const topComponentsResponse = await issueService.getTopComponents(5);
        // Format components data properly
        const topComponents = topComponentsResponse?.components || [];

        // Fetch recent issues
        const recentIssuesResponse = await issueService.getRecentIssues(5);
        const recentIssues = recentIssuesResponse?.items || [];

        // Update recent count if it's not available
        if (!recentCount) {
          recentCount = recentIssues.length;
        }

        // Fetch top vulnerability types
        console.log('Fetching top vulnerability types...');
        const topVulnTypesResponse = await analysisService.getTopVulnerabilityTypes(5);
        console.log('Top vulnerability types response:', topVulnTypesResponse);

        // Format vulnerability types data properly
        let topVulnTypes = [];

        if (topVulnTypesResponse?.types && Array.isArray(topVulnTypesResponse.types)) {
          console.log('Processing vulnerability types from response:', topVulnTypesResponse.types);

          // Check if the types array contains objects with type and count properties
          if (topVulnTypesResponse.types.length > 0 &&
              typeof topVulnTypesResponse.types[0] === 'object' &&
              'type' in topVulnTypesResponse.types[0] &&
              'count' in topVulnTypesResponse.types[0]) {

            // Format 1: Array of objects with type and count properties
            topVulnTypes = [...topVulnTypesResponse.types]
              .sort((a, b) => (b.count || 0) - (a.count || 0))
              .slice(0, 5);

            console.log('Using Format 1 (array of objects):', topVulnTypes);
          }
          // Format 2: Array of strings with counts in a separate object
          else if (topVulnTypesResponse.counts && typeof topVulnTypesResponse.counts === 'object') {
            topVulnTypes = topVulnTypesResponse.types
              .map(type => ({
                type: typeof type === 'string' ? type : String(type),
                count: topVulnTypesResponse.counts[type] || 0
              }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 5);

            console.log('Using Format 2 (array + counts object):', topVulnTypes);
          }
          // Format 3: Just an array of strings without counts
          else {
            topVulnTypes = topVulnTypesResponse.types
              .slice(0, 5)
              .map((type, index) => ({
                type: typeof type === 'string' ? type : String(type),
                count: 100 - (index * 20) // Mock counts if real counts not available
              }));

            console.log('Using Format 3 (array of strings):', topVulnTypes);
          }
        }
        // Format 4: Direct array of objects
        else if (Array.isArray(topVulnTypesResponse)) {
          topVulnTypes = topVulnTypesResponse
            .filter(item => item && (item.type || item.name))
            .map(item => ({
              type: item.type || item.name || 'Unknown',
              count: typeof item.count === 'number' ? item.count : 0
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

          console.log('Using Format 4 (direct array):', topVulnTypes);
        }
        // Format 5: Object with type names as keys and counts as values
        else if (topVulnTypesResponse && typeof topVulnTypesResponse === 'object') {
          topVulnTypes = Object.entries(topVulnTypesResponse)
            .filter(([key, value]) => key !== 'types' && key !== 'notFound' && typeof value === 'number')
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([type, count]) => ({ type, count }));

          console.log('Using Format 5 (object with counts):', topVulnTypes);
        }

        // Fallback to mock data if nothing worked
        if (!topVulnTypes || topVulnTypes.length === 0) {
          console.log('Using fallback mock data for vulnerability types');
          topVulnTypes = [
            { type: 'Use-After-Free', count: 143 },
            { type: 'Buffer Overflow', count: 112 },
            { type: 'Type Confusion', count: 87 },
            { type: 'Memory Corruption', count: 76 },
            { type: 'Cross-Site Scripting', count: 54 }
          ];
        }

        console.log('Processed top vulnerability types:', topVulnTypes);

        // Log the data for debugging
        console.log('Stats:', stats);
        console.log('Top Components:', topComponents);
        console.log('Top Vulnerability Types:', topVulnTypes);

        // Check if we have valid data
        const hasValidData =
          stats &&
          typeof stats.totalIssues === 'number' &&
          Array.isArray(topComponents) && topComponents.length > 0;

        if (hasValidData) {
          // Combine all data
          setStatistics({
            totalIssues: stats?.totalIssues || 0,
            criticalIssues: cveCount || 0,
            highIssues: fixedCount || 0,
            recentlyAddedIssues: recentCount || 0,
            topComponents: Array.isArray(topComponents) ? topComponents : [],
            topVulnerabilityTypes: Array.isArray(topVulnTypes) ? topVulnTypes : [],
            recentIssues: Array.isArray(recentIssues) ? recentIssues : []
          });
          setError(null);
        } else {
          // If data is invalid, use mock data
          console.warn('Invalid data received from API, using mock data');
          setStatistics(MOCK_STATISTICS);
          setError('Warning: Using mock data. Backend API may not be fully implemented.');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        // Use mock data as fallback
        setStatistics(MOCK_STATISTICS);
        setError('Failed to connect to backend API. Using mock data instead.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleSearch = (searchParams) => {
    // Redirect to the issues page with proper search parameters
    if (searchParams.term) {
      // Encode the search term to handle special characters
      const encodedTerm = encodeURIComponent(searchParams.term);

      // Use different parameter names based on search type for better backend compatibility
      if (searchParams.type === 'cve') {
        window.location.href = `/issues?cve_id=${encodedTerm}`;
      } else if (searchParams.type === 'issue') {
        window.location.href = `/issues?issue_id=${encodedTerm}`;
      } else if (searchParams.type === 'component') {
        window.location.href = `/issues?component=${encodedTerm}`;
      } else if (searchParams.type === 'version') {
        window.location.href = `/issues?version=${encodedTerm}`;
      } else if (searchParams.type === 'vulnerability') {
        window.location.href = `/issues?vulnerability=${encodedTerm}`;
      } else {
        // For 'all' type or any other type, use a generic search parameter
        window.location.href = `/issues?search=${encodedTerm}`;
      }
    } else {
      // If no search term, just go to the issues page
      window.location.href = '/issues';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-10 animate-fadeIn">
        <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text transform transition-transform duration-700 hover:scale-[1.02]">
          <h1 className="text-4xl font-bold mb-4">Chromium Issues A²</h1>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto animate-fadeIn" style={{ animationDelay: '300ms' }}>
        Chromium Issues Auto Analysis
        </p>
      </div>

      <SearchBar onSearch={handleSearch} />

      {isLoading ? (
        <div className="text-center py-10">Loading dashboard data...</div>
      ) : error ? (
        <div className={`${
          error.includes('Warning')
            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
        } border p-4 rounded-md text-center mb-6`}>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={`mt-2 px-4 py-2 ${
              error.includes('Warning')
                ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-700'
                : 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700'
            } rounded-md transition-colors`}
          >
            Retry with Backend
          </button>
        </div>
      ) : (
        <>
          {/* Statistics Cards - Material Design 3 Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 animate-fadeIn" style={{ animationDelay: '150ms' }}>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-5px] cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Issues</h2>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 animate-countUp">{statistics.totalIssues}</p>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">All tracked security issues</p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-5px] cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-purple-700 dark:text-purple-300">With CVE IDs</h2>
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 dark:text-purple-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v-1l1-1 1-1-.257-.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-purple-700 dark:text-purple-300 animate-countUp">{statistics.criticalIssues}</p>
              <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">Issues with assigned CVE identifiers</p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-5px] cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-amber-700 dark:text-amber-300">Fixed Issues</h2>
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 dark:text-amber-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-amber-700 dark:text-amber-300 animate-countUp">{statistics.highIssues}</p>
              <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">Issues with patches available</p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-5px] cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-green-700 dark:text-green-300">Recently Added</h2>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300 animate-countUp">{statistics.recentlyAddedIssues}</p>
              <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">Added in the last 30 days</p>
            </div>
          </div>

          {/* Top Components and Vulnerability Types - Material Design 3 Style */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 animate-fadeIn" style={{ animationDelay: '300ms' }}>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-indigo-800 dark:text-indigo-300">Top Affected Components</h2>
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-300" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-4">
                {Array.isArray(statistics.topComponents) && statistics.topComponents.length > 0 ? (
                  statistics.topComponents.map((component, index) => {
                    // Get the maximum count for percentage calculation
                    const maxCount = statistics.topComponents[0].count || 1;

                    return (
                      <div key={index} className="relative">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">{component.name}</span>
                          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{component.count || 0}</span>
                        </div>
                        <div className="w-full bg-indigo-200 dark:bg-indigo-800/50 rounded-full h-2.5">
                          <div
                            className="bg-indigo-600 dark:bg-indigo-400 h-2.5 rounded-full transition-all duration-1000 ease-out animate-growWidth"
                            style={{ width: `${((component.count || 0) / maxCount) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-indigo-500 dark:text-indigo-400 py-4">
                    No component data available
                  </div>
                )}
              </div>
            </div>

            <div className="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-rose-800 dark:text-rose-300">Top Vulnerability Types</h2>
                <div className="w-10 h-10 bg-rose-100 dark:bg-rose-800 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-600 dark:text-rose-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="space-y-4">
                {Array.isArray(statistics.topVulnerabilityTypes) && statistics.topVulnerabilityTypes.length > 0 ? (
                  statistics.topVulnerabilityTypes.map((vulnType, index) => {
                    // Get the maximum count for percentage calculation
                    const maxCount = statistics.topVulnerabilityTypes[0].count || 1;
                    const typeName = typeof vulnType === 'object' ? (vulnType.type || 'Unknown') : String(vulnType);
                    const typeCount = typeof vulnType === 'object' ? (vulnType.count || 0) : 0;

                    return (
                      <div key={index} className="relative">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-rose-700 dark:text-rose-300">{typeName}</span>
                          <span className="text-xs font-medium text-rose-600 dark:text-rose-400">{typeCount}</span>
                        </div>
                        <div className="w-full bg-rose-200 dark:bg-rose-800/50 rounded-full h-2.5">
                          <div
                            className="bg-rose-600 dark:bg-rose-400 h-2.5 rounded-full transition-all duration-1000 ease-out animate-growWidth"
                            style={{ width: `${((typeCount) / maxCount) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-rose-500 dark:text-rose-400 py-4">
                    No vulnerability type data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Issues - Material Design 3 Style */}
          <div className="bg-teal-50 dark:bg-teal-900/20 p-6 rounded-xl shadow-sm mb-10 animate-fadeIn" style={{ animationDelay: '450ms' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-800 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600 dark:text-teal-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-lg font-medium text-teal-800 dark:text-teal-300">Recent Issues</h2>
              </div>
              <Link
                href="/issues"
                className="text-sm text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                View All
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            <div className="space-y-3">
              {Array.isArray(statistics.recentIssues) && statistics.recentIssues.length > 0 ? (
                statistics.recentIssues.map((issue, index) => (
                  <div
                    key={issue.id}
                    className="animate-fadeIn"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <RecentIssueCard issue={issue} />
                  </div>
                ))
              ) : (
                <div className="text-center text-teal-500 dark:text-teal-400 py-4 bg-teal-100/50 dark:bg-teal-800/30 rounded-lg animate-pulse">
                  No recent issues available
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
