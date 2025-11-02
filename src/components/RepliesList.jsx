import React from 'react';
import { Copy } from 'lucide-react';

function RepliesList({ suggestions = [], loading }) {
  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard');
    } catch (e) {
      alert('Failed to copy');
    }
  };

  if (loading) {
    return (
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl border border-white/10 bg-white/5" />
        ))}
      </div>
    );
  }

  if (!suggestions.length) return null;

  return (
    <section className="mt-8">
      <h3 className="mb-3 text-sm font-medium text-white/70">Your AI reply suggestions</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {suggestions.map((s, idx) => (
          <div key={idx} className="flex h-full flex-col justify-between rounded-xl border border-white/10 bg-zinc-900/60 p-4">
            <p className="text-sm leading-relaxed text-white/90">{s}</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => copyText(s)}
                className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-1.5 text-xs text-white hover:border-white/40"
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RepliesList;
