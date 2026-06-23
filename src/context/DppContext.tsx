import React, { createContext, useContext, useState, useEffect } from "react";
import { showSuccess, showError } from "@/utils/toast";

export interface Chapter {
  chapter_id: string;
  subject_name: "Physics" | "Chemistry" | "Biology";
  chapter_name: string;
}

export interface Question {
  question_id: string;
  chapter_id: string;
  topic_name: string;
  question_text: string;
  diagram_url?: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "A" | "B" | "C" | "D";
  parent_question_id?: string;
  created_at: string;
  difficulty?: "Easy" | "Medium" | "Hard";
}

export interface UserAttempt {
  attempt_id: string;
  question_id: string;
  selected_option: "A" | "B" | "C" | "D" | null;
  is_correct: boolean;
  time_taken_seconds: number;
  attempted_at: string;
}

export interface MistakeEntry {
  mistake_id: string;
  question_id: string;
  chapter_id: string;
  error_type: "Conceptual Loophole" | "Calculation Error" | "Skipped";
  created_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIChat {
  chat_id: string;
  question_id: string;
  conversation_history: ChatMessage[];
  updated_at: string;
}

export interface Formula {
  formula_id: string;
  chapter_id: string;
  subject_name: "Physics" | "Chemistry" | "Biology";
  title: string;
  expression: string;
  description: string;
  is_favorite: boolean;
}

export interface StudyStats {
  focused_minutes: number;
  completed_sessions: number;
}

interface DppContextType {
  chapters: Chapter[];
  questions: Question[];
  attempts: UserAttempt[];
  mistakes: MistakeEntry[];
  chats: Record<string, AIChat>; // keyed by question_id
  formulas: Formula[];
  studyStats: StudyStats;
  bookmarkedQuestionIds: string[];
  addChapter: (subject: "Physics" | "Chemistry" | "Biology", name: string) => void;
  addQuestion: (question: Omit<Question, "question_id" | "created_at">) => Question;
  submitAttempt: (attempt: Omit<UserAttempt, "attempt_id" | "attempted_at">) => void;
  addToMistakeBook: (question_id: string, chapter_id: string, error_type: MistakeEntry["error_type"]) => void;
  removeFromMistakeBook: (question_id: string) => void;
  sendMessageToChat: (question_id: string, message: string, assistantReply?: string) => void;
  spawnSimilarQuestion: (parentQuestion: Question) => Question;
  addFormula: (formula: Omit<Formula, "formula_id" | "is_favorite">) => void;
  toggleFormulaFavorite: (formula_id: string) => void;
  deleteFormula: (formula_id: string) => void;
  addFocusedMinutes: (minutes: number) => void;
  toggleBookmarkQuestion: (question_id: string) => void;
}

const DppContext = createContext<DppContextType | undefined>(undefined);

const initialChapters: Chapter[] = [
  { chapter_id: "ch-1", subject_name: "Physics", chapter_name: "Rotational Mechanics" },
  { chapter_id: "ch-2", subject_name: "Physics", chapter_name: "Electrostatics" },
  { chapter_id: "ch-3", subject_name: "Chemistry", chapter_name: "Chemical Bonding" },
  { chapter_id: "ch-4", subject_name: "Chemistry", chapter_name: "Thermodynamics" },
  { chapter_id: "ch-5", subject_name: "Biology", chapter_name: "Cell Cycle & Division" },
  { chapter_id: "ch-6", subject_name: "Biology", chapter_name: "Principles of Inheritance" },
];

const initialQuestions: Question[] = [
  {
    question_id: "q-1",
    chapter_id: "ch-1",
    topic_name: "Moment of Inertia",
    question_text: "A thin uniform rod of mass M and length L is rotating about an axis passing through its center and perpendicular to its length. Find its Moment of Inertia.",
    option_a: "M L² / 12",
    option_b: "M L² / 3",
    option_c: "M L² / 2",
    option_d: "2/5 M L²",
    correct_option: "A",
    difficulty: "Easy",
    created_at: new Date().toISOString()
  },
  {
    question_id: "q-2",
    chapter_id: "ch-1",
    topic_name: "Conservation of Angular Momentum",
    question_text: "A child stands at the center of a turntable rotating with angular velocity ω. If the child walks radially outwards to the edge, what happens to the angular velocity of the system?",
    option_a: "Increases",
    option_b: "Decreases",
    option_c: "Remains constant",
    option_d: "First increases then decreases",
    correct_option: "B",
    difficulty: "Medium",
    created_at: new Date().toISOString()
  },
  {
    question_id: "q-3",
    chapter_id: "ch-2",
    topic_name: "Gauss's Law",
    question_text: "An electric charge q is placed at the center of a cube of side length 'a'. What is the total electric flux passing through one face of the cube?",
    option_a: "q / ε₀",
    option_b: "q / (6 ε₀)",
    option_c: "q / (2 ε₀)",
    option_d: "Zero",
    correct_option: "B",
    difficulty: "Medium",
    created_at: new Date().toISOString()
  },
  {
    question_id: "q-4",
    chapter_id: "ch-3",
    topic_name: "VSEPR Theory",
    question_text: "What is the molecular geometry of SF₄ (Sulfur tetrafluoride) according to the VSEPR theory?",
    option_a: "Tetrahedral",
    option_b: "Square Planar",
    option_c: "See-saw",
    option_d: "Trigonal Bipyramidal",
    correct_option: "C",
    difficulty: "Hard",
    created_at: new Date().toISOString()
  },
  {
    question_id: "q-5",
    chapter_id: "ch-5",
    topic_name: "Mitosis Phase",
    question_text: "During which phase of Mitosis do the sister chromatids separate and move towards the opposite poles of the spindle fibers?",
    option_a: "Prophase",
    option_b: "Metaphase",
    option_c: "Anaphase",
    option_d: "Telophase",
    correct_option: "C",
    difficulty: "Easy",
    created_at: new Date().toISOString()
  }
];

const initialFormulas: Formula[] = [
  {
    formula_id: "f-1",
    chapter_id: "ch-1",
    subject_name: "Physics",
    title: "Parallel Axis Theorem",
    expression: "I = I_cm + M d²",
    description: "Computes moment of inertia about any axis parallel to the axis passing through center of mass.",
    is_favorite: true
  },
  {
    formula_id: "f-2",
    chapter_id: "ch-2",
    subject_name: "Physics",
    title: "Electric Potential of Point Charge",
    expression: "V = k Q / r",
    description: "Determines work required to bring unit positive charge from infinity.",
    is_favorite: false
  },
  {
    formula_id: "f-3",
    chapter_id: "ch-3",
    subject_name: "Chemistry",
    title: "Formal Charge calculation",
    expression: "FC = V - N - B/2",
    description: "V = Valence electrons, N = Non-bonding electrons, B = bonding shared electrons.",
    is_favorite: true
  }
];

export const DppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chapters, setChapters] = useState<Chapter[]>(() => {
    const saved = localStorage.getItem("dpp_chapters");
    return saved ? JSON.parse(saved) : initialChapters;
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem("dpp_questions");
    return saved ? JSON.parse(saved) : initialQuestions;
  });

  const [attempts, setAttempts] = useState<UserAttempt[]>(() => {
    const saved = localStorage.getItem("dpp_attempts");
    return saved ? JSON.parse(saved) : [];
  });

  const [mistakes, setMistakes] = useState<MistakeEntry[]>(() => {
    const saved = localStorage.getItem("dpp_mistakes");
    return saved ? JSON.parse(saved) : [];
  });

  const [chats, setChats] = useState<Record<string, AIChat>>(() => {
    const saved = localStorage.getItem("dpp_chats");
    return saved ? JSON.parse(saved) : {};
  });

  const [formulas, setFormulas] = useState<Formula[]>(() => {
    const saved = localStorage.getItem("dpp_formulas");
    return saved ? JSON.parse(saved) : initialFormulas;
  });

  const [studyStats, setStudyStats] = useState<StudyStats>(() => {
    const saved = localStorage.getItem("dpp_study_stats");
    return saved ? JSON.parse(saved) : { focused_minutes: 45, completed_sessions: 2 };
  });

  const [bookmarkedQuestionIds, setBookmarkedQuestionIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("dpp_bookmarks");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("dpp_chapters", JSON.stringify(chapters));
  }, [chapters]);

  useEffect(() => {
    localStorage.setItem("dpp_questions", JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem("dpp_attempts", JSON.stringify(attempts));
  }, [attempts]);

  useEffect(() => {
    localStorage.setItem("dpp_mistakes", JSON.stringify(mistakes));
  }, [mistakes]);

  useEffect(() => {
    localStorage.setItem("dpp_chats", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem("dpp_formulas", JSON.stringify(formulas));
  }, [formulas]);

  useEffect(() => {
    localStorage.setItem("dpp_study_stats", JSON.stringify(studyStats));
  }, [studyStats]);

  useEffect(() => {
    localStorage.setItem("dpp_bookmarks", JSON.stringify(bookmarkedQuestionIds));
  }, [bookmarkedQuestionIds]);

  const addChapter = (subject: "Physics" | "Chemistry" | "Biology", name: string) => {
    const alreadyExists = chapters.some(
      (c) => c.subject_name === subject && c.chapter_name.toLowerCase() === name.toLowerCase()
    );
    if (alreadyExists) {
      showError("Chapter already exists under this subject!");
      return;
    }
    const newChapter: Chapter = {
      chapter_id: `ch-${Date.now()}`,
      subject_name: subject,
      chapter_name: name,
    };
    setChapters((prev) => [...prev, newChapter]);
    showSuccess(`Chapter "${name}" added successfully.`);
  };

  const addQuestion = (qData: Omit<Question, "question_id" | "created_at">) => {
    const newQ: Question = {
      ...qData,
      question_id: `q-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setQuestions((prev) => [newQ, ...prev]);
    return newQ;
  };

  const submitAttempt = (attData: Omit<UserAttempt, "attempt_id" | "attempted_at">) => {
    const newAttempt: UserAttempt = {
      ...attData,
      attempt_id: `att-${Date.now()}`,
      attempted_at: new Date().toISOString(),
    };
    setAttempts((prev) => [...prev, newAttempt]);

    // Handle automated Mistake Book logs
    if (!attData.is_correct) {
      const relatedQ = questions.find((q) => q.question_id === attData.question_id);
      if (relatedQ) {
        addToMistakeBook(
          attData.question_id,
          relatedQ.chapter_id,
          attData.selected_option === null ? "Skipped" : "Conceptual Loophole"
        );
      }
    }
  };

  const addToMistakeBook = (question_id: string, chapter_id: string, error_type: MistakeEntry["error_type"]) => {
    const alreadyLogged = mistakes.some((m) => m.question_id === question_id);
    if (alreadyLogged) return;

    const newMistake: MistakeEntry = {
      mistake_id: `mistake-${Date.now()}`,
      question_id,
      chapter_id,
      error_type,
      created_at: new Date().toISOString(),
    };
    setMistakes((prev) => [newMistake, ...prev]);
  };

  const removeFromMistakeBook = (question_id: string) => {
    setMistakes((prev) => prev.filter((m) => m.question_id !== question_id));
    showSuccess("Removed from your Mistake Book!");
  };

  const sendMessageToChat = (question_id: string, message: string, assistantReply?: string) => {
    setChats((prev) => {
      const existing = prev[question_id] || {
        chat_id: `chat-${Date.now()}`,
        question_id,
        conversation_history: [],
        updated_at: new Date().toISOString(),
      };

      const userMsg: ChatMessage = { role: "user", content: message };
      const aiMsg: ChatMessage = {
        role: "assistant",
        content: assistantReply || `Let's break this down. In the topic "${questions.find(q => q.question_id === question_id)?.topic_name || "Physics"}", remember to use the correct formulas and double-check standard values!`,
      };

      return {
        ...prev,
        [question_id]: {
          ...existing,
          conversation_history: [...existing.conversation_history, userMsg, aiMsg],
          updated_at: new Date().toISOString(),
        },
      };
    });
  };

  const spawnSimilarQuestion = (parentQuestion: Question): Question => {
    let textVariant = "";
    let optA = "";
    let optB = "";
    let optC = "";
    let optD = "";
    let correct: "A" | "B" | "C" | "D" = "A";

    if (parentQuestion.topic_name === "Moment of Inertia") {
      textVariant = `[Spawned Variant] A uniform solid cylinder of mass M and radius R rotates about its central longitudinal axis. Calculate its Moment of Inertia.`;
      optA = "1/2 M R²";
      optB = "M R²";
      optC = "2/5 M R²";
      optD = "3/2 M R²";
      correct = "A";
    } else if (parentQuestion.topic_name === "Gauss's Law") {
      textVariant = `[Spawned Variant] A charge Q is located at the center of a sphere of radius R. If the radius is doubled, how does the electric flux through the surface change?`;
      optA = "Flux increases twofold";
      optB = "Flux decreases to one-fourth";
      optC = "Flux remains unchanged (Q / ε₀)";
      optD = "Flux becomes zero";
      correct = "C";
    } else if (parentQuestion.topic_name === "VSEPR Theory") {
      textVariant = `[Spawned Variant] What is the expected geometry of H₂O (Water molecule) according to the VSEPR theory, taking into account lone pair repulsions?`;
      optA = "Linear";
      optB = "Bent / V-shaped";
      optC = "Trigonal Pyramidal";
      optD = "Tetrahedral";
      correct = "B";
    } else {
      textVariant = `[Spawned Variant of ${parentQuestion.topic_name}] Solve a parallel question where the dimensions/variables are scaled by a factor of 2. What is the newly computed equilibrium value?`;
      optA = `Double the original value`;
      optB = `Four times the original value`;
      optC = `Remains unchanged`;
      optD = `Half the original value`;
      correct = "A";
    }

    const spawned: Question = {
      question_id: `q-spawned-${Date.now()}`,
      chapter_id: parentQuestion.chapter_id,
      topic_name: `${parentQuestion.topic_name} (Variant)`,
      question_text: textVariant,
      option_a: optA,
      option_b: optB,
      option_c: optC,
      option_d: optD,
      correct_option: correct,
      parent_question_id: parentQuestion.question_id,
      difficulty: "Medium",
      created_at: new Date().toISOString(),
    };

    setQuestions((prev) => [spawned, ...prev]);
    showSuccess("Successfully spawned a conceptually similar question right in this chapter!");
    return spawned;
  };

  const addFormula = (fData: Omit<Formula, "formula_id" | "is_favorite">) => {
    const newFormula: Formula = {
      ...fData,
      formula_id: `f-${Date.now()}`,
      is_favorite: false,
    };
    setFormulas((prev) => [newFormula, ...prev]);
    showSuccess(`Formula "${fData.title}" saved successfully!`);
  };

  const toggleFormulaFavorite = (formula_id: string) => {
    setFormulas((prev) =>
      prev.map((f) => (f.formula_id === formula_id ? { ...f, is_favorite: !f.is_favorite } : f))
    );
  };

  const deleteFormula = (formula_id: string) => {
    setFormulas((prev) => prev.filter((f) => f.formula_id !== formula_id));
    showSuccess("Formula removed.");
  };

  const addFocusedMinutes = (minutes: number) => {
    setStudyStats((prev) => ({
      focused_minutes: prev.focused_minutes + minutes,
      completed_sessions: prev.completed_sessions + 1,
    }));
    showSuccess(`Fantastic! You earned +${minutes} focused minutes.`);
  };

  const toggleBookmarkQuestion = (question_id: string) => {
    setBookmarkedQuestionIds((prev) => {
      const isBookmarked = prev.includes(question_id);
      if (isBookmarked) {
        showSuccess("Question removed from bookmarks.");
        return prev.filter((id) => id !== question_id);
      } else {
        showSuccess("Question pinned to your review bookmarks.");
        return [...prev, question_id];
      }
    });
  };

  return (
    <DppContext.Provider
      value={{
        chapters,
        questions,
        attempts,
        mistakes,
        chats,
        formulas,
        studyStats,
        bookmarkedQuestionIds,
        addChapter,
        addQuestion,
        submitAttempt,
        addToMistakeBook,
        removeFromMistakeBook,
        sendMessageToChat,
        spawnSimilarQuestion,
        addFormula,
        toggleFormulaFavorite,
        deleteFormula,
        addFocusedMinutes,
        toggleBookmarkQuestion,
      }}
    >
      {children}
    </DppContext.Provider>
  );
};

export const useDpp = () => {
  const context = useContext(DppContext);
  if (!context) {
    throw new Error("useDpp must be used within a DppProvider");
  }
  return context;
};