'use client';

import { Suspense } from 'react';
import IssuesContent from './IssuesContent';

export default function IssuesPage() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-gray-700 dark:text-gray-300">Loading issues...</div>}>
      <IssuesContent />
    </Suspense>
  );
}
