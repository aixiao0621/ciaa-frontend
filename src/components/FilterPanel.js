'use client';

import { useState } from 'react';
import HierarchicalFilter from './HierarchicalFilter';

export default function FilterPanel({ onFilter, availableFilters = {} }) {
  const [filters, setFilters] = useState({
    severity: [],
    priority: [],
    status: [],
    components: [],
    os: [],
    vulnerability_types: [],
    has_cve: false,
  });

  const handleCheckboxChange = (category, value) => {
    const updatedFilters = { ...filters };

    if (updatedFilters[category].includes(value)) {
      updatedFilters[category] = updatedFilters[category].filter(item => item !== value);
    } else {
      updatedFilters[category] = [...updatedFilters[category], value];
    }

    setFilters(updatedFilters);
    onFilter(updatedFilters);
  };

  const handleToggleChange = (category) => {
    const updatedFilters = {
      ...filters,
      [category]: !filters[category]
    };

    setFilters(updatedFilters);
    onFilter(updatedFilters);
  };

  // Use available filters from props or fallback to defaults
  const severityOptions = availableFilters.severities || ['Critical', 'High', 'Medium', 'Low'];
  const priorityOptions = availableFilters.priorities || ['P0', 'P1', 'P2', 'P3'];
  // const statusOptions = availableFilters.statuses || ['New', 'Fixed', 'Verified', 'Assigned']; // Unused for now
  const componentOptions = availableFilters.components || [];
  const osOptions = availableFilters.os || [];
  const vulnerabilityTypeOptions = availableFilters.vulnerability_types || [
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
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Filters</h3>

      {/* CVE Filter Toggle */}
      <div className="mb-4">
        <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">CVE Vulnerabilities</h4>
        <div className="flex items-center">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={filters.has_cve}
              onChange={() => handleToggleChange('has_cve')}
            />
            <div className={`relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 ${filters.has_cve ? 'bg-blue-600 dark:bg-blue-500' : ''}`}></div>
            <span className="ms-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              {filters.has_cve ? 'Only CVE Issues' : 'All Issues'}
            </span>
          </label>
        </div>
      </div>

      {componentOptions.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Components</h4>
          <HierarchicalFilter
            options={componentOptions}
            selectedOptions={filters.components}
            onChange={(option) => handleCheckboxChange('components', option)}
            maxHeight="36rem"
          />
        </div>
      )}

      <div className="mb-4">
        <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Severity</h4>
        <div className="space-y-1">
          {severityOptions.map(option => (
            <div key={option} className="flex items-center">
              <input
                type="checkbox"
                id={`severity-${option}`}
                checked={filters.severity.includes(option)}
                onChange={() => handleCheckboxChange('severity', option)}
                className="mr-2 accent-blue-600 dark:accent-blue-500"
              />
              <label htmlFor={`severity-${option}`} className="text-gray-700 dark:text-gray-300">{option}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Priority</h4>
        <div className="space-y-1">
          {priorityOptions.map(option => (
            <div key={option} className="flex items-center">
              <input
                type="checkbox"
                id={`priority-${option}`}
                checked={filters.priority.includes(option)}
                onChange={() => handleCheckboxChange('priority', option)}
                className="mr-2 accent-blue-600 dark:accent-blue-500"
              />
              <label htmlFor={`priority-${option}`} className="text-gray-700 dark:text-gray-300">{option}</label>
            </div>
          ))}
        </div>
      </div>

      {osOptions.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Operating Systems</h4>
          <div className="space-y-1">
            {osOptions.map(option => (
              <div key={option} className="flex items-center">
                <input
                  type="checkbox"
                  id={`os-${option}`}
                  checked={filters.os.includes(option)}
                  onChange={() => handleCheckboxChange('os', option)}
                  className="mr-2 accent-blue-600 dark:accent-blue-500"
                />
                <label htmlFor={`os-${option}`} className="text-gray-700 dark:text-gray-300">{option}</label>
              </div>
            ))}
          </div>
        </div>
      )}

      {vulnerabilityTypeOptions.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Vulnerability Types</h4>
          <div className="relative">
            <input
              type="text"
              placeholder="Search vulnerability types..."
              className="w-full px-3 py-2 mb-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              onChange={(e) => {
                const searchElement = document.getElementById('vulnerability-types-container');
                if (searchElement) {
                  const searchTerm = e.target.value.toLowerCase();
                  const items = searchElement.querySelectorAll('.vulnerability-type-item');

                  items.forEach(item => {
                    const text = item.textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                      item.style.display = 'flex';
                    } else {
                      item.style.display = 'none';
                    }
                  });
                }
              }}
            />
          </div>
          <div
            id="vulnerability-types-container"
            className="max-h-40 overflow-y-auto space-y-1 pr-2 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-2"
          >
            {vulnerabilityTypeOptions.length > 0 ? (
              vulnerabilityTypeOptions.map(option => (
                <div key={option} className="flex items-center vulnerability-type-item">
                  <input
                    type="checkbox"
                    id={`vuln-${option.replace(/\s+/g, '-').toLowerCase()}`}
                    checked={filters.vulnerability_types.includes(option)}
                    onChange={() => handleCheckboxChange('vulnerability_types', option)}
                    className="mr-2 accent-blue-600 dark:accent-blue-500"
                  />
                  <label
                    htmlFor={`vuln-${option.replace(/\s+/g, '-').toLowerCase()}`}
                    className="text-gray-700 dark:text-gray-300 text-sm truncate"
                    title={option}
                  >
                    {option}
                  </label>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-2">
                No vulnerability types available
              </div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => {
          const clearedFilters = {
            severity: [],
            priority: [],
            status: [],
            components: [],
            os: [],
            vulnerability_types: [],
            has_cve: false,
          };
          setFilters(clearedFilters);
          onFilter(clearedFilters);
        }}
        className="w-full py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );
}
