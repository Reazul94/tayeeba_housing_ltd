import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { THEME_PRESETS, ThemeMode, DisplayDensity } from '../../themes/themePresets';
import { Palette, Sun, Moon, Monitor, Check, Sliders, Sparkles, Layout, Eye } from 'lucide-react';
import { formatBDT } from '../../utils/pdfGenerator';

export const AppearanceSettings: React.FC = () => {
  const { 
    themeId, setThemeId, 
    themeMode, setThemeMode, 
    density, setDensity, 
    reducedMotion, setReducedMotion, 
    activeTheme 
  } = useTheme();

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="bg-white dark:bg-[#0a2e21] rounded-2xl border border-slate-200 dark:border-[#134e38] p-5 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#06231a] dark:bg-[#10b981] rounded-xl text-[#c5a059] dark:text-[#041610]">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#073826] dark:text-white">
              APPEARANCE &amp; THEME SETTINGS
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize your executive workspace colors, dark/light display modes, typography density, and visual animations
            </p>
          </div>
        </div>
      </div>

      {/* 1. Display Mode Toggle */}
      <div className="bg-white dark:bg-[#0a2e21] rounded-2xl border border-slate-200 dark:border-[#134e38] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#134e38] pb-3">
          <div>
            <h3 className="font-extrabold text-sm text-[#073826] dark:text-white">DISPLAY MODE</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Select system default or force a light / dark theme</p>
          </div>
          <span className="text-xs font-mono font-bold text-[#c5a059] uppercase">{themeMode} Mode</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { mode: 'light' as ThemeMode, title: 'Light Mode', desc: 'Crisp daytime architectural brightness', icon: Sun },
            { mode: 'system' as ThemeMode, title: 'System Default', desc: 'Syncs automatically with device OS preference', icon: Monitor },
            { mode: 'dark' as ThemeMode, title: 'Dark Mode', desc: 'Deep emerald charcoal for nighttime executive review', icon: Moon },
          ].map(item => {
            const Icon = item.icon;
            const isSelected = themeMode === item.mode;
            return (
              <button
                key={item.mode}
                onClick={() => setThemeMode(item.mode)}
                className={`p-4 rounded-xl border text-left transition flex items-start space-x-3 ${
                  isSelected
                    ? 'bg-emerald-50/70 dark:bg-[#06231a] border-[#059669] dark:border-[#10b981] ring-2 ring-[#059669]'
                    : 'bg-slate-50 dark:bg-[#082218] border-slate-200 dark:border-[#134e38] hover:bg-slate-100 dark:hover:bg-[#0c3526]'
                }`}
              >
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#06231a] dark:bg-[#10b981] text-white dark:text-[#041610]' : 'bg-white dark:bg-[#0a2e21] text-slate-700 dark:text-slate-300'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                    <span>{item.title}</span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Corporate Theme Presets (10 Themes) */}
      <div className="bg-white dark:bg-[#0a2e21] rounded-2xl border border-slate-200 dark:border-[#134e38] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#134e38] pb-3">
          <div>
            <h3 className="font-extrabold text-sm text-[#073826] dark:text-white">CORPORATE REAL-ESTATE COLOR THEMES</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Choose from 10 signature real-estate palettes</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full">
            Active: {activeTheme.name}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {THEME_PRESETS.map(preset => {
            const isSelected = themeId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setThemeId(preset.id)}
                className={`p-4 rounded-xl border text-left transition relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-50/60 dark:bg-[#06231a] border-[#059669] dark:border-[#10b981] ring-2 ring-[#059669] shadow-md'
                    : 'bg-white dark:bg-[#082218] border-slate-200 dark:border-[#134e38] hover:border-slate-300 dark:hover:border-[#10b981]/50 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1.5">
                      {preset.dots.map((dot, idx) => (
                        <span
                          key={idx}
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: dot }}
                        />
                      ))}
                    </div>
                    {isSelected && (
                      <span className="flex items-center space-x-1 text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>
                  <div className="font-black text-xs text-slate-900 dark:text-white">
                    {preset.name}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                {/* Micro preview mock */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#134e38] flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span style={{ color: preset.cssVars['--color-primary'] }}>● Primary</span>
                  <span style={{ color: preset.cssVars['--color-secondary'] }}>● Secondary</span>
                  <span style={{ color: preset.cssVars['--color-accent'] }}>● Accent</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Display Density & Motion Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Layout Density */}
        <div className="bg-white dark:bg-[#0a2e21] rounded-2xl border border-slate-200 dark:border-[#134e38] p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-[#134e38] pb-3">
            <h3 className="font-extrabold text-sm text-[#073826] dark:text-white flex items-center space-x-2">
              <Layout className="w-4 h-4 text-[#c5a059]" />
              <span>LAYOUT DENSITY</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Control table row spacing and button padding</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'comfortable' as DisplayDensity, label: 'Comfortable', desc: 'Standard luxury spacing' },
              { id: 'compact' as DisplayDensity, label: 'Compact', desc: 'High data-density for accounting' },
            ].map(d => {
              const isSelected = density === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setDensity(d.id)}
                  className={`p-3.5 rounded-xl border text-left transition ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-[#06231a] border-[#059669] dark:border-[#10b981] ring-1 ring-[#059669]'
                      : 'bg-slate-50 dark:bg-[#082218] border-slate-200 dark:border-[#134e38]'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900 dark:text-white">{d.label}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{d.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Animation Preference */}
        <div className="bg-white dark:bg-[#0a2e21] rounded-2xl border border-slate-200 dark:border-[#134e38] p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-[#134e38] pb-3">
            <h3 className="font-extrabold text-sm text-[#073826] dark:text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#c5a059]" />
              <span>VISUAL ANIMATIONS</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Optimize for high performance or fluid transitions</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { reduced: false, label: 'Full Animations', desc: 'Fluid transitions & charts' },
              { reduced: true, label: 'Reduced Motion', desc: 'Instant rendering (Fast)' },
            ].map(item => {
              const isSelected = reducedMotion === item.reduced;
              return (
                <button
                  key={item.label}
                  onClick={() => setReducedMotion(item.reduced)}
                  className={`p-3.5 rounded-xl border text-left transition ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-[#06231a] border-[#059669] dark:border-[#10b981] ring-1 ring-[#059669]'
                      : 'bg-slate-50 dark:bg-[#082218] border-slate-200 dark:border-[#134e38]'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900 dark:text-white">{item.label}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Live UI Component Theme Preview Card */}
      <div className="bg-white dark:bg-[#0a2e21] rounded-2xl border border-slate-200 dark:border-[#134e38] p-5 shadow-sm space-y-4">
        <div className="border-b border-slate-100 dark:border-[#134e38] pb-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-[#c5a059]" />
            <h3 className="font-extrabold text-sm text-[#073826] dark:text-white">
              LIVE THEME PREVIEW — {activeTheme.name}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Sample Card Demonstration</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#134e38] bg-slate-50 dark:bg-[#082218] space-y-2">
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Total Revenue</div>
            <div className="text-xl font-black font-mono text-[#073826] dark:text-white">{formatBDT(1926000000)}</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">↑ +14.8% vs last quarter</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#134e38] bg-slate-50 dark:bg-[#082218] space-y-2">
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Active Bookings</div>
            <div className="text-xl font-black font-mono text-[#c5a059]">1,248 Plots</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Installment lifecycle running</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#134e38] bg-slate-50 dark:bg-[#082218] flex flex-col justify-between">
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Double-Entry Status</div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">DR = CR BALANCED</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">100% Audit Cleared</div>
          </div>
        </div>
      </div>
    </div>
  );
};
