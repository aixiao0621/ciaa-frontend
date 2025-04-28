// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ciaa-backend.vercel.app';

// Helper function for handling API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    // For 404 errors, return an empty result instead of throwing
    if (response.status === 404) {
      console.warn(`Endpoint not found: ${response.url}`);
      return { notFound: true };
    }

    // Try to get error message from response
    let errorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || `API error: ${response.status}`;
    } catch (e) {
      errorMessage = `API error: ${response.status}`;
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    console.log(`API Request: ${url}`);
    const response = await fetch(url, config);
    const result = await handleResponse(response);
    console.log(`API Response for ${endpoint}:`, result);
    return result;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);

    // Check if it's a network error (like CORS or server not running)
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      console.error('Network error - check if the API server is running at:', API_BASE_URL);
    }

    throw error;
  }
};

// Export API methods
export const api = {
  get: (endpoint, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return apiRequest(url, { method: 'GET' });
  },

  post: (endpoint, data) => {
    return apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put: (endpoint, data) => {
    return apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: (endpoint) => {
    return apiRequest(endpoint, { method: 'DELETE' });
  },
};

export default api;
