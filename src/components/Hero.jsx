import React from 'react';
import Spline from '@splinetool/react-spline';

function Hero() {
  return (
    <section className="relative h-[60vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline
          scene="https://prod.spline.design/AeAqaKLmGsS-FPBN/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

      <div className="relative z-10 mx-auto flex h-full max-w-5xl items-center px-4">
        <div>
          <h1 className="text-balance font-extrabold tracking-tight text-white drop-shadow-sm [text-shadow:0_1px_16px_rgba(255,255,255,0.08)] md:text-6xl text-4xl">
            Smart Chat Reply Generator
          </h1>
          <p className="mt-3 max-w-2xl text-base text-white/80 md:text-lg">
            Type, snap, or upload your chat. Pick a vibe—flirty, friendly, cool, empathetic, or assertive—and get two AI-crafted replies in seconds.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Hero;
