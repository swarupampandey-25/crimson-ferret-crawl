import React, { useState } from "react";
import { useDpp, Formula } from "../context/DppContext";
import { FolderPlus, Book, Search, Trash2, Star, Plus, ShieldAlert } from "lucide-react";
import { showError } from "@/utils/toast";

export const FormulaSheet: React.FC = () => {
  const { formulas, chapters, addFormula, toggleFormulaFavorite, deleteFormula } = useDpp();
  const [selectedSubject, setSelectedSubject] = useState<"Physics" | "Chemistry" | "Biology">("Physics");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");

  // New formula form
  const [formulaTitle, setFormulaTitle] = useState("");
  const [expression, setExpression] = useState("");
  const [description, setDescription] = useState("");

  const filteredChapters = chapters.filter((c) => c.subject_name === selectedSubject);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChapterId) {
      showError("Please pick a valid chapter folder first!");
      return;
    }
    if (!formulaTitle || !expression) {
      showError("Formula title and mathematical/textual expression is required.");
      return;
    }

    addFormula({
      chapter_id: selectedChapterId,
      subject_name: selectedSubject,
      title: formulaTitle,
      expression,
      description,
    });

    // Reset fields
    setFormulaTitle("");
    setExpression("");
    setDescription("");
  };

  const filteredFormulas = formulas.filter((f) => {
    const matchSubject = f.subject_name === selectedSubject;
    const matchQuery =
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.expression.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubject && matchQuery;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl">
      {/* FORMULA ENTRY CREATOR */}
      <div className="lg:col-span-5 bg-slate-900/50 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-3">
            <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <FolderPlus className="w-4 h-4" />
            </span>
            Save Core Equation / Concept
          </h3>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Record important structural equations, conceptual notes, or reactions to recall instantly during practice exams.
          </p>

          <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800/60 mb-4">
            {(["Physics", "Chemistry", "Biology"] as const).map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => {
                  setSelectedSubject(sub);
                  setSelectedChapterId("");
                }}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                  selectedSubject === sub
                    ? "bg-slate-800 text-emerald-400 shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Chapter Folder</label>
              <select
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="" disabled>-- Select Chapter Target --</option>
                {filteredChapters.map((ch) => (
                  <option key={ch.chapter_id} value={ch.chapter_id}>
                    {ch.chapter_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Concept/Formula Title</label>
              <input
                type="text"
                value={formulaTitle}
                onChange={(e) => setFormulaTitle(e.target.value)}
                placeholder="e.g. De Broglie Wavelength"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Expression / Code / Reaction</label>
              <input
                type="text"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="e.g. λ = h / p"
                className="w-full bg-slate-950 border border-slate-800 font-mono text-emerald-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Concept Explainer (Brief)</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief variable breakdown or logical application..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>
          </form>
        </div>

        <button
          onClick={handleSubmit}
          className="mt-4 w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Formula Card
        </button>
      </div>

      {/* FORMULA LISTING BOARD */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search formula title, variable or expression..."
              className="w-full bg-slate-900 border border-slate-800/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-4 flex-1 h-[320px] overflow-y-auto flex flex-col gap-3">
          {filteredFormulas.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <Book className="w-8 h-8 text-slate-700 mb-2" />
              <p className="text-xs text-slate-400 font-semibold">No formula cards recorded here</p>
              <p className="text-[9px] text-slate-500 max-w-xs mt-1">
                Fill the adjacent form with key equations or biology points to populate this cheat-sheet.
              </p>
            </div>
          ) : (
            filteredFormulas.map((f) => {
              const chap = chapters.find((c) => c.chapter_id === f.chapter_id);
              return (
                <div
                  key={f.formula_id}
                  className="bg-slate-950 border border-slate-800 hover:border-emerald-500/20 rounded-xl p-3.5 transition-all flex justify-between items-start gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[8px] uppercase px-1.5 py-0.5 bg-slate-900 border border-slate-800/80 text-emerald-400 font-bold rounded">
                        {chap?.chapter_name || "General"}
                      </span>
                      <h4 className="text-xs font-bold text-slate-200">{f.title}</h4>
                    </div>

                    <div className="bg-slate-900 px-3 py-2 rounded-lg font-mono text-xs text-emerald-300 font-bold inline-block border border-slate-800 mb-1.5">
                      {f.expression}
                    </div>

                    {f.description && (
                      <p className="text-[10px] text-slate-400 leading-relaxed italic">{f.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleFormulaFavorite(f.formula_id)}
                      className={`p-1.5 hover:bg-slate-900 rounded-lg transition-all ${
                        f.is_favorite ? "text-amber-400" : "text-slate-500"
                      }`}
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      onClick={() => deleteFormula(f.formula_id)}
                      className="p-1.5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default FormulaSheet;