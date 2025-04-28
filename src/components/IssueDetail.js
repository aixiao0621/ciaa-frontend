'use client';

import Link from 'next/link';

export default function IssueDetail({ issue }) {
  // Format date to a readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  if (!issue) {
    return <div className="text-center py-10">Loading issue details...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 md:mb-0">{issue.title}</h1>
          <div className="flex flex-wrap gap-2">
            {issue.cve_id && (
              <span className="inline-block bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-medium">
                {issue.cve_id}
              </span>
            )}
            {issue.severity && (
              <span className={`${getSeverityColor(issue.severity)} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                {issue.severity}
              </span>
            )}
            {issue.priority && (
              <span className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                Priority: {issue.priority}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Issue ID:</span> {issue.issue_id}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Status:</span> {issue.status}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Published:</span> {formatDate(issue.public_time || issue.publish_time || issue.modified_time || issue.create_time)}
            </p>
          </div>
          <div>
            {issue.found_in && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Found in:</span> {issue.found_in}
              </p>
            )}
            {issue.vrp_reward && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">VRP Reward:</span> {issue.vrp_reward}
              </p>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Last Updated:</span> {formatDate(issue.last_updated_time)}
            </p>
          </div>
        </div>

        {issue.component_tags && issue.component_tags.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Components</h2>
            <div className="flex flex-wrap gap-2">
              {issue.component_tags.map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-sm">
                  {tag.tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {issue.os_values && issue.os_values.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Operating Systems</h2>
            <div className="flex flex-wrap gap-2">
              {issue.os_values.map((os, index) => (
                <span key={index} className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-sm">
                  {os.value}
                </span>
              ))}
            </div>
          </div>
        )}

        {issue.milestone_values && issue.milestone_values.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Milestones</h2>
            <div className="flex flex-wrap gap-2">
              {issue.milestone_values.map((milestone, index) => (
                <span key={index} className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-sm">
                  {milestone.value}
                </span>
              ))}
            </div>
          </div>
        )}

        {issue.description && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Description</h2>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">
              {issue.description}
            </div>
          </div>
        )}

        {issue.issues_url && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Issue URL</h2>
            <a
              href={issue.issues_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline break-all"
            >
              {issue.issues_url}
            </a>
          </div>
        )}

        {issue.code_change_links && issue.code_change_links.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Code Changes</h2>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
              {issue.code_change_links.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline break-all"
                  >
                    {link.link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {issue.commits && issue.commits.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Commits</h2>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
              {issue.commits.map((commit, index) => (
                <li key={index}>
                  <a
                    href={commit.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                  >
                    {commit.project} - {commit.change_id || 'View Commit'}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {issue.comments && issue.comments.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Comments ({issue.comments.length})</h2>
            <div className="space-y-4">
              {issue.comments.map((comment, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{comment.author || 'Anonymous'}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{comment.formatted_time || comment.timestamp}</span>
                  </div>
                  <div className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">{comment.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}


      </div>
    </div>
  );
}
