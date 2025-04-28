'use client';

import Link from 'next/link';

export default function IssueCard({ issue }) {
  // Function to determine severity badge color
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 's0':
        return 'bg-red-600';
      case 's1':
        return 'bg-orange-500';
      case 's2':
        return 'bg-yellow-500';
      case 's3':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'p0':
        return 'bg-red-600';
      case 'p1':
        return 'bg-orange-500';
      case 'p2':
        return 'bg-yellow-500';
      case 'p3':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700">
      <div className="p-4">
        <div className="flex flex-col mb-2">
          <div className="flex gap-2 justify-between items-start mb-2">
            <div className="flex-grow mr-2">
              <Link href={`/issues/${issue.id}`} className="text-lg font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline line-clamp-2">
                {issue.title}
              </Link>
            </div>
            {issue.severity && (
              <span className={`${getSeverityColor(issue.severity)} text-white text-xs px-2 py-1 rounded flex-shrink-0`}>
                {issue.severity}
              </span>
            )}
            {issue.priority && (
              <span className={`${getPriorityColor(issue.priority)} text-white text-xs px-2 py-1 rounded flex-shrink-0`}>
                {issue.priority}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Issue ID:</span> {issue.issue_id}
            </span>
            {issue.cve_id && (
              <span className="inline-block bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs px-2 py-1 rounded">
                {issue.cve_id}
              </span>
            )}
          </div>
        </div>

        {issue.component_tags && issue.component_tags.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {issue.component_tags.map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 text-xs px-2 py-1 rounded">
                  {tag.tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="text-sm text-gray-500 dark:text-gray-400 mt-3 flex justify-between">
          <span>Published: {formatDate(issue.public_time || issue.publish_time || issue.modified_time || issue.create_time)}</span>
          <span>Status: {issue.status || 'Unknown'}</span>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-t border-gray-200 dark:border-gray-700">
        <Link href={`/issues/${issue.id}`} className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline">
          View Details →
        </Link>
      </div>
    </div>
  );
}
