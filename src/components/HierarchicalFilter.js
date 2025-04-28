'use client';

import { useState } from 'react';

export default function HierarchicalFilter({ options, selectedOptions, onChange, maxHeight = '16rem' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});

  // Parse hierarchical components (e.g., "UI>Browser>Accessibility" -> ["UI", "Browser", "Accessibility"])
  const parseHierarchy = (components) => {
    const hierarchy = {};
    
    components.forEach(component => {
      const parts = component.split('>');
      
      // Add each level to the hierarchy
      let currentLevel = hierarchy;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i].trim();
        if (!part) continue;
        
        if (!currentLevel[part]) {
          currentLevel[part] = {
            children: {},
            fullPath: parts.slice(0, i + 1).join('>')
          };
        }
        
        currentLevel = currentLevel[part].children;
      }
    });
    
    return hierarchy;
  };

  // Toggle expanded state for a category
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Filter components based on search term
  const filterComponents = (components) => {
    if (!searchTerm) return components;
    
    return components.filter(component => 
      component.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Build the hierarchical component tree
  const renderComponentTree = (hierarchy, level = 0, parentPath = '') => {
    return Object.keys(hierarchy).sort().map(category => {
      const { children, fullPath } = hierarchy[category];
      const hasChildren = Object.keys(children).length > 0;
      const isExpanded = expandedCategories[fullPath] || false;
      const isSelected = selectedOptions.includes(fullPath);
      const indent = level * 0.75; // 0.75rem indentation per level
      
      // Skip if it doesn't match the search term (unless a child matches)
      if (searchTerm && !fullPath.toLowerCase().includes(searchTerm.toLowerCase())) {
        return null;
      }
      
      return (
        <div key={fullPath} style={{ marginLeft: `${indent}rem` }}>
          <div className="flex items-center py-1">
            {hasChildren && (
              <button 
                onClick={() => toggleCategory(fullPath)}
                className="mr-1 text-gray-500 dark:text-gray-400 focus:outline-none"
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-3 w-3 transition-transform ${isExpanded ? 'transform rotate-90' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            
            <div className="flex items-center flex-grow">
              <input
                type="checkbox"
                id={`component-${fullPath}`}
                checked={isSelected}
                onChange={() => onChange(fullPath)}
                className="mr-2 accent-blue-600 dark:accent-blue-500"
              />
              <label 
                htmlFor={`component-${fullPath}`} 
                className="text-gray-700 dark:text-gray-300 text-sm truncate"
                title={category}
              >
                {category}
              </label>
            </div>
          </div>
          
          {hasChildren && isExpanded && (
            <div className="ml-2">
              {renderComponentTree(children, level + 1, fullPath)}
            </div>
          )}
        </div>
      );
    });
  };

  // Build the component hierarchy
  const componentHierarchy = parseHierarchy(options);
  const filteredOptions = searchTerm ? filterComponents(options) : options;

  return (
    <div>
      <div className="mb-2">
        <input
          type="text"
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>
      
      <div
        className="overflow-y-auto pr-2 space-y-1"
        style={{ maxHeight }}
      >
        {searchTerm ? (
          // Flat list for search results
          filteredOptions.map(option => (
            <div key={option} className="flex items-center">
              <input
                type="checkbox"
                id={`component-search-${option}`}
                checked={selectedOptions.includes(option)}
                onChange={() => onChange(option)}
                className="mr-2 accent-blue-600 dark:accent-blue-500"
              />
              <label 
                htmlFor={`component-search-${option}`} 
                className="text-gray-700 dark:text-gray-300 text-sm"
                title={option}
              >
                {option}
              </label>
            </div>
          ))
        ) : (
          // Hierarchical tree for normal view
          renderComponentTree(componentHierarchy)
        )}
        
        {filteredOptions.length === 0 && (
          <div className="text-gray-500 dark:text-gray-400 text-sm py-2 text-center">
            No components match your search
          </div>
        )}
      </div>
    </div>
  );
}
