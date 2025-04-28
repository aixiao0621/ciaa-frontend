'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import IssueDetail from '../../../components/IssueDetail';
import AnalysisDetail from '../../../components/AnalysisDetail';
import issueService from '../../../services/issueService';
import analysisService from '../../../services/analysisService';

export default function IssuePage() {
  const params = useParams();
  const [issue, setIssue] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis');

  useEffect(() => {
    const fetchIssueAndAnalysis = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch issue details
        const issueData = await issueService.getIssueById(params.id);
        setIssue(issueData);

        try {
          // Fetch analysis if available
          const analysisData = await analysisService.getAnalysisById(params.id);
          setAnalysis(analysisData);
        } catch (analysisErr) {
          // It's okay if there's no analysis, just set it to null
          console.log('No analysis available for this issue');
          setAnalysis(null);
        }

      } catch (err) {
        console.error('Error fetching issue details:', err);
        setError('Failed to load issue details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssueAndAnalysis();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <div className="text-center py-10">Loading issue details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300 p-4 rounded-md">
          <p>{error}</p>
          <Link href="/issues" className="text-red-600 dark:text-red-400 hover:underline mt-2 inline-block">
            Return to issues list
          </Link>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300 p-4 rounded-md">
          <p>Issue not found</p>
          <Link href="/issues" className="text-yellow-600 dark:text-yellow-400 hover:underline mt-2 inline-block">
            Return to issues list
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-6">
        <Link href="/issues" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline">
          ← Back
        </Link>
      </div>

      {/* Tab Navigation - Only show Analysis tab if analysis is available */}
      {analysis && (
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <ul className="flex flex-wrap -mb-px">
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('analysis')}
                className={`inline-block py-2 px-4 text-sm font-medium ${
                  activeTab === 'analysis'
                    ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Security Analysis
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('details')}
                className={`inline-block py-2 px-4 text-sm font-medium ${
                  activeTab === 'details'
                    ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Issue Details
              </button>
            </li>
          </ul>
        </div>
      )}

      {/* Tab Content */}
      <div>
        {analysis && activeTab === 'analysis' && <AnalysisDetail analysis={analysis} issue={issue} />}
        {(!analysis || activeTab === 'details') && <IssueDetail issue={issue} />}
      </div>
    </div>
  );
}
