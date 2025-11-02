import React, { useEffect, useState } from 'react';

function MonetizationModal({ open, onClose, onAdCompleted }) {
  const [watching, setWatching] = useState(false);
  const [countdown, setCountdown] = useState(6);

  useEffect(() => {
    let timer;
    if (open && watching) {
      setCountdown(6);
      timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            setWatching(false);
            onAdCompleted?.();
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [open, watching, onAdCompleted]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
        {!watching ? (
          <>
            <h3 className="text-xl font-semibold">Unlock to Generate Replies</h3>
            <p className="mt-2 text-sm text-white/70">
              Choose an option to continue. Watching a short ad will unlock this generation.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <a
                href="/subscribe"
                className="rounded-md border border-white/20 bg-black/40 px-4 py-2 text-center text-sm hover:border-white/40"
              >
                Unlock Premium
              </a>
              <button
                onClick={() => setWatching(true)}
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90"
              >
                Watch an Ad to Continue
              </button>
            </div>
            <button onClick={onClose} className="mt-4 text-xs text-white/60 underline">
              Cancel
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <div className="mb-3 h-40 w-full overflow-hidden rounded-md border border-white/10 bg-black/60">
              <div className="flex h-full w-full items-center justify-center text-white/70">Ad playing… {countdown}s</div>
            </div>
            <p className="text-sm text-white/70">Please keep this window open until the ad finishes.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MonetizationModal;
