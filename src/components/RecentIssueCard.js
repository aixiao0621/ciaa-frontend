'use client';

import Link from 'next/link';

export default function RecentIssueCard({ issue }) {
  // Function to determine severity badge color
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-600 dark:bg-red-500';
      case 'high':
        return 'bg-orange-500 dark:bg-orange-400';
      case 'medium':
        return 'bg-yellow-500 dark:bg-yellow-400';
      case 'low':
        return 'bg-blue-500 dark:bg-blue-400';
      default:
        return 'bg-gray-500 dark:bg-gray-400';
    }
  };

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

  return (
    <Link
      href={`/issues/${issue.id}`}
      className="block transition-transform hover:scale-[1.02] focus:outline-none hover:z-10 relative"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300 p-3 hover:border-teal-300 dark:hover:border-teal-500">
        <div className="flex items-start gap-2">
          <div className={`${getSeverityColor(issue.severity)} w-2 h-2 rounded-full mt-2 flex-shrink-0`}></div>
          <div className="flex-grow min-w-0">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {issue.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
              <span className="text-gray-500 dark:text-gray-400">
                {issue.issue_id}
              </span>
              {issue.cve_id && (
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-1.5 py-0.5 rounded">
                  {issue.cve_id}
                </span>
              )}
              <span className="text-gray-500 dark:text-gray-400">
                {formatDate(issue.public_time || issue.publish_time || issue.modified_time || issue.create_time)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
