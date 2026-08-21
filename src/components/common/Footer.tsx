import React from 'react';
import { Shield, Sparkles, Lightbulb, TreePine, Leaf, HardHat } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#06231a] text-slate-300 border-t border-[#c5a059]/30 mt-8 pt-6 pb-4 px-4 md:px-8 text-xs select-none">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Commitment Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 pb-6 border-b border-[#0f4433]">
          {/* Main Commitment Statement */}
          <div className="md:col-span-1 space-y-2 border-r border-[#0f4433]/60 pr-4">
            <div className="flex items-center space-x-2 text-[#c5a059] font-black text-xs uppercase tracking-wider">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span>OUR COMMITMENT</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              To deliver excellence in real estate development with integrity, transparency and trust.
            </p>
          </div>

          {/* 4 Pillars */}
          <div className="md:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-[#c5a059] font-bold text-xs uppercase">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>TRUST</span>
              </div>
              <p className="text-[10px] text-slate-400">
                We build lasting relationships with our customers.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-[#c5a059] font-bold text-xs uppercase">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span>INTEGRITY</span>
              </div>
              <p className="text-[10px] text-slate-400">
                We maintain the highest standards of honesty and accountability.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-[#c5a059] font-bold text-xs uppercase">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>INNOVATION</span>
              </div>
              <p className="text-[10px] text-slate-400">
                We embrace innovation to create better living experiences.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-[#c5a059] font-bold text-xs uppercase">
                <TreePine className="w-3.5 h-3.5 text-emerald-400" />
                <span>SUSTAINABILITY</span>
              </div>
              <p className="text-[10px] text-slate-400">
                We develop sustainably for a greener future.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Tagline */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            © 2025 <strong className="text-white font-bold">Tayeeba Housing Ltd.</strong> All rights reserved. • Crafted with ❤️ for a Better Tomorrow
          </div>
          <div className="flex items-center space-x-2 text-emerald-400 font-bold">
            <span className="p-1 bg-[#0a3325] rounded-md border border-[#c5a059]/30">🚜</span>
            <span>🌱 Building a Greener Future</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
