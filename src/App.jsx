import React, { useCallback, useState } from 'react';
import Hero from './components/Hero.jsx';
import InputPanel from './components/InputPanel.jsx';
import MonetizationModal from './components/MonetizationModal.jsx';
import RepliesList from './components/RepliesList.jsx';

function App() {
  const [showModal, setShowModal] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleRequestGenerate = useCallback((payload) => {
    setError('');
    setPendingPayload(payload);
    setShowModal(true);
  }, []);

  const generateReplies = useCallback(async (payload) => {
    setLoading(true);
    setError('');
    setSuggestions([]);

    try {
      const base = import.meta.env.VITE_BACKEND_URL || '';
      const resp = await fetch(`${base}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(t || 'Request failed');
      }

      const data = await resp.json();
      const out = Array.isArray(data?.suggestions) ? data.suggestions.slice(0, 2) : [];
      if (out.length < 2) {
        throw new Error('The server did not return two suggestions.');
      }
      setSuggestions(out);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Something went wrong generating replies.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAdCompleted = useCallback(() => {
    setShowModal(false);
    if (pendingPayload) {
      generateReplies(pendingPayload);
      setPendingPayload(null);
    }
  }, [pendingPayload, generateReplies]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Hero />

      <main className="relative z-10 mx-auto max-w-4xl px-4 pb-24">
        <InputPanel onGenerate={handleRequestGenerate} loading={loading} />

        {error && (
          <div className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <RepliesList suggestions={suggestions} loading={loading} />
      </main>

      <MonetizationModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onAdCompleted={handleAdCompleted}
      />
    </div>
  );
}

export default App;
