import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { THEME_PRESETS, ThemeMode } from '../../themes/themePresets';
import { Palette, Sun, Moon, Monitor, Check, ArrowRight, X } from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export const ThemeSwitcher: React.FC = () => {
  const { themeId, setThemeId, themeMode, setThemeMode, activeTheme } = useTheme();
  const { setCurrentTab } = useERP();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelectTheme = (id: string) => {
    setThemeId(id);
    setIsOpen(false);
  };

  const handleSelectMode = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const handleGoToAppearanceSettings = () => {
    setIsOpen(false);
    setCurrentTab('settings');
  };

  return (
    <div className="relative select-none" ref={dropdownRef}>
      {/* Topbar Theme Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition shadow-sm bg-white/80 hover:bg-white text-[#073826] border-slate-200/90 dark:bg-[#0a2e21] dark:text-[#fbbf24] dark:border-[#134e38]"
        title="Theme & Appearance"
      >
        <Palette className="w-4 h-4 text-[#c5a059] flex-shrink-0" />
        <span className="hidden lg:inline text-xs">Theme</span>
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#0a2e21] border border-slate-200 dark:border-[#134e38] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 bg-slate-50 dark:bg-[#06231a] border-b border-slate-200 dark:border-[#134e38] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-[#c5a059]" />
              <span className="font-black text-xs text-[#073826] dark:text-white uppercase tracking-wider">
                Appearance
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3.5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Mode Selector */}
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                Display Mode
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-[#041610] p-1 rounded-xl">
                {[
                  { mode: 'light' as ThemeMode, label: 'Light', icon: Sun },
                  { mode: 'system' as ThemeMode, label: 'System', icon: Monitor },
                  { mode: 'dark' as ThemeMode, label: 'Dark', icon: Moon },
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = themeMode === item.mode;
                  return (
                    <button
                      key={item.mode}
                      onClick={() => handleSelectMode(item.mode)}
                      className={`flex items-center justify-center space-x-1.5 py-1.5 rounded-lg text-xs font-bold transition ${
                        isActive
                          ? 'bg-[#06231a] dark:bg-[#10b981] text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Theme Presets Grid */}
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                Corporate Themes
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {THEME_PRESETS.map(preset => {
                  const isSelected = themeId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectTheme(preset.id)}
                      className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-50/60 dark:bg-[#06231a] border-[#059669] dark:border-[#10b981] shadow-sm ring-1 ring-[#059669]'
                          : 'bg-white dark:bg-[#082218] border-slate-200 dark:border-[#134e38] hover:border-slate-300 dark:hover:border-[#10b981]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <div className="flex items-center space-x-1">
                          {preset.dots.map((dot, idx) => (
                            <span
                              key={idx}
                              className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs"
                              style={{ backgroundColor: dot }}
                            />
                          ))}
                        </div>
                        {isSelected && (
                          <span className="flex items-center space-x-0.5 text-[9px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded-md">
                            <Check className="w-2.5 h-2.5" />
                            <span>Active</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {preset.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Link to Settings */}
          <div className="p-3 bg-slate-50 dark:bg-[#06231a] border-t border-slate-200 dark:border-[#134e38] flex justify-end">
            <button
              onClick={handleGoToAppearanceSettings}
              className="text-xs font-extrabold text-[#073826] dark:text-[#c5a059] hover:underline flex items-center space-x-1"
            >
              <span>Appearance Settings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
