import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, RefreshCw, Sparkles, AlertCircle, Info } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { formatDate, addDays } from '../utils/deadlineUtils';

export default function SystemDateSimulator() {
  const { simulatedDate, updateSimulatedDate } = useTasks();
  const [isExpanded, setIsExpanded] = useState(false);
  const realToday = formatDate(new Date());
  const isSimulated = simulatedDate && simulatedDate !== realToday;

  const handlePreset = (daysOffset) => {
    const targetDate = addDays(realToday, daysOffset);
    updateSimulatedDate(targetDate);
  };

  const handleReset = () => {
    updateSimulatedDate(realToday);
  };

  return (
    <div className="bg-gradient-to-r from-indigo-900/90 via-slate-900/90 to-purple-900/90 text-white border-b border-indigo-700/40 text-xs px-4 py-1.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSimulated ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isSimulated ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
          </span>
          <span className="font-semibold tracking-wide flex items-center gap-1.5 text-slate-200">
            <Calendar className="w-3.5 h-3.5 text-indigo-300" />
            System Date: <strong className="text-white font-mono">{simulatedDate}</strong>
            {isSimulated && (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded text-[10px] font-medium">
                Simulated Time
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-indigo-200/80 text-[11px]">
            Academic Deadline Tester:
          </span>

          {/* Quick verification buttons for Section 6 testing */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePreset(0)}
              className={`px-2 py-0.5 rounded text-[11px] transition-all ${
                !isSimulated
                  ? 'bg-indigo-600 text-white font-medium shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
              title="Reset to Actual Real-World Today"
            >
              Today
            </button>
            <button
              onClick={() => handlePreset(10)}
              className="px-2 py-0.5 rounded text-[11px] bg-white/10 hover:bg-white/20 text-slate-200 transition-all"
              title="Simulate +10 Days (Normal for 30-day task, Overdue for 15-day task)"
            >
              +10 Days
            </button>
            <button
              onClick={() => handlePreset(24)}
              className="px-2 py-0.5 rounded text-[11px] bg-white/10 hover:bg-white/20 text-emerald-300 font-medium transition-all"
              title="Day 24: Verify 30-day task remains Normal"
            >
              Day 24 (Normal)
            </button>
            <button
              onClick={() => handlePreset(25)}
              className="px-2 py-0.5 rounded text-[11px] bg-rose-500/30 hover:bg-rose-500/50 text-rose-200 font-semibold border border-rose-500/40 transition-all"
              title="Day 25: Verify 30-day task switches automatically to OVERDUE"
            >
              Day 25 (Overdue!)
            </button>
            <button
              onClick={() => handlePreset(30)}
              className="px-2 py-0.5 rounded text-[11px] bg-white/10 hover:bg-white/20 text-slate-200 transition-all"
              title="Day 30: Deadline Day"
            >
              +30 Days
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-slate-300 hover:text-white rounded hover:bg-white/10 transition-colors"
            title="Toggle custom date picker"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded custom date selection */}
      {isExpanded && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-indigo-700/30 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-100">
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-indigo-200">Custom Simulator Date:</label>
            <input
              type="date"
              value={simulatedDate}
              onChange={(e) => updateSimulatedDate(e.target.value)}
              className="bg-slate-800 text-white border border-slate-700 rounded px-2 py-0.5 text-xs focus:ring-1 focus:ring-indigo-400 outline-none"
            />
            {isSimulated && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-[11px] text-amber-300 hover:underline"
              >
                <RefreshCw className="w-3 h-3" /> Reset to Real Date
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-300">
            Formula: <code className="bg-black/30 px-1 py-0.5 rounded text-amber-300">Elapsed ≥ Duration - 5</code> → Auto Overdue. Completed tasks always take priority.
          </p>
        </div>
      )}
    </div>
  );
}
