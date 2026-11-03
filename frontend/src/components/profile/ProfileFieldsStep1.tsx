"use client";

import React from "react";

// ─── Shared field shell ──────────────────────────────────────────────────────

const inputCls =
  "w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-4 py-3 text-white text-base outline-none focus:border-white/30 transition-colors";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-wider text-white/50 mb-1.5 ml-1">
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Build (body type) — abstract silhouette glyph + pill ──────────────────

export const BUILD_OPTIONS = [
  "Slim",
  "Petite",
  "Athletic",
  "Average",
  "Muscular",
  "Curvy",
  "Plus-size",
] as const;

type BuildShape = (typeof BUILD_OPTIONS)[number];

// Half-widths (in SVG units) at shoulder/waist/hip for a minimal abstract
// silhouette — not a literal figure, just enough shape variation per option
// to read as distinct at a glance. shoulderY/hipY also shrink for "Petite"
// to hint at shorter stature alongside the narrower width.
const BUILD_SILHOUETTE: Record<
  BuildShape,
  { sw: number; ww: number; hw: number; shoulderY: number; hipY: number }
> = {
  Slim: { sw: 3.0, ww: 2.0, hw: 2.3, shoulderY: 9, hipY: 29 },
  Petite: { sw: 2.6, ww: 1.9, hw: 2.1, shoulderY: 12, hipY: 25 },
  Athletic: { sw: 6.5, ww: 2.8, hw: 3.6, shoulderY: 9, hipY: 29 },
  Average: { sw: 4.2, ww: 3.6, hw: 4.0, shoulderY: 9, hipY: 29 },
  Muscular: { sw: 7.5, ww: 4.8, hw: 5.0, shoulderY: 9, hipY: 29 },
  Curvy: { sw: 4.2, ww: 2.3, hw: 6.0, shoulderY: 9, hipY: 29 },
  "Plus-size": { sw: 6.0, ww: 6.2, hw: 6.8, shoulderY: 9, hipY: 29 },
};

