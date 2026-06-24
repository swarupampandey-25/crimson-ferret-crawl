import { Chapter, Question, Formula } from "../types/dpp";

export const initialChapters: Chapter[] = [
  { chapter_id: "ch-1", subject_name: "Physics", chapter_name: "Rotational Mechanics" },
  { chapter_id: "ch-2", subject_name: "Physics", chapter_name: "Electrostatics" },
  { chapter_id: "ch-3", subject_name: "Chemistry", chapter_name: "Chemical Bonding" },
  { chapter_id: "ch-4", subject_name: "Chemistry", chapter_name: "Thermodynamics" },
  { chapter_id: "ch-5", subject_name: "Biology", chapter_name: "Cell Cycle & Division" },
  { chapter_id: "ch-6", subject_name: "Biology", chapter_name: "Principles of Inheritance" },
];

export const initialQuestions: Question[] = [
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

export const initialFormulas: Formula[] = [
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