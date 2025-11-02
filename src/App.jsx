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
    if (!payload?.apiKey) {
      setError('Please enter your OpenAI API key.');
      return;
    }
    setLoading(true);
    setError('');
    setSuggestions([]);

    try {
      const systemPrompt = "You are an assistant that crafts concise, natural-sounding chat replies. Always return a compact JSON object with a `suggestions` array of exactly two short strings. Keep them under 25 words each, casual and context-aware.";

      const userSummary = `Here is the input content.\nTone: ${payload.tone}.\nPersonal note: ${payload.note || 'N/A'}.\nIf an image is provided, analyze it for chat context and extract any text you can read.\nReturn JSON strictly as {\"suggestions\":[\"...\",\"...\"]}.`;

      const content = [
        { type: 'text', text: userSummary },
      ];

      if (payload.mode === 'text' && payload.text) {
        content.push({ type: 'text', text: `User text: ${payload.text}` });
      }

      if ((payload.mode === 'image' || payload.mode === 'camera') && payload.imageDataUrl) {
        content.push({
          type: 'image_url',
          image_url: {
            url: payload.imageDataUrl,
          },
        });
      }

      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${payload.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content },
          ],
          max_tokens: 200,
          temperature: 0.8,
        }),
      });

      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(t || 'Request failed');
      }

      const data = await resp.json();
      const message = data?.choices?.[0]?.message?.content || '';

      // Try to parse JSON block from the model
      let parsed = null;
      try {
        const jsonMatch = message.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      } catch {
        parsed = null;
      }

      const out = Array.isArray(parsed?.suggestions)
        ? parsed.suggestions.slice(0, 2)
        : message
            .split(/\n|\r/)
            .map((l) => l.replace(/^\d+\.|^-\s*/, '').trim())
            .filter(Boolean)
            .slice(0, 2);

      if (out.length < 2) {
        throw new Error('Could not parse two suggestions from the AI response.');
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
