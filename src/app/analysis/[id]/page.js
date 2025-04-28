'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AnalysisDetail from '../../../components/AnalysisDetail';

// Mock data for analysis
const mockAnalysis = {
  id: 1,
  issue_record_id: 1,
  overview_title: 'Use-after-free in Blink Rendering Engine',
  overview_description: 'This vulnerability allows attackers to potentially execute arbitrary code via a specially crafted webpage that triggers memory corruption in the Blink rendering engine.\n\nThe vulnerability exists in the way Blink handles object lifetimes during rendering operations, which can lead to memory being accessed after it has been freed.',
  root_cause_location: 'src/third_party/blink/renderer/core/layout/layout_object.cc',
  root_cause_snippet: `void LayoutObject::UpdateLayout() {
  // ... [code omitted for brevity]
  
  if (needsLayout) {
    LayoutAnalyzer::Scope analyzer(*this);
    
    // This is where the vulnerability occurs
    // The object is freed but a pointer to it is still maintained
    delete m_layoutObject;  // Free the object
    
    // ... [more code]
    
    // Later, the freed object is accessed
    m_layoutObject->UpdateStyle();  // Use after free!
  }
}`,
  root_cause_analysis: 'The vulnerability is a classic use-after-free issue where an object is deleted but a reference to it is maintained and later accessed. This occurs in the UpdateLayout method of the LayoutObject class.\n\nWhen the needsLayout condition is true, the code frees m_layoutObject but doesn\'t set the pointer to null. Later in the execution flow, the code attempts to call UpdateStyle() on the freed object, leading to memory corruption.\n\nThis vulnerability is particularly dangerous because it can be triggered by simply loading a specially crafted webpage, requiring minimal user interaction.',
  root_cause_tag: 'Use-After-Free',
  patch_commit_id: 'abc123def456ghijklmno',
  patch_code_change: `diff --git a/src/third_party/blink/renderer/core/layout/layout_object.cc b/src/third_party/blink/renderer/core/layout/layout_object.cc
--- a/src/third_party/blink/renderer/core/layout/layout_object.cc
+++ b/src/third_party/blink/renderer/core/layout/layout_object.cc
@@ -1256,7 +1256,10 @@ void LayoutObject::UpdateLayout() {
   if (needsLayout) {
     LayoutAnalyzer::Scope analyzer(*this);
     
-    delete m_layoutObject;
+    // Fix: Delete the object and set pointer to null
+    if (m_layoutObject) {
+      delete m_layoutObject;
+      m_layoutObject = nullptr;
+    }
     
     // ... [more code]
-    m_layoutObject->UpdateStyle();
+    // Check if pointer is valid before using
+    if (m_layoutObject) {
+      m_layoutObject->UpdateStyle();
+    }
   }
 }`,
  cvss_base_score: '8.8',
  cvss_attack_vector: 'Network',
  cvss_privilege_required: 'None',
  cvss_user_interaction: 'Required',
  cvss_vector_string: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H',
  created_at: '2023-06-05T10:30:00Z',
  updated_at: '2023-06-10T14:25:00Z'
};

export default function AnalysisPage() {
  const params = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real implementation, this would fetch data from the API
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      try {
        // In a real app, we would fetch the analysis with the issue ID from params.id
        setAnalysis(mockAnalysis);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load analysis details');
        setIsLoading(false);
      }
    }, 500);
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <div className="text-center py-10">Loading analysis details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md">
          <p>No analysis found for this issue</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <AnalysisDetail analysis={analysis} issueId={params.id} />
    </div>
  );
}
