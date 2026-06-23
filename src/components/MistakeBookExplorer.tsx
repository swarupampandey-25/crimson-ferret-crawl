import React, { useState } from "react";
import { useDpp, Question, MistakeEntry } from "../context/DppContext";
import { Folder, BookOpen, AlertCircle, ChevronRight, ChevronDown, Trash2, HelpCircle, MessageCircle, Calendar } from "lucide-react";

export const MistakeBookExplorer: React.FC = () => {
  const { mistakes, questions, chapters, chats, removeFromMistakeBook } = useDpp();
  const [openSubject, setOpenSubject] = useState<"Physics" | "Chemistry" | "Biology" | null>("Physics");
  const [openChapterId, setOpenChapterId] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  // Group mistakes hierarchically
  const getSubjectMistakesCount = (sub: "Physics" | "Chemistry" | "Biology") => {
    return mistakes.filter((m) => {
      const q = questions.find((quest) => quest.question_id === m.question_id);
      if (!q) return false;
      const ch = chapters.find((c) => c.chapter_id === q.chapter_id);
      return ch?.subject_name === sub;
    }).length;
  };

  const getChapterMistakes = (chapterId: string) => {
    return mistakes.filter((m) => {
      const q = questions.find((quest) => quest.question_id === m.question_id);
      return q && q.chapter_id === chapterId;
    });
  };

  const toggleSubject = (sub: "Physics" | "Chemistry" | "Biology") => {
    setOpenSubject(openSubject === sub ? null : sub);
    setOpenChapterId(null);
    setSelectedQuestion(null);
  };

  const toggleChapter = (chId: string) => {
    setOpenChapterId(openChapterId === chId ? null : chId);
    setSelectedQuestion(null);
  };

  const activeChapters = chapters.filter((c) => c.subject_name === openSubject);

  return (
    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT COLUMN: Subject Accordion & Chapter Folders */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-rose-400" />
            Distributed Mistake Book
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Auto-cataloged list of incorrect answers segmented cleanly by subject and chapter.
          </p>
        </div>

        {/* SUBJECTS ACCORDION */}
        <div className="flex flex-col gap-2 mt-2">
          {(["Physics", "Chemistry", "Biology"] as const).map((sub) => {
            const count = getSubjectMistakesCount(sub);
            const isOpen = openSubject === sub;

            return (
              <div key={sub} className="bg-slate-900/60 rounded-2xl border border-slate-800/80 overflow-hidden">
                <button
                  onClick={() => toggleSubject(sub)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-bold text-slate-200 hover:bg-slate-800/30 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      sub === "Physics" ? "bg-cyan-400" : sub === "Chemistry" ? "bg-amber-400" : "bg-emerald-400"
                    }`} />
                    <span>{sub}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 rounded-lg text-[10px]">
                      {count} Mistakes
                    </span>
                    {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {/* CHAPTER FOLDERS */}
                {isOpen && (
                  <div className="bg-slate-950/40 p-3 border-t border-slate-800/60 flex flex-col gap-1.5">
                    {activeChapters.length === 0 ? (
                      <p className="text-[10px] text-slate-500 p-2 text-center">No active folders found.</p>
                    ) : (
                      activeChapters.map((ch) => {
                        const chapMistakes = getChapterMistakes(ch.chapter_id);
                        const isChapOpen = openChapterId === ch.chapter_id;

                        if (chapMistakes.length === 0) return null;

                        return (
                          <div key={ch.chapter_id} className="rounded-xl overflow-hidden">
                            <button
                              onClick={() => toggleChapter(ch.chapter_id)}
                              className={`w-full px-3 py-2 text-[11px] font-semibold text-slate-300 hover:text-slate-100 flex items-center justify-between rounded-lg transition-all ${
                                isChapOpen ? "bg-slate-900 border border-slate-800" : "bg-transparent"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Folder className="w-3.5 h-3.5 text-rose-400/80 shrink-0" />
                                <span className="truncate max-w-[150px]">{ch.chapter_name}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {chapMistakes.length} items
                              </span>
                            </button>

                            {/* QUESTION CARDS LIST */}
                            {isChapOpen && (
                              <div className="pl-6 pr-2 py-1.5 flex flex-col gap-1 border-l border-slate-800/80 ml-4 mt-1.5">
                                {chapMistakes.map((m) => {
                                  const q = questions.find((quest) => quest.question_id === m.question_id);
                                  if (!q) return null;

                                  const isSelected = selectedQuestion?.question_id === q.question_id;

                                  return (
                                    <button
                                      key={m.mistake_id}
                                      onClick={() => setSelectedQuestion(q)}
                                      className={`w-full p-2.5 rounded-lg text-left text-[11px] transition-all border ${
                                        isSelected
                                          ? "bg-rose-500/10 border-rose-500/40 text-rose-200"
                                          : "bg-slate-900/40 border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200"
                                      }`}
                                    >
                                      <div className="flex justify-between items-start gap-1.5 mb-1">
                                        <span className="font-bold text-slate-300 truncate max-w-[130px]">{q.topic_name}</span>
                                        <span className="text-[8px] uppercase px-1.5 bg-slate-950 text-rose-400 rounded font-semibold shrink-0">
                                          {m.error_type}
                                        </span>
                                      </div>
                                      <p className="line-clamp-1 text-slate-500">{q.question_text}</p>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                    {activeChapters.every((ch) => getChapterMistakes(ch.chapter_id).length === 0) && (
                      <p className="text-[10px] text-slate-500 p-2 text-center">Perfect score! No mistakes registered here.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: HISTORICAL CHAT CONTINUITY & REVIEW CARD */}
      <div className="lg:col-span-7 bg-slate-900/40 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between">
        {!selectedQuestion ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 my-auto">
            <Folder className="w-10 h-10 text-slate-700 mb-2" />
            <p className="text-xs text-slate-400 font-bold">Select a Mistake to Review</p>
            <p className="text-[10px] text-slate-500 max-w-xs mt-1">
              Opening a mistake card immediately displays past conversational logs so you can review the concepts dynamically.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 h-full justify-between">
            <div>
              {/* HEADER WITH REMOVE OPTION */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{selectedQuestion.topic_name}</h4>
                  <p className="text-[10px] text-slate-500">Historical Continuous Session Log</p>
                </div>
                <button
                  onClick={() => {
                    removeFromMistakeBook(selectedQuestion.question_id);
                    setSelectedQuestion(null);
                  }}
                  className="p-2 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-xl transition-all"
                  title="Remove mistake once mastered"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* RETRIEVED TEXT */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-xs text-slate-300 mt-3 leading-relaxed">
                <p className="font-semibold text-slate-400 mb-2">The core question was:</p>
                {selectedQuestion.question_text}
                <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Correct Option: <b className="text-emerald-400">{selectedQuestion.correct_option}</b></span>
                </div>
              </div>

              {/* STORED CHAT LOG HISTORY */}
              <div className="mt-4">
                <h5 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" /> Stored Copilot Explanations
                </h5>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/60 max-h-48 overflow-y-auto flex flex-col gap-2.5">
                  {chats[selectedQuestion.question_id]?.conversation_history.length ? (
                    chats[selectedQuestion.question_id].conversation_history.map((msg, index) => {
                      const isAi = msg.role === "assistant";
                      return (
                        <div
                          key={index}
                          className={`flex flex-col gap-1 ${isAi ? "items-start" : "items-end"}`}
                        >
                          <span className="text-[8px] text-slate-500">
                            {isAi ? "Copilot explainer" : "Your attempt query"}
                          </span>
                          <p className={`p-2.5 rounded-xl text-[11px] leading-relaxed max-w-[90%] ${
                            isAi ? "bg-slate-900 text-slate-300" : "bg-emerald-500/10 text-emerald-300"
                          }`}>
                            {msg.content}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[10px] text-slate-500 text-center p-4">No conversational history. Study session complete.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Cataloged recently
              </span>
              <span>Reviewing is the absolute secret to high rank!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MistakeBookExplorer;