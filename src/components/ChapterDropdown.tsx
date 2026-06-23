import React from "react";
import { useDpp } from "../context/DppContext";
import { FolderOpen } from "lucide-react";

interface ChapterDropdownProps {
  selectedSubject: "Physics" | "Chemistry" | "Biology";
  selectedChapterId: string;
  onSelectChapterId: (id: string) => void;
  className?: string;
}

export const ChapterDropdown: React.FC<ChapterDropdownProps> = ({
  selectedSubject,
  selectedChapterId,
  onSelectChapterId,
  className = "",
}) => {
  const { chapters } = useDpp();

  const filteredChapters = chapters.filter(
    (c) => c.subject_name === selectedSubject
  );

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Select Chapter Reference
      </label>
      <div className="relative">
        <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 w-4 h-4" />
        <select
          value={selectedChapterId}
          onChange={(e) => onSelectChapterId(e.target.value)}
          className="w-full bg-slate-900/90 border border-slate-700 hover:border-emerald-500/50 text-slate-100 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer appearance-none"
        >
          <option value="" disabled>-- Select Chapter --</option>
          {filteredChapters.map((ch) => (
            <option key={ch.chapter_id} value={ch.chapter_id}>
              {ch.chapter_name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
          <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ChapterDropdown;