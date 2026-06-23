import React, { useState } from "react";
import { useDpp } from "../context/DppContext";
import { ChapterDropdown } from "./ChapterDropdown";
import { Upload, Sparkles, PlusCircle, CheckCircle, Database, HelpCircle } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";

export const UploadZone: React.FC = () => {
  const { chapters, addQuestion, addChapter } = useDpp();
  const [selectedSubject, setSelectedSubject] = useState<"Physics" | "Chemistry" | "Biology">("Physics");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newChapterName, setNewChapterName] = useState("");

  // Custom prompt inputs
  const [topicName, setTopicName] = useState("Oscillations");
  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOption, setCorrectOption] = useState<"A" | "B" | "C" | "D">("A");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");

  // Simulated extraction log console
  const [logs, setLogs] = useState<string[]>([]);

  const handleAddChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterName.trim()) return;
    addChapter(selectedSubject, newChapterName.trim());
    setNewChapterName("");
  };

  const runSimulatedGeminiExtractor = (fileName: string) => {
    if (!selectedChapterId) {
      showError("Please choose a target Chapter folder first!");
      return;
    }
    setIsUploading(true);
    setUploadProgress(10);
    setLogs(["[SYSTEM] Initiating PDF ingest loop...", `[SYSTEM] Target Chapter ID: ${selectedChapterId}`]);

    const activeChapter = chapters.find((c) => c.chapter_id === selectedChapterId);

    setTimeout(() => {
      setUploadProgress(40);
      setLogs((prev) => [
        ...prev,
        `[GEMINI 1.5 PRO] Parsing file: ${fileName}`,
        "[GEMINI 1.5 PRO] Analyzing OCR layer & layout dimensions...",
        "[GEMINI 1.5 PRO] Extracting formulas, equations, and structures..."
      ]);
    }, 800);

    setTimeout(() => {
      setUploadProgress(70);
      setLogs((prev) => [
        ...prev,
        "[EXTRACTION] Found 1 Question block & high-fidelity context.",
        "[EXTRACTION] Submitting pixels to Supabase Storage bucket: 'question-diagrams'...",
        "[EXTRACTION] Created dynamic diagram_url for coordinate graph..."
      ]);
    }, 1800);

    setTimeout(() => {
      setUploadProgress(100);
      setIsUploading(false);

      // Add a randomized high-quality question depending on the subject chosen
      let sampleText = `An unknown thermodynamic cycle operates on an ideal gas. Determine the total work output W given pressure parameters.`;
      let optA = "120 Joules";
      let optB = "240 Joules";
      let optC = "Zero work done";
      let optD = "Depends on density change";
      let corr: "A" | "B" | "C" | "D" = "B";
      let topic = "Thermodynamics";

      if (selectedSubject === "Physics") {
        sampleText = "A uniform disk starts spinning from rest with a constant angular acceleration α = 4.0 rad/s². Find its angular displacement after 3.0 seconds.";
        optA = "12 rad";
        optB = "18 rad";
        optC = "24 rad";
        optD = "36 rad";
        corr = "B";
        topic = "Rotational Kinematics";
      } else if (selectedSubject === "Biology") {
        sampleText = "Identify the state of cell division when homologous chromosomes align perfectly at the equatorial plane during meiosis.";
        optA = "Prophase I";
        optB = "Metaphase I";
        optC = "Anaphase II";
        optD = "Telophase I";
        corr = "B";
        topic = "Meiotic Alignment";
      }

      addQuestion({
        chapter_id: selectedChapterId,
        topic_name: topic,
        question_text: sampleText,
        option_a: optA,
        option_b: optB,
        option_c: optC,
        option_d: optD,
        correct_option: corr,
        difficulty: "Hard",
        diagram_url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=200"
      });

      setLogs((prev) => [
        ...prev,
        "[DATABASE] Saved question with diagram_url.",
        `[SUCCESS] Fully loaded under Chapter: ${activeChapter?.chapter_name}!`
      ]);
      showSuccess(`Successfully parsed & loaded 1 complex question into "${activeChapter?.chapter_name}"!`);
    }, 3000);
  };

  const handleManualCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChapterId) {
      showError("Please select a valid Chapter first.");
      return;
    }
    if (!questionText || !optionA || !optionB || !optionC || !optionD) {
      showError("Please fill out all the question parameters.");
      return;
    }

    addQuestion({
      chapter_id: selectedChapterId,
      topic_name: topicName,
      question_text: questionText,
      option_a: optionA,
      option_b: optionB,
      option_c: optionC,
      option_d: optionD,
      correct_option: correctOption,
      difficulty: difficulty,
    });

    // Reset fields
    setQuestionText("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    showSuccess("Question inserted directly into database successfully!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl">
      {/* LEFT COLUMN: Controls & Chapter Maker */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-4">
            <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Database className="w-4 h-4" />
            </span>
            Subject & Folder Core
          </h3>

          <div className="flex gap-2 mb-4 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            {(["Physics", "Chemistry", "Biology"] as const).map((sub) => (
              <button
                key={sub}
                onClick={() => {
                  setSelectedSubject(sub);
                  setSelectedChapterId("");
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  selectedSubject === sub
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          <ChapterDropdown
            selectedSubject={selectedSubject}
            selectedChapterId={selectedChapterId}
            onSelectChapterId={setSelectedChapterId}
            className="mb-4"
          />

          <form onSubmit={handleAddChapter} className="mt-4 pt-4 border-t border-slate-800/60 flex gap-2">
            <input
              type="text"
              value={newChapterName}
              onChange={(e) => setNewChapterName(e.target.value)}
              placeholder="Add New Chapter (e.g. Fluids)"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="bg-slate-800 hover:bg-slate-700 text-slate-100 px-3 rounded-xl text-xs font-bold transition-all"
            >
              Create
            </button>
          </form>
        </div>

        {/* Dynamic PDF / Document Ingestion */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex-1 flex flex-col">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Multimodal AI Ingestion Pipeline
          </h3>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Upload PDFs/images. Our Gemini 1.5 pipeline will extract questions, identify diagrams, store images, and save structures under the chosen folder.
          </p>

          <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 transition-all text-center flex flex-col justify-center items-center flex-1 cursor-pointer"
            onClick={() => runSimulatedGeminiExtractor("Practice_Set_A.pdf")}
          >
            <Upload className="w-8 h-8 text-slate-500 mb-3" />
            <span className="text-xs text-slate-300 font-medium">Click to Drag or Upload PDF</span>
            <span className="text-[10px] text-slate-500 mt-1">E.g. Practice_Set_A.pdf</span>
          </div>

          {isUploading && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Gemini Extracting...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {logs.length > 0 && (
            <div className="mt-4 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[10px] text-emerald-400 h-32 overflow-y-auto flex flex-col gap-1">
              {logs.map((log, idx) => (
                <div key={idx}>{log}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Rich Form-based Question Creator (Math & Complex Input) */}
      <div className="lg:col-span-7 bg-slate-900/40 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-4">
            <PlusCircle className="w-4.5 h-4.5 text-emerald-400" />
            Interactive Question Inserter
          </h3>

          <form onSubmit={handleManualCreate} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-slate-400 font-medium mb-1 block">Topic Name</label>
              <input
                type="text"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                placeholder="Topic / Concept (e.g., Simple Harmonic Motion)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs text-slate-400 font-medium mb-1 block">Question Text</label>
              <textarea
                rows={3}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Type question context (Supports formatting & equations)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition-all resize-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Option A</label>
              <input
                type="text"
                value={optionA}
                onChange={(e) => setOptionA(e.target.value)}
                placeholder="Option A text"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Option B</label>
              <input
                type="text"
                value={optionB}
                onChange={(e) => setOptionB(e.target.value)}
                placeholder="Option B text"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Option C</label>
              <input
                type="text"
                value={optionC}
                onChange={(e) => setOptionC(e.target.value)}
                placeholder="Option C text"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Option D</label>
              <input
                type="text"
                value={optionD}
                onChange={(e) => setOptionD(e.target.value)}
                placeholder="Option D text"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Correct Answer Key</label>
              <select
                value={correctOption}
                onChange={(e) => setCorrectOption(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
              >
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Difficulty Rank</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </form>
        </div>

        <button
          onClick={handleManualCreate}
          className="mt-6 w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15"
        >
          <CheckCircle className="w-4.5 h-4.5" /> Save to Question Library
        </button>
      </div>
    </div>
  );
};

export default UploadZone;