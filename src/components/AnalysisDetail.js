'use client';

import Link from 'next/link';

export default function AnalysisDetail({ analysis, issue }) {
  if (!analysis || !issue) {
    return <div className="text-center py-10">Loading analysis details...</div>;
  }

  // Format date to a readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Function to determine severity badge color
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-600';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header with CVE ID, Severity, and Priority */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {issue.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              {issue.cve_id && (
                <span className="inline-block bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 px-3 py-1 rounded-md text-sm font-medium">
                  {issue.cve_id}
                </span>
              )}
              <div className="flex items-center gap-3">
                {issue.severity && (
                  <div className="flex items-center">
                    <span className={`${getSeverityColor(issue.severity)} text-white px-3 py-1 rounded-md text-sm font-medium`}>
                      {issue.severity}
                    </span>
                  </div>
                )}
                {issue.priority && (
                  <div className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 px-3 py-1 rounded-md text-sm font-medium">
                      Priority: {issue.priority}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Metadata Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Components Card */}
          {issue.component_tags && issue.component_tags.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-md font-medium mb-3 text-gray-800 dark:text-gray-200 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                </svg>
                Components
              </h3>
              <div className="flex flex-wrap gap-2">
                {issue.component_tags.map((tag, index) => (
                  <span key={index} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3 py-1 rounded-md text-sm text-gray-700 dark:text-gray-300">
                    {tag.tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Operating Systems Card */}
          {issue.os_values && issue.os_values.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-md font-medium mb-3 text-gray-800 dark:text-gray-200 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                </svg>
                Operating Systems
              </h3>
              <div className="flex flex-wrap gap-2">
                {issue.os_values.map((os, index) => (
                  <span key={index} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3 py-1 rounded-md text-sm text-gray-700 dark:text-gray-300">
                    {os.value}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Milestones Card */}
          {issue.milestone_values && issue.milestone_values.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-md font-medium mb-3 text-gray-800 dark:text-gray-200 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Milestones
              </h3>
              <div className="flex flex-wrap gap-2">
                {issue.milestone_values.map((milestone, index) => (
                  <span key={index} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3 py-1 rounded-md text-sm text-gray-700 dark:text-gray-300">
                    {milestone.value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Security Analysis Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200 pb-2 border-b border-gray-200 dark:border-gray-700">
            Security Analysis
          </h2>

          {/* Overview Section */}
          {analysis.overview_title && (
            <div className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {analysis.overview_title}
                </h3>
              </div>
              {analysis.overview_description && (
                <div className="p-4">
                  <div className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">
                    {analysis.overview_description}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CVSS Metrics Section */}
          {analysis.cvss_base_score && (
            <div className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  CVSS Metrics
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Base Score:</span>
                      <span className={`ml-2 px-2 py-1 rounded ${
                        parseFloat(analysis.cvss_base_score) >= 9.0 ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' :
                        parseFloat(analysis.cvss_base_score) >= 7.0 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200' :
                        parseFloat(analysis.cvss_base_score) >= 4.0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                      }`}>
                        {analysis.cvss_base_score}
                      </span>
                    </p>
                    <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Attack Vector:</span> {analysis.cvss_attack_vector}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Privilege Required:</span> {analysis.cvss_privilege_required}
                    </p>
                    <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
                      <span className="font-medium">User Interaction:</span> {analysis.cvss_user_interaction}
                    </p>
                  </div>
                  {analysis.cvss_vector_string && (
                    <div className="col-span-1 md:col-span-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Vector String:</span>
                        <code className="ml-2 px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded font-mono text-xs">
                          {analysis.cvss_vector_string}
                        </code>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Root Cause Analysis Section */}
          {(analysis.root_cause_analysis || analysis.root_cause_location || analysis.root_cause_snippet) && (
            <div className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  Root Cause Analysis
                </h3>
              </div>

              <div className="p-4">
                {analysis.root_cause_tag && (
                  <div className="mb-4">
                    <span className="inline-block bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 px-3 py-1 rounded-md text-sm font-medium">
                      Vulnerability Type: {analysis.root_cause_tag}
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  {analysis.root_cause_location && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-md overflow-hidden">
                      <div className="bg-gray-100 dark:bg-gray-600 px-3 py-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</h4>
                      </div>
                      <div className="p-3 font-mono text-sm overflow-x-auto text-gray-800 dark:text-gray-200">
                        {analysis.root_cause_location}
                      </div>
                    </div>
                  )}

                  {analysis.root_cause_snippet && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-md overflow-hidden">
                      <div className="bg-gray-100 dark:bg-gray-600 px-3 py-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Vulnerable Code</h4>
                      </div>
                      <div className="p-3 font-mono text-sm overflow-x-auto whitespace-pre text-gray-800 dark:text-gray-200">
                        {analysis.root_cause_snippet}
                      </div>
                    </div>
                  )}

                  {analysis.root_cause_analysis && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-md overflow-hidden">
                      <div className="bg-gray-100 dark:bg-gray-600 px-3 py-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Analysis</h4>
                      </div>
                      <div className="p-3 text-sm whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                        {analysis.root_cause_analysis}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Patch Analysis Section */}
          {(analysis.patch_commit_id || analysis.patch_code_change) && (
            <div className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Patch Analysis
                </h3>
              </div>

              <div className="p-4">
                <div className="space-y-4">
                  {analysis.patch_commit_id && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-md overflow-hidden">
                      <div className="bg-gray-100 dark:bg-gray-600 px-3 py-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Commit ID</h4>
                      </div>
                      <div className="p-3 font-mono text-sm text-gray-800 dark:text-gray-200">
                        {analysis.patch_commit_id}
                      </div>
                    </div>
                  )}

                  {analysis.patch_code_change && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-md overflow-hidden">
                      <div className="bg-gray-100 dark:bg-gray-600 px-3 py-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Code Changes</h4>
                      </div>
                      <div className="p-3 font-mono text-sm overflow-x-auto whitespace-pre text-gray-800 dark:text-gray-200">
                        {analysis.patch_code_change}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400">
            <p className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Last updated: {formatDate(analysis.updated_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
