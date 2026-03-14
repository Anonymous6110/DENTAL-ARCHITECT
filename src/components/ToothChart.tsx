import React from 'react';
import { motion } from "motion/react";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ToothChartProps {
  selectedTeeth: number[];
  onToggleTooth: (toothNumber: number) => void;
}

export default function ToothChart({ selectedTeeth, onToggleTooth }: ToothChartProps) {
  const [notation, setNotation] = React.useState<'FDI' | 'Universal'>('FDI');
  
  // FDI World Dental Federation notation
  const upperRight = [18, 17, 16, 15, 14, 13, 12, 11];
  const upperLeft = [21, 22, 23, 24, 25, 26, 27, 28];
  const lowerRight = [48, 47, 46, 45, 44, 43, 42, 41];
  const lowerLeft = [31, 32, 33, 34, 35, 36, 37, 38];

  const getUniversal = (fdi: number) => {
    const mapping: Record<number, number> = {
      18:1, 17:2, 16:3, 15:4, 14:5, 13:6, 12:7, 11:8, 21:9, 22:10, 23:11, 24:12, 25:13, 26:14, 27:15, 28:16,
      48:32, 47:31, 46:30, 45:29, 44:28, 43:27, 42:26, 41:25, 31:24, 32:23, 33:22, 34:21, 35:20, 36:19, 37:18, 38:17
    };
    return mapping[fdi] || fdi;
  };

  const renderTooth = (num: number, index: number, isUpper: boolean) => {
    const isSelected = selectedTeeth.includes(num);
    const isMolar = [18, 17, 16, 26, 27, 28, 36, 37, 38, 46, 47, 48].includes(num);
    const isPremolar = [15, 14, 24, 25, 34, 35, 44, 45].includes(num);
    const isCanine = [13, 23, 33, 43].includes(num);
    
    // Anatomical curve offsets (percentages for responsiveness)
    const curveOffsets = [25, 12, 4, 0, 0, 4, 12, 25];
    const offset = curveOffsets[index] || 0;
    const translateY = isUpper ? `-${offset}%` : `${offset}%`;

    return (
      <button
        key={num}
        type="button"
        onClick={() => onToggleTooth(num)}
        style={{ transform: `translateY(${translateY})` }}
        className={cn(
          "relative group transition-all duration-300",
          isMolar ? "flex-[1.5]" : isPremolar ? "flex-[1.2]" : "flex-1",
          isSelected ? "scale-110 z-10" : "hover:scale-105"
        )}
      >
        <div className={cn(
          "flex flex-col items-center justify-center border-2 transition-all relative overflow-hidden w-full",
          isMolar ? "aspect-[2/3] rounded-lg md:rounded-xl" : isPremolar ? "aspect-[2/3] rounded-md md:rounded-lg" : isCanine ? "aspect-[1/2] rounded-full" : "aspect-[1/2] rounded-t-full rounded-b-md",
          isSelected 
            ? "bg-emerald-500 border-emerald-600 text-white shadow-xl shadow-emerald-500/40" 
            : "bg-white border-zinc-200 text-zinc-400 hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50/30"
        )}>
          {/* Tooth Number */}
          <span className={cn(
            "text-[6px] sm:text-[8px] md:text-[10px] font-black absolute top-0.5 sm:top-1",
            isSelected ? "text-white" : "text-zinc-300"
          )}>{notation === 'FDI' ? num : getUniversal(num)}</span>
          
          {/* Anatomical Shape Simulation */}
          <div className={cn(
            "mt-2 sm:mt-3 rounded-full border transition-all w-1/2 h-1/2",
            isSelected ? "border-white/40 bg-white/30" : "border-zinc-100 bg-zinc-50"
          )}>
            <div className="w-full h-full flex items-center justify-center">
              <div className={cn(
                "rounded-full blur-[1px] w-1/2 h-1/2",
                isSelected ? "bg-white/60" : "bg-zinc-200/50"
              )} />
            </div>
          </div>
        </div>
        
        {/* Hover Label */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 hidden sm:block">
          <span className="bg-zinc-900 text-white text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">
            {isMolar ? 'Molar' : isPremolar ? 'Premolar' : isCanine ? 'Canine' : 'Incisor'} {num}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="bg-white rounded-3xl p-4 md:p-6 border border-zinc-100 shadow-sm w-full transition-all duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
        <div className="text-center md:text-left">
          <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">Anatomical Tooth Chart</h4>
          <p className="text-xs text-zinc-400 mt-1">Interactive Dental Map</p>
        </div>
        
        <div className="flex bg-zinc-100 p-1 rounded-xl">
          <button 
            type="button"
            onClick={() => setNotation('FDI')}
            className={cn(
              "px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all",
              notation === 'FDI' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            FDI
          </button>
          <button 
            type="button"
            onClick={() => setNotation('Universal')}
            className={cn(
              "px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all",
              notation === 'Universal' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            Universal
          </button>
        </div>
      </div>
      
      <div className="space-y-4 md:space-y-6 w-full mx-auto pb-4 px-1 sm:px-4">
        {/* Upper Arch */}
        <div className="space-y-2 w-full">
          <div className="flex justify-between px-4 sm:px-10 mb-2">
            <span className="text-[7px] sm:text-[9px] font-black text-zinc-300 uppercase tracking-widest">Quadrant 1 (UR)</span>
            <span className="text-[7px] sm:text-[9px] font-black text-zinc-300 uppercase tracking-widest">Quadrant 2 (UL)</span>
          </div>
          <div className="flex justify-center items-end gap-0.5 sm:gap-1 md:gap-2 w-full">
            <div className="flex gap-0.5 sm:gap-1 md:gap-1.5 items-end justify-end flex-1">
              {upperRight.map((n, i) => renderTooth(n, i, true))}
            </div>
            <div className="w-px h-8 sm:h-12 bg-zinc-200 mx-1 sm:mx-2 md:mx-4 self-center opacity-50" />
            <div className="flex gap-0.5 sm:gap-1 md:gap-1.5 items-end justify-start flex-1">
              {upperLeft.map((n, i) => renderTooth(n, 7-i, true))}
            </div>
          </div>
          <p className="text-[8px] sm:text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] sm:tracking-[0.4em] text-center mt-4">Upper Arch (Maxilla)</p>
        </div>

        {/* Divider / Occlusal Plane */}
        <div className="relative py-2 w-full">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-dashed border-zinc-100"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 sm:px-8 text-[8px] sm:text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] sm:tracking-[0.5em]">Occlusal Plane</span>
          </div>
        </div>

        {/* Lower Arch */}
        <div className="space-y-2 w-full">
          <p className="text-[8px] sm:text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] sm:tracking-[0.4em] text-center mb-4">Lower Arch (Mandible)</p>
          <div className="flex justify-center items-start gap-0.5 sm:gap-1 md:gap-2 w-full">
            <div className="flex gap-0.5 sm:gap-1 md:gap-1.5 items-start justify-end flex-1">
              {lowerRight.map((n, i) => renderTooth(n, i, false))}
            </div>
            <div className="w-px h-8 sm:h-12 bg-zinc-200 mx-1 sm:mx-2 md:mx-4 self-center opacity-50" />
            <div className="flex gap-0.5 sm:gap-1 md:gap-1.5 items-start justify-start flex-1">
              {lowerLeft.map((n, i) => renderTooth(n, 7-i, false))}
            </div>
          </div>
          <div className="flex justify-between px-4 sm:px-10 mt-2">
            <span className="text-[7px] sm:text-[9px] font-black text-zinc-300 uppercase tracking-widest">Quadrant 4 (LR)</span>
            <span className="text-[7px] sm:text-[9px] font-black text-zinc-300 uppercase tracking-widest">Quadrant 3 (LL)</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-50">
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 text-center">Selected Teeth</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {selectedTeeth.length > 0 ? (
            selectedTeeth.sort((a, b) => a - b).map(num => (
              <motion.span 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                key={num} 
                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100 shadow-sm"
              >
                Tooth {num}
              </motion.span>
            ))
          ) : (
            <span className="text-xs text-zinc-400 italic">No teeth selected. Click on the chart above.</span>
          )}
        </div>
      </div>
    </div>
  );
}
