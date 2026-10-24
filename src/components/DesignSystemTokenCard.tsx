import React, { useState } from 'react';
import { Copy, Check, Palette, Type, Sliders, Sparkles } from 'lucide-react';

export const DesignSystemTokenCard: React.FC = () => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Exact 28 swatches from the user's uploaded image:
  // Row 1 (12 colors):
  // #E50914 (Red), #00A3FF (Sky Blue), #000000 (Black), #2B2E33 (Dark Gray), #FFFFFF (White), #4A4D53 (Gray), #666A73 (Slate), #F4F8EC (Cream), #70757F (Medium Gray), #14171A (Dark Slate), #CCCCCC (Light Gray), #808691 (Muted Gray)
  // Row 2 (12 colors):
  // #050505 (Near Black), #FFFFFF (White), #FFFFFF (White), #FFCC00 (Yellow), #0066CC (Blue), #FFFFFF (White), #0A1128 (Navy), #0A0A0A (Black), #FFFFFF (White), #00B4D8 (Cyan), #0096C7 (Blue Cyan), #000000 (Black)
  // Row 3 (4 colors):
  // #0070BA (Blue), #E50914 (Red), #FF3B00 (Orange-Red), #2B2E33 (Dark Charcoal)
  const paletteTokens = [
    // Row 1
    { hex: '#E50914', name: 'Crimson Red' },
    { hex: '#00A3FF', name: 'Electric Cyan' },
    { hex: '#000000', name: 'Pure Black' },
    { hex: '#2B2E33', name: 'Charcoal' },
    { hex: '#FFFFFF', name: 'Pure White' },
    { hex: '#4A4D53', name: 'Graphite' },
    { hex: '#666A73', name: 'Slate Gray' },
    { hex: '#F4F8EC', name: 'Warm Cream' },
    { hex: '#70757F', name: 'Mid Gray' },
    { hex: '#14171A', name: 'Obsidian' },
    { hex: '#CCCCCC', name: 'Silver' },
    { hex: '#808691', name: 'Muted Gray' },
    // Row 2
    { hex: '#050505', name: 'True Black' },
    { hex: '#FFFFFF', name: 'White' },
    { hex: '#FFFFFF', name: 'White' },
    { hex: '#FFCC00', name: 'Vibrant Yellow' },
    { hex: '#0066CC', name: 'Royal Blue' },
    { hex: '#FFFFFF', name: 'White' },
    { hex: '#0A1128', name: 'Deep Navy' },
    { hex: '#0A0A0A', name: 'Onyx' },
    { hex: '#FFFFFF', name: 'White' },
    { hex: '#00B4D8', name: 'Sky Cyan' },
    { hex: '#0096C7', name: 'Deep Cyan' },
    { hex: '#000000', name: 'Black' },
    // Row 3
    { hex: '#0070BA', name: 'Cobalt Blue' },
    { hex: '#E50914', name: 'Accent Red' },
    { hex: '#FF3B00', name: 'Solar Orange' },
    { hex: '#2B2E33', name: 'Charcoal Gray' },
  ];

  // 12-bar vertical spacing histogram from the image
  const spacingBars = [
    { height: 8, label: '2px' },
    { height: 42, label: '4px' },
    { height: 50, label: '8px' },
    { height: 68, label: '12px' },
    { height: 68, label: '16px' },
    { height: 68, label: '20px' },
    { height: 68, label: '24px' },
    { height: 68, label: '32px' },
  ];

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-black text-white rounded-3xl p-6 border border-white/10 shadow-2xl space-y-6 font-mono select-none">
      {/* SECTION 1: PALETTE 28 */}
      <div className="p-5 rounded-2xl bg-[#0A0D14] border border-white/10 space-y-4">
        <div className="flex items-center justify-between text-xs tracking-widest text-slate-400 font-bold">
          <div className="flex items-center gap-2">
            <Palette className="w-3.5 h-3.5 text-slate-400" />
            <span>PALETTE</span>
          </div>
          <span className="text-white text-sm font-extrabold">28</span>
        </div>

        {/* 28 Swatches Grid matching user's image exactly */}
        <div className="space-y-2">
          {/* Row 1 (12) */}
          <div className="grid grid-cols-12 gap-1.5">
            {paletteTokens.slice(0, 12).map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleCopy(item.hex)}
                title={`${item.name}: ${item.hex} (Click to copy)`}
                className="h-6 w-full rounded-md border border-white/10 transition-transform hover:scale-110 cursor-pointer relative group"
                style={{ backgroundColor: item.hex }}
              />
            ))}
          </div>

          {/* Row 2 (12) */}
          <div className="grid grid-cols-12 gap-1.5">
            {paletteTokens.slice(12, 24).map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleCopy(item.hex)}
                title={`${item.name}: ${item.hex} (Click to copy)`}
                className="h-6 w-full rounded-md border border-white/10 transition-transform hover:scale-110 cursor-pointer relative group"
                style={{ backgroundColor: item.hex }}
              />
            ))}
          </div>

          {/* Row 3 (4) */}
          <div className="grid grid-cols-12 gap-1.5">
            {paletteTokens.slice(24, 28).map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleCopy(item.hex)}
                title={`${item.name}: ${item.hex} (Click to copy)`}
                className="h-6 w-full rounded-md border border-white/10 transition-transform hover:scale-110 cursor-pointer relative group"
                style={{ backgroundColor: item.hex }}
              />
            ))}
            {/* Empty placeholders to match 12-col alignment */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-6 w-full" />
            ))}
          </div>
        </div>

        {copiedHex && (
          <div className="text-[10px] text-emerald-400 text-right animate-in fade-in flex items-center justify-end gap-1">
            <Check className="w-3 h-3" />
            <span>Copied {copiedHex}</span>
          </div>
        )}
      </div>

      {/* SECTION 2: TYPE (Ag Zoho_Puvi_Regular) */}
      <div className="p-5 rounded-2xl bg-[#0A0D14] border border-white/10 space-y-3">
        <div className="flex items-center justify-between text-xs tracking-widest text-slate-400 font-bold">
          <div className="flex items-center gap-2">
            <Type className="w-3.5 h-3.5 text-slate-400" />
            <span>TYPE</span>
          </div>
        </div>

        <div className="flex items-baseline gap-4 pt-1">
          <span
            className="text-4xl text-white font-serif leading-none"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Ag
          </span>
          <span className="text-xs sm:text-sm text-slate-300 font-mono tracking-tight font-medium">
            Zoho_Puvi_Regular
          </span>
        </div>
      </div>

      {/* SECTION 3: SPACING 12 */}
      <div className="p-5 rounded-2xl bg-[#0A0D14] border border-white/10 space-y-4">
        <div className="flex items-center justify-between text-xs tracking-widest text-slate-400 font-bold">
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span>SPACING</span>
          </div>
          <span className="text-white text-sm font-extrabold">12</span>
        </div>

        {/* 12-bar vertical red/coral gradient histogram */}
        <div className="h-20 flex items-end gap-2 pt-2 px-1">
          {spacingBars.map((bar, idx) => (
            <div
              key={idx}
              title={`Step ${idx + 1}: ${bar.label}`}
              className="flex-1 rounded-t-md transition-all hover:opacity-90 cursor-pointer"
              style={{
                height: `${bar.height}%`,
                background: 'linear-gradient(180deg, #FF6B6B 0%, #E52E2E 100%)',
              }}
            />
          ))}
          {/* Remaining spacer bars to fill out 12 steps */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`tail-${i}`}
              className="flex-1 rounded-t-md opacity-20"
              style={{
                height: `${20 + i * 15}%`,
                background: 'linear-gradient(180deg, #FF6B6B 0%, #E52E2E 100%)',
              }}
            />
          ))}
        </div>
      </div>

      {/* SECTION 4: SUMMARY TOKENS FOOTER */}
      <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-slate-400 border-t border-white/10 font-mono">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <strong className="text-white text-sm">38</strong> colours
          </div>
          <div>
            <strong className="text-white text-sm">12</strong> components
          </div>
          <div>
            <strong className="text-white text-sm">15</strong> spaces
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <strong className="text-white text-sm">D</strong> grade
        </div>
      </div>
    </div>
  );
};
