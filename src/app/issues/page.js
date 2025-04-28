'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBar from '../../components/SearchBar';
import FilterPanel from '../../components/FilterPanel';
import IssueCard from '../../components/IssueCard';
import Pagination from '../../components/Pagination';
import issueService from '../../services/issueService';
import analysisService from '../../services/analysisService';

export default function IssuesPage() {
  const searchParams = useSearchParams();
  // We use filteredIssues directly, so we don't need a separate issues state
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [activeFilters, setActiveFilters] = useState({});
  const [availableFilters, setAvailableFilters] = useState({
    severities: [],
    priorities: [],
    statuses: [],
    components: [],
    os: [],
    vulnerability_types: []
  });

  // Get all possible search parameters from URL
  const initialSearchTerm = searchParams.get('search') || '';
  const initialSearchType = searchParams.get('type') || 'all';
  const initialSeverity = searchParams.get('severity') || '';
  const initialComponent = searchParams.get('component') || '';
  const initialCveId = searchParams.get('cve_id') || '';
  const initialIssueId = searchParams.get('issue_id') || '';
  const initialVersion = searchParams.get('version') || '';
  const initialVulnerability = searchParams.get('vulnerability') || '';

  // Items per page
  const itemsPerPage = 10;

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch component tags
        const componentTags = await issueService.getComponentTags();

        // Fetch OS values
        const osValues = await issueService.getOSValues();

        // Fetch vulnerability types from the backend
        const vulnTypesResponse = await analysisService.getVulnerabilityTypes();
        console.log('Vulnerability types response:', vulnTypesResponse);

        let vulnTypes = [];

        // Process vulnerability types based on the response format
        if (vulnTypesResponse) {
          // If we have an array of types directly
          if (Array.isArray(vulnTypesResponse)) {
            vulnTypes = vulnTypesResponse;
          }
          // If we have a types property that is an array
          else if (vulnTypesResponse.types && Array.isArray(vulnTypesResponse.types)) {
            vulnTypes = vulnTypesResponse.types;
          }
          // If we have a types property with objects containing type property
          else if (vulnTypesResponse.types && Array.isArray(vulnTypesResponse.types) &&
                  vulnTypesResponse.types.length > 0 && typeof vulnTypesResponse.types[0] === 'object') {
            vulnTypes = vulnTypesResponse.types.map(item => item.type || item.name || item.value || '');
          }
        }

        // If we still don't have vulnerability types, try fetching from top vulnerability types
        if (vulnTypes.length === 0) {
          console.log('Fetching from top vulnerability types as fallback');
          const topVulnTypesResponse = await analysisService.getTopVulnerabilityTypes(20);

          if (topVulnTypesResponse?.types) {
            // If types is an array of objects with type property
            if (Array.isArray(topVulnTypesResponse.types) && topVulnTypesResponse.types.length > 0) {
              if (typeof topVulnTypesResponse.types[0] === 'object' && 'type' in topVulnTypesResponse.types[0]) {
                vulnTypes = topVulnTypesResponse.types.map(item => item.type);
              }
              // If types is an array of strings
              else if (typeof topVulnTypesResponse.types[0] === 'string') {
                vulnTypes = topVulnTypesResponse.types;
              }
            }
          } else if (Array.isArray(topVulnTypesResponse)) {
            vulnTypes = topVulnTypesResponse
              .filter(item => item && (item.type || item.name))
              .map(item => item.type || item.name);
          }
        }

        // Remove duplicates and empty values
        vulnTypes = [...new Set(vulnTypes.filter(type => type))];

        console.log('Final vulnerability types for filter:', vulnTypes);

        // Set available filters
        setAvailableFilters({
          severities: ['Critical', 'High', 'Medium', 'Low'],
          priorities: ['P0', 'P1', 'P2', 'P3'],
          statuses: ['New', 'Fixed', 'Verified', 'Assigned'],
          components: componentTags?.tags || [],
          os: osValues?.values || [],
          vulnerability_types: vulnTypes
        });
      } catch (err) {
        console.error('Error fetching filter options:', err);

        // Fallback to default vulnerability types if there was an error
        setAvailableFilters(prev => ({
          ...prev,
          vulnerability_types: [
            'Use-After-Free',
            'Buffer Overflow',
            'Type Confusion',
            'Memory Corruption',
            'Cross-Site Scripting',
            'Integer Overflow',
            'Heap Corruption',
            'Race Condition',
            'Null Pointer Dereference',
            'Double Free'
          ]
        }));
      }
    };

    fetchFilterOptions();
  }, []);

  // We don't need a separate call for total count

  // Fetch issues with filters
  useEffect(() => {
    const fetchIssues = async () => {
      setIsLoading(true);
      setError(null);

      // Reset the filtered issues to ensure we don't show stale data
      setFilteredIssues([]);

      try {
        // Prepare query parameters
        const queryParams = {
          page: currentPage,
          limit: itemsPerPage
        };

        // Check if we're searching or filtering by vulnerability type
        let response;

        if (initialSearchTerm) {
          // If we have a search term, use the dedicated search endpoint
          const searchParams = {
            term: initialSearchTerm,
            type: initialSearchType || 'all',
            page: currentPage,
            limit: itemsPerPage
          };

          console.log('Using search endpoint with params:', searchParams);
          response = await issueService.searchIssues(searchParams);
        }
        // If we're filtering by vulnerability type, use the search endpoint
        else if (activeFilters.vulnerability_types && activeFilters.vulnerability_types.length > 0) {
          const vulnType = activeFilters.vulnerability_types[0]; // Use the first selected vulnerability type

          // Create search parameters
          const searchParams = {
            term: vulnType, // Use the vulnerability type as the search term
            type: 'vulnerability', // Specify that we're searching for vulnerabilities
            // Also include as separate parameters for backward compatibility
            vulnerability_type: activeFilters.vulnerability_types.join(','),
            vulnerability: activeFilters.vulnerability_types.join(','),
            vuln_type: activeFilters.vulnerability_types.join(','),
            root_cause_tag: activeFilters.vulnerability_types.join(','),
            page: currentPage,
            limit: itemsPerPage
          };

          // Add other filters if present
          if (activeFilters.severity && activeFilters.severity.length > 0) {
            searchParams.severity = activeFilters.severity.join(',');
          }

          if (activeFilters.priority && activeFilters.priority.length > 0) {
            searchParams.priority = activeFilters.priority.join(',');
          }

          if (activeFilters.components && activeFilters.components.length > 0) {
            searchParams.component = activeFilters.components.join(',');
          }

          if (activeFilters.os && activeFilters.os.length > 0) {
            searchParams.os = activeFilters.os.join(',');
          }

          // Only include has_cve parameter if it's true
          if (activeFilters.has_cve === true) {
            searchParams.has_cve = true;
          }
          // Don't include the parameter at all if it's false (to show all issues)

          console.log('Using search endpoint for vulnerability type with params:', searchParams);
          response = await issueService.searchIssues(searchParams);
        } else {
          // Otherwise, use the regular issues endpoint with filters

          // Add specific search parameters if they were directly provided in URL
          if (initialCveId) {
            queryParams.cve_id = initialCveId;
          }

          if (initialIssueId) {
            queryParams.issue_id = initialIssueId;
          }

          if (initialVersion) {
            queryParams.version = initialVersion;
          }

          if (initialVulnerability) {
            queryParams.vulnerability = initialVulnerability;
          }

          // Add severity filter if present
          if (initialSeverity) {
            queryParams.severity = initialSeverity;
          }

          // Add component filter if present
          if (initialComponent) {
            queryParams.component = initialComponent;
          }

          // Add active filters
          if (activeFilters.severity && activeFilters.severity.length > 0) {
            queryParams.severity = activeFilters.severity.join(',');
          }

          if (activeFilters.priority && activeFilters.priority.length > 0) {
            queryParams.priority = activeFilters.priority.join(',');
          }

          if (activeFilters.status && activeFilters.status.length > 0) {
            queryParams.status = activeFilters.status.join(',');
          }

          if (activeFilters.components && activeFilters.components.length > 0) {
            queryParams.component = activeFilters.components.join(',');
          }

          if (activeFilters.os && activeFilters.os.length > 0) {
            queryParams.os = activeFilters.os.join(',');
          }

          // Vulnerability type filtering is handled by the search endpoint

          // Only include has_cve parameter if it's true
          if (activeFilters.has_cve === true) {
            queryParams.has_cve = true;
          }
          // Don't include the parameter at all if it's false (to show all issues)

          console.log('Using issues endpoint with params:', queryParams);
          response = await issueService.getIssues(queryParams);
        }

        // Update state with fetched data
        setFilteredIssues(response.items || []);
        setTotalItems(response.total || 0);
        setTotalPages(response.pages || Math.ceil((response.total || 0) / itemsPerPage));
      } catch (err) {
        console.error('Error fetching issues:', err);
        setError('Failed to load issues. Please try again later.');
        setFilteredIssues([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssues();
  }, [currentPage, initialSearchTerm, initialSearchType, initialSeverity, initialComponent,
     initialCveId, initialIssueId, initialVersion, initialVulnerability, activeFilters]);

  const handleSearch = (searchParams) => {
    // Update URL with search parameters
    const url = new URL(window.location);

    if (searchParams.term) {
      // Clear any existing filter parameters when searching
      url.searchParams.forEach((_, key) => {
        if (key !== 'search' && key !== 'type') {
          url.searchParams.delete(key);
        }
      });

      // Set search parameters
      url.searchParams.set('search', searchParams.term);
      url.searchParams.set('type', searchParams.type || 'all');

      console.log(`Searching for "${searchParams.term}" with type "${searchParams.type || 'all'}"`);
    } else {
      url.searchParams.delete('search');
      url.searchParams.delete('type');
    }

    // Update browser history without reloading the page
    window.history.pushState({}, '', url);

    // Reset to first page
    setCurrentPage(1);
  };

  const handleFilter = (filters) => {
    // Update active filters
    setActiveFilters(filters);

    // Reset to first page
    setCurrentPage(1);
  };

  // We don't need to slice the issues since the API already returns paginated results
  const currentIssues = filteredIssues;

  return (
    <div className="max-w-7xl mx-auto">

      <SearchBar onSearch={handleSearch} />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters sidebar */}
        <div className="md:w-64 flex-shrink-0">
          <FilterPanel
            onFilter={handleFilter}
            availableFilters={availableFilters}
          />
        </div>

        {/* Main content */}
        <div className="flex-grow">
          {isLoading ? (
            <div className="text-center py-10 text-gray-700 dark:text-gray-300">Loading issues...</div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-4 rounded-md text-center mb-10">
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-md hover:bg-red-200 dark:hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300">No issues found matching your criteria.</p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-gray-600 dark:text-gray-300">
                Showing {filteredIssues.length} of {totalItems} issues
              </div>

              <div className="space-y-4">
                {currentIssues.map(issue => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
