import React, { useEffect, useRef, useState } from 'react';
import { Camera, Image as ImageIcon, FileText, KeyRound, Play } from 'lucide-react';

const TONES = ['Flirty', 'Friendly', 'Cool', 'Empathetic', 'Assertive'];

function InputPanel({ onGenerate, loading }) {
  const [apiKey, setApiKey] = useState('');
  const [mode, setMode] = useState('text'); // 'text' | 'image' | 'camera'
  const [text, setText] = useState('');
  const [note, setNote] = useState('');
  const [tone, setTone] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState('');

  // camera
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    // cleanup on unmount
    return () => stopCamera();
  }, [mode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (e) {
      console.error(e);
      alert('Camera access was blocked. Please allow camera permissions.');
      setMode('text');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    setImageDataUrl(dataUrl);
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleGenerate = () => {
    if (!tone) {
      alert('Please select a tone before generating.');
      return;
    }

    if (mode === 'text' && !text.trim()) {
      alert('Please enter some text or choose another input option.');
      return;
    }

    if ((mode === 'image' || mode === 'camera') && !imageDataUrl) {
      alert('Please upload an image or capture a photo first.');
      return;
    }

    onGenerate({ apiKey, mode, text, note, tone, imageDataUrl });
  };

  return (
    <section className="-mt-10 rounded-2xl border border-white/10 bg-zinc-900/60 p-4 backdrop-blur md:p-6">
      <div className="flex flex-col gap-4">
        {/* API key */}
        <div className="grid gap-2 md:grid-cols-[220px_1fr] md:items-center">
          <label className="flex items-center gap-2 text-sm text-white/70">
            <KeyRound className="h-4 w-4" />
            OpenAI API Key
          </label>
          <input
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none ring-0 placeholder:text-white/30 focus:border-white/30"
          />
        </div>

        {/* Mode selector */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setMode('text')}
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
              mode === 'text'
                ? 'border-white bg-white text-black'
                : 'border-white/20 bg-black/40 text-white hover:border-white/40'
            }`}
          >
            <FileText className="h-4 w-4" />
            Type Text
          </button>
          <button
            onClick={() => setMode('camera')}
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
              mode === 'camera'
                ? 'border-white bg-white text-black'
                : 'border-white/20 bg-black/40 text-white hover:border-white/40'
            }`}
          >
            <Camera className="h-4 w-4" />
            Take Photo
          </button>
          <button
            onClick={() => setMode('image')}
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
              mode === 'image'
                ? 'border-white bg-white text-black'
                : 'border-white/20 bg-black/40 text-white hover:border-white/40'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            Upload Image
          </button>
        </div>

        {/* Inputs */}
        {mode === 'text' && (
          <div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              placeholder="Type or paste the chat message you want to reply to..."
              className="w-full rounded-md border border-white/10 bg-black/40 p-3 text-sm outline-none placeholder:text-white/30 focus:border-white/30"
            />
          </div>
        )}

        {mode === 'camera' && (
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <div className="overflow-hidden rounded-lg border border-white/10">
              <video ref={videoRef} autoPlay playsInline className="h-64 w-full bg-black object-cover" />
            </div>
            <div className="flex flex-col justify-between gap-3">
              <button onClick={capturePhoto} className="rounded-md bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90">
                Capture Photo
              </button>
              {imageDataUrl && (
                <img src={imageDataUrl} alt="Captured" className="h-40 w-full rounded-md border border-white/10 object-cover" />
              )}
            </div>
          </div>
        )}

        {mode === 'image' && (
          <div className="flex flex-col gap-3">
            <input type="file" accept="image/*" onChange={onFileChange} className="text-sm text-white/80" />
            {imageDataUrl && (
              <img src={imageDataUrl} alt="Upload preview" className="h-64 w-full rounded-md border border-white/10 object-cover" />
            )}
          </div>
        )}

        {/* Tone selection */}
        <div className="mt-2">
          <p className="mb-2 text-sm text-white/70">Select a tone</p>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t.toLowerCase())}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  tone === t.toLowerCase()
                    ? 'bg-orange-500 text-black'
                    : 'border border-white/15 bg-black/40 text-white hover:border-white/40'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Personal note */}
        <div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Add a personal note (optional)"
            className="w-full rounded-md border border-white/10 bg-black/40 p-3 text-sm outline-none placeholder:text-white/30 focus:border-white/30"
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-white/50">
            By continuing, you agree to watch a short ad or unlock premium.
          </p>
          <button
            disabled={loading}
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Play className="h-4 w-4" />
            {loading ? 'Generating…' : 'Generate Reply Suggestions'}
          </button>
        </div>
      </div>
    </section>
  );
}

export default InputPanel;
