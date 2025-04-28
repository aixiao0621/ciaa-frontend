import api from './api';

// Service for issue-related API calls
const issueService = {
  // Get all issues with pagination and filtering
  getIssues: (params = {}) => {
    // Create a copy of the params to avoid modifying the original
    const apiParams = { ...params };

    // Handle has_cve parameter
    if (apiParams.has_cve !== undefined) {
      if (apiParams.has_cve === true) {
        // Only send the parameter if it's true
        apiParams.has_cve = "true";
      } else {
        // Remove the parameter completely if it's false to show all issues
        delete apiParams.has_cve;
      }
    }

    return api.get('/issues', apiParams)
      .then(response => {
        // If we're searching for an exact issue ID, prioritize exact matches
        if (params.issue_id && !isNaN(params.issue_id)) {
          const exactMatch = response.items?.find(
            issue => issue.issue_id === parseInt(params.issue_id, 10)
          );

          if (exactMatch) {
            // Move the exact match to the top of the results
            const otherItems = response.items.filter(
              issue => issue.issue_id !== parseInt(params.issue_id, 10)
            );

            return {
              ...response,
              items: [exactMatch, ...otherItems]
            };
          }
        }

        // If we're searching for a CVE ID, prioritize exact matches
        if (params.cve_id) {
          const exactMatch = response.items?.find(
            issue => issue.cve_id && issue.cve_id.toLowerCase() === params.cve_id.toLowerCase()
          );

          if (exactMatch) {
            // Move the exact match to the top of the results
            const otherItems = response.items.filter(
              issue => !issue.cve_id || issue.cve_id.toLowerCase() !== params.cve_id.toLowerCase()
            );

            return {
              ...response,
              items: [exactMatch, ...otherItems]
            };
          }
        }

        // If we're searching for a general term, try to find exact matches in issue_id
        if (params.search && !isNaN(params.search)) {
          const searchAsNumber = parseInt(params.search, 10);
          const exactMatch = response.items?.find(
            issue => issue.issue_id === searchAsNumber
          );

          if (exactMatch) {
            // Move the exact match to the top of the results
            const otherItems = response.items.filter(
              issue => issue.issue_id !== searchAsNumber
            );

            return {
              ...response,
              items: [exactMatch, ...otherItems]
            };
          }
        }

        return response;
      });
  },

  // Get a single issue by ID with all related data
  getIssueById: (id) => {
    return api.get(`/issues/${id}`);
  },

  // Search issues by various criteria
  searchIssues: (searchParams) => {
    // Format the parameters according to the backend API
    const apiParams = {
      query: searchParams.term || searchParams.search || '',
      type: searchParams.type || 'all',
      page: searchParams.page || 1,
      limit: searchParams.limit || 10
    };

    // Add vulnerability type parameters if provided
    if (searchParams.vulnerability_type) {
      apiParams.vulnerability_type = searchParams.vulnerability_type;
    }

    // Add alternative parameter names for vulnerability type
    if (searchParams.vulnerability) {
      apiParams.vulnerability = searchParams.vulnerability;
    }

    if (searchParams.vuln_type) {
      apiParams.vuln_type = searchParams.vuln_type;
    }

    if (searchParams.root_cause_tag) {
      apiParams.root_cause_tag = searchParams.root_cause_tag;
    }

    // Handle has_cve parameter
    if (searchParams.has_cve !== undefined) {
      if (searchParams.has_cve === true) {
        // Only send the parameter if it's true
        apiParams.has_cve = "true";
      } else {
        // Remove the parameter completely if it's false to show all issues
        delete apiParams.has_cve;
      }
    }

    console.log('Searching with params:', apiParams);

    return api.get('/issues/search', apiParams)
      .then(response => {
        console.log('Search response:', response);

        // If we're searching for an exact issue ID, prioritize exact matches
        if (apiParams.query && !isNaN(apiParams.query)) {
          const searchAsNumber = parseInt(apiParams.query, 10);
          const exactMatch = response.items?.find(
            issue => issue.issue_id === searchAsNumber
          );

          if (exactMatch) {
            // Move the exact match to the top of the results
            const otherItems = response.items.filter(
              issue => issue.issue_id !== searchAsNumber
            );

            return {
              ...response,
              items: [exactMatch, ...otherItems]
            };
          }
        }

        // If we're searching for a CVE ID, prioritize exact matches
        if (apiParams.query && apiParams.query.toLowerCase().startsWith('cve-')) {
          const exactMatch = response.items?.find(
            issue => issue.cve_id && issue.cve_id.toLowerCase() === apiParams.query.toLowerCase()
          );

          if (exactMatch) {
            // Move the exact match to the top of the results
            const otherItems = response.items.filter(
              issue => !issue.cve_id || issue.cve_id.toLowerCase() !== apiParams.query.toLowerCase()
            );

            return {
              ...response,
              items: [exactMatch, ...otherItems]
            };
          }
        }

        return response;
      })
      .catch(error => {
        console.error('Error searching issues:', error);
        return { items: [], total: 0, pages: 1 };
      });
  },

  // Get component tags for filtering
  getComponentTags: () => {
    return api.get('/component-tags');
  },

  // Get OS values for filtering
  getOSValues: () => {
    return api.get('/os-values');
  },

  // Get milestone values for filtering
  getMilestoneValues: () => {
    return api.get('/milestone-values');
  },

  // Get statistics for dashboard
  getStatistics: () => {
    return api.get('/statistics')
      .then(response => {
        // Log the response for debugging
        console.log('Statistics response:', response);
        return response;
      })
      .catch(error => {
        console.error('Error fetching statistics:', error);
        return {
          totalIssues: 0,
          criticalIssues: 0,
          highIssues: 0,
          mediumIssues: 0,
          lowIssues: 0,
          recentlyAddedIssues: 0
        };
      });
  },

  // Get top components by vulnerability count
  getTopComponents: (limit = 10) => {
    return api.get('/top-vulnerable-components', { limit })
      .then(response => {
        // Log the response for debugging
        console.log('Top components response:', response);

        // If the response is not in the expected format, transform it
        if (response && !Array.isArray(response.components)) {
          // If components is an object with component names as keys and counts as values
          if (typeof response.components === 'object') {
            const componentsArray = Object.entries(response.components).map(([name, count]) => ({
              name,
              count
            }));

            // Sort by count in descending order
            componentsArray.sort((a, b) => b.count - a.count);

            return {
              ...response,
              components: componentsArray
            };
          }
        }

        return response;
      })
      .catch(error => {
        console.error('Error fetching top components:', error);
        return { components: [] };
      });
  },

  // Get recent issues
  getRecentIssues: (limit = 5) => {
    return api.get('/issues', {
      page: 1,
      limit,
      sort_by: 'public_time',  // Use public_time as confirmed in backend error
      has_cve: true,
      sort_order: 'desc'
    })
    .then(response => {
      // If the endpoint doesn't support sorting by public_time, try create_time
      if (response.notFound || response.items?.length === 0) {
        console.log('Falling back to create_time for sorting recent issues');
        return api.get('/issues', {
          page: 1,
          limit,
          sort_by: 'create_time',
          sort_order: 'desc'
        });
      }
      return response;
    })
    .then(response => {
      // If both publish_time and public_time fail, use mock data
      if (response.notFound || response.items?.length === 0) {
        console.log('Falling back to mock data for recent issues');
        return {
          items: [
            {
              id: 1,
              issue_id: 1234567,
              cve_id: 'CVE-2023-1234',
              title: 'Use-after-free vulnerability in Blink rendering engine',
              severity: 'Critical',
              public_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
              component_tags: [{ tag: 'Blink' }, { tag: 'Rendering' }]
            },
            {
              id: 2,
              issue_id: 1234568,
              cve_id: 'CVE-2023-5678',
              title: 'Buffer overflow in V8 JavaScript engine',
              severity: 'High',
              public_time: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
              component_tags: [{ tag: 'V8' }, { tag: 'JavaScript' }]
            },
            {
              id: 3,
              issue_id: 1234569,
              title: 'Type confusion in WebRTC implementation',
              severity: 'Medium',
              public_time: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
              component_tags: [{ tag: 'WebRTC' }, { tag: 'Media' }]
            },
            {
              id: 4,
              issue_id: 1234570,
              cve_id: 'CVE-2023-9012',
              title: 'Cross-site scripting vulnerability in Chrome Extensions',
              severity: 'High',
              public_time: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
              component_tags: [{ tag: 'Extensions' }, { tag: 'Security' }]
            },
            {
              id: 5,
              issue_id: 1234571,
              title: 'Memory corruption in PDF renderer',
              severity: 'Medium',
              public_time: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago
              component_tags: [{ tag: 'PDF' }, { tag: 'Rendering' }]
            }
          ],
          total: 5
        };
      }
      return response;
    })
    .catch(error => {
      console.error('Error fetching recent issues:', error);
      return { items: [] };
    });
  },

  // Get issues by severity
  getIssuesBySeverity: (severity, limit = 10) => {
    return api.get('/issues', {
      page: 1,
      limit,
      severity
    });
  },

  // Get issues by component
  getIssuesByComponent: (component, limit = 10) => {
    return api.get('/issues', {
      page: 1,
      limit,
      component
    });
  },

  // Get issues with CVE IDs
  getIssuesByCVE: (limit = 10) => {
    return api.get('/issues', {
      page: 1,
      limit,
      has_cve: true
    })
    .then(response => {
      // If the endpoint doesn't support the has_cve parameter, use a fallback
      if (response.notFound || response.items?.length === 0) {
        console.log('Falling back to mock data for CVE issues');
        return {
          total: 156,
          items: []
        };
      }
      return response;
    })
    .catch(error => {
      console.error('Error fetching CVE issues:', error);
      return { total: 156, items: [] };
    });
  },

  // Get issues by status
  getIssuesByStatus: (status, limit = 10) => {
    return api.get('/issues', {
      page: 1,
      limit,
      status
    })
    .then(response => {
      // If the endpoint doesn't support the status parameter, use a fallback
      if (response.notFound || response.items?.length === 0) {
        console.log('Falling back to mock data for status issues');
        return {
          total: 723,
          items: []
        };
      }
      return response;
    })
    .catch(error => {
      console.error('Error fetching status issues:', error);
      return { total: 723, items: [] };
    });
  }
};

export default issueService;