function BuildGlyph({ shape }: { shape: BuildShape }) {
  const s = BUILD_SILHOUETTE[shape];
  const waistY = (s.shoulderY + s.hipY) / 2;
  const points = [
    [12 - s.sw, s.shoulderY],
    [12 + s.sw, s.shoulderY],
    [12 + s.ww, waistY],
    [12 + s.hw, s.hipY],
    [12 - s.hw, s.hipY],
    [12 - s.ww, waistY],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(" ");

  return (
    <svg viewBox="0 0 24 32" className="h-[18px] w-[18px] shrink-0" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="4.5" r="3" />
      <polygon points={points} />
    </svg>
  );
}

function BuildPicker({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (build: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 pt-1" role="radiogroup" aria-label="Build">
      {BUILD_OPTIONS.map((b) => {
        const selected = value === b;
        return (
          <button
            key={b}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(b)}
            className={`flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
              selected
                ? "bg-[#ff5fb8]/20 border-[#ff5fb8]/50 text-[#ff5fb8]"
                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
            }`}
          >
            <BuildGlyph shape={b} />
            {b}
          </button>
        );
      })}
    </div>
  );
}

function BuildMultiPicker({
  value,
  onToggle,
}: {
  value: string[];
  onToggle: (build: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {BUILD_OPTIONS.map((b) => {
        const selected = value.includes(b);
        return (
          <button
            key={b}
            type="button"
            onClick={() => onToggle(b)}
            aria-pressed={selected}
            className={`flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
              selected
                ? "bg-[#ff5fb8]/20 border-[#ff5fb8]/50 text-[#ff5fb8]"
                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
            }`}
          >
            <BuildGlyph shape={b} />
            {b}
          </button>
        );
      })}
    </div>
  );
}

// ─── Skin tone — color swatch + pill ────────────────────────────────────────

export const SKIN_TONE_OPTIONS = ["Fair", "Tan", "Brown", "Dark"] as const;

const SKIN_TONE_SWATCH: Record<(typeof SKIN_TONE_OPTIONS)[number], string> = {
  Fair: "#F3D5B5",
  Tan: "#D9A066",
  Brown: "#A56B46",
  Dark: "#5C3A21",
};

function SkinTonePicker({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (tone: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 pt-1" role="radiogroup" aria-label="Skin tone">
      {SKIN_TONE_OPTIONS.map((t) => {
        const selected = value === t;
        return (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(t)}
            className={`flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
              selected
                ? "bg-[#ff5fb8]/20 border-[#ff5fb8]/50 text-[#ff5fb8]"
                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
            }`}
          >
            <span
              className="h-3.5 w-3.5 rounded-full shrink-0 ring-1 ring-white/20"
              style={{ backgroundColor: SKIN_TONE_SWATCH[t] }}
            />
            {t}
          </button>
        );
      })}
    </div>
  );
}

// ─── Public value shape ──────────────────────────────────────────────────────

export interface ProfileFieldsStep1Value {
  gender: string;
  age: string;
  build: string;
  skin_tone: string;
  height_ft: string;
  height_in: string;
  preferred_min_age: string;
  preferred_max_age: string;
  preferred_builds: string[];
  preferred_min_height_ft: string;
  preferred_min_height_in: string;
  preferred_max_height_ft: string;
  preferred_max_height_in: string;
}

export function ProfileFieldsStep1({
  value,
  onChange,
}: {
  value: ProfileFieldsStep1Value;
  onChange: (patch: Partial<ProfileFieldsStep1Value>) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Gender">
          <select
            required
            value={value.gender}
            onChange={(e) => onChange({ gender: e.target.value })}
            className={`${inputCls} appearance-none`}
          >
            <option value="" disabled>Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </Field>
        <Field label="Age">
          <input
            required
            type="number"
            min="18"
            placeholder="e.g. 23"
            value={value.age}
            onChange={(e) => onChange({ age: e.target.value })}
            className={inputCls}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Build">
          <BuildPicker value={value.build} onSelect={(build) => onChange({ build })} />
        </Field>
        <Field label="Skin Tone">
          <SkinTonePicker value={value.skin_tone} onSelect={(skin_tone) => onChange({ skin_tone })} />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Height">
          <div className="flex gap-2 w-full">
            <div className="relative flex-1">
              <input
                required
                type="number"
                min="3"
                max="8"
                placeholder="Ft"
                value={value.height_ft}
                onChange={(e) => onChange({ height_ft: e.target.value })}
                className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl pl-3 pr-6 py-3 text-white text-base outline-none focus:border-white/30 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40">ft</span>
            </div>
            <div className="relative flex-1">
              <input
                required
                type="number"
                min="0"
                max="11"
                placeholder="In"
                value={value.height_in}
                onChange={(e) => onChange({ height_in: e.target.value })}
                className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl pl-3 pr-6 py-3 text-white text-base outline-none focus:border-white/30 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40">in</span>
            </div>
          </div>
        </Field>
        <Field label="Pref Age Range">
          <div className="flex gap-2 w-full">
            <input
              required
              type="number"
              min="18"
              placeholder="Min"
              value={value.preferred_min_age}
              onChange={(e) => onChange({ preferred_min_age: e.target.value })}
              className={inputCls}
            />
            <input
              required
              type="number"
              min="18"
              placeholder="Max"
              value={value.preferred_max_age}
              onChange={(e) => onChange({ preferred_max_age: e.target.value })}
              className={inputCls}
            />
          </div>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Pref Body Type">
          <BuildMultiPicker
            value={value.preferred_builds}
            onToggle={(b) =>
              onChange({
                preferred_builds: value.preferred_builds.includes(b)
                  ? value.preferred_builds.filter((x) => x !== b)
                  : [...value.preferred_builds, b],
              })
            }
          />
        </Field>
        <Field label="Pref Height">
          <div className="flex gap-2 w-full items-center">
            <div className="flex-1 flex gap-1">
              <input
                required
                type="number"
                min="3"
                max="8"
                placeholder="Ft"
                value={value.preferred_min_height_ft}
                onChange={(e) => onChange({ preferred_min_height_ft: e.target.value })}
                className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-2 py-3 text-white text-base outline-none focus:border-white/30 transition-colors text-center"
              />
              <input
                required
                type="number"
                min="0"
                max="11"
                placeholder="In"
                value={value.preferred_min_height_in}
                onChange={(e) => onChange({ preferred_min_height_in: e.target.value })}
                className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-2 py-3 text-white text-base outline-none focus:border-white/30 transition-colors text-center"
              />
            </div>
            <span className="text-white/30 text-xs">-</span>
            <div className="flex-1 flex gap-1">
              <input
                required
                type="number"
                min="3"
                max="8"
                placeholder="Ft"
                value={value.preferred_max_height_ft}
                onChange={(e) => onChange({ preferred_max_height_ft: e.target.value })}
                className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-2 py-3 text-white text-base outline-none focus:border-white/30 transition-colors text-center"
              />
              <input
                required
                type="number"
                min="0"
                max="11"
                placeholder="In"
                value={value.preferred_max_height_in}
                onChange={(e) => onChange({ preferred_max_height_in: e.target.value })}
                className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-2 py-3 text-white text-base outline-none focus:border-white/30 transition-colors text-center"
              />
            </div>
          </div>
        </Field>
      </div>
    </>
  );
}

export default ProfileFieldsStep1;
