import React, { Suspense } from "react";

const CreateFromNL = React.lazy(() => import("../components/AI/CreateFromNL"));

export default function AIAssistantPage() {
  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 12 }}>AI Assistant</h1>
      <p style={{ marginTop: 0, color: "#6b7280" }}>
        Paste your Gemini API key for demo, enter instructions, preview &
        confirm to create tasks.
      </p>

      <div style={{ marginTop: 16, maxWidth: 920 }}>
        <Suspense fallback={<div>Loading AI assistant...</div>}>
          <CreateFromNL />
        </Suspense>
      </div>
    </div>
  );
}
