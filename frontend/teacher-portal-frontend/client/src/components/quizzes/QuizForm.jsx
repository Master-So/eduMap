import { useMemo, useState } from 'react';

const CURRICULUM = {
  '10th': {
    Science: [
      'Chemical Reactions',
      'Acids, Bases and Salts',
      'Metals and Non-metals',
      'Carbon and its Compounds',
      'Life Processes',
      'Control and Coordination',
      'How do Organisms Reproduce',
      'Heredity and Evolution',
      'Light - Reflection',
      'The Human Eye and Colourful World',
      'Electricity',
      'Magnetic Effects of Electric Current',
      'Our Environment',
    ],
    Mathematics: [
      'Real Numbers',
      'Polynomials',
      'Pair of Linear Equations',
      'Quadratic Equations',
      'Arithmetic Progressions',
      'Triangles',
      'Coordinate Geometry',
      'Introduction to Trigonometry',
      'Applications of Trigonometry',
      'Circles',
      'Surface Areas and Volumes',
      'Statistics',
      'Probability',
    ],
    'Social Science': [
      'Rise of Nationalism in Europe',
      'Nationalism in India',
      'Resources and Development',
      'Agriculture',
      'Power Sharing',
      'Federalism',
      'Money and Credit',
      'Globalization and Indian Economy',
      'Political Parties',
      'Outcomes of Democracy',
    ],
    English: [
      'Reading Comprehension',
      'Tenses and Modals',
      'Subject-Verb Concord',
      'Reported Speech',
      'Analytical Paragraph Writing',
      'Formal Letter Writing',
    ],
    'Computer Applications': [
      'Basics of Information Technology',
      'Cyberethics and Online Safety',
      'HTML and Web Design',
      'Python Programming Basics',
    ],
  },
  '12th': {
    Physics: [
      'Electrostatics',
      'Current Electricity',
      'Magnetic Effects of Current & Magnetism',
      'Electromagnetic Induction',
      'Alternating Current',
      'Electromagnetic Waves',
      'Optics',
      'Dual Nature of Radiation',
      'Atoms and Nuclei',
      'Semiconductor Electronics',
      'Thermodynamics',
    ],
    Chemistry: [
      'Solutions',
      'Electrochemistry',
      'Chemical Kinetics',
      'd and f Block Elements',
      'Coordination Compounds',
      'Haloalkanes and Haloarenes',
      'Alcohols, Phenols and Ethers',
      'Aldehydes, Ketones and Carboxylic Acids',
      'Amines',
      'Biomolecules',
    ],
    Mathematics: [
      'Relations and Functions',
      'Inverse Trigonometric Functions',
      'Matrices and Determinants',
      'Continuity and Differentiability',
      'Applications of Derivatives',
      'Integrals',
      'Differential Equations',
      'Vector Algebra',
      'Three Dimensional Geometry',
      'Linear Programming',
      'Probability',
    ],
    Biology: [
      'Sexual Reproduction in Flowering Plants',
      'Human Reproduction',
      'Reproductive Health',
      'Principles of Inheritance and Variation',
      'Molecular Basis of Inheritance',
      'Human Health and Disease',
      'Biotechnology - Principles and Applications',
      'Ecosystem and Biodiversity',
    ],
    'Computer Science': [
      'Python Functions and File Handling',
      'Data Structures',
      'SQL',
      'Boolean Algebra',
      'Networking',
      'Cyber Safety and Security',
    ],
    Economics: [
      'National Income Accounting',
      'Money and Banking',
      'Determination of Income and Employment',
      'Government Budget',
      'Indian Economic Development',
      'Human Capital Formation and Rural Development',
    ],
    'Business Studies': [
      'Principles of Management',
      'Business Environment',
      'Planning and Organizing',
      'Financial Management',
      'Marketing Management',
      'Consumer Protection',
    ],
  },
};

const toggleValue = (values, value) => values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

function ChoiceGroup({ label, values, selected, onToggle, disabled, emptyLabel }) {
  return <fieldset className="choice-group" disabled={disabled}>
    <legend>{label}</legend>
    {values.length ? <div className="choice-grid">{values.map((value) => <label className={`choice-chip ${selected.includes(value) ? 'selected' : ''}`} key={value}>
      <input type="checkbox" checked={selected.includes(value)} onChange={() => onToggle(value)} />
      <span>{value}</span>
    </label>)}</div> : <p className="selection-hint">{emptyLabel}</p>}
  </fieldset>;
}

function GradeChoice({ value, selected, onChange, disabled }) {
  return <label className={`choice-chip ${selected === value ? 'selected' : ''}`}>
    <input type="radio" name="grade" value={value} checked={selected === value} onChange={() => onChange(value)} disabled={disabled} required />
    <span>{value}</span>
  </label>;
}

export default function QuizForm({ onSubmit, disabled }) {
  const [form, setForm] = useState({ grade: '', subjects: [], chapters: [], questionCount: '' });
  const subjects = useMemo(() => form.grade ? Object.keys(CURRICULUM[form.grade] || {}) : [], [form.grade]);
  const chapters = useMemo(() => [...new Set(form.subjects.flatMap((subject) => CURRICULUM[form.grade]?.[subject] || []))], [form.grade, form.subjects]);
  const updateGrade = (grade) => setForm((current) => ({ ...current, grade, subjects: [], chapters: [] }));
  const updateSelection = (key, value) => setForm((current) => ({ ...current, [key]: toggleValue(current[key], value) }));
  const updateCount = (event) => setForm((current) => ({ ...current, questionCount: event.target.value }));
  const submit = (event) => { event.preventDefault(); onSubmit(form); };
  const canSubmit = form.grade && form.subjects.length && form.chapters.length && form.questionCount;
  return <form className="quiz-form" onSubmit={submit}>
    <div className="form-intro"><span className="eyebrow">Curriculum brief</span><h2>Choose the learning context.</h2><p>Select one grade, then one or more subjects and chapters from the available curriculum.</p></div>
    <fieldset className="choice-group" disabled={disabled}><legend>Grade</legend><div className="choice-grid">{Object.keys(CURRICULUM).map((grade) => <GradeChoice key={grade} value={grade} selected={form.grade} onChange={updateGrade} disabled={disabled} />)}</div></fieldset>
    <ChoiceGroup label="Subject" values={subjects} selected={form.subjects} onToggle={(value) => updateSelection('subjects', value)} disabled={disabled || !form.grade} emptyLabel="Select a grade first." />
    <ChoiceGroup label="Chapter" values={chapters} selected={form.chapters} onToggle={(value) => updateSelection('chapters', value)} disabled={disabled || !form.subjects.length} emptyLabel="Select a subject first." />
    <label>Number of questions<select required value={form.questionCount} onChange={updateCount} disabled={disabled}><option value="">Select a count</option><option value="5">5</option><option value="10">10</option><option value="15">15</option><option value="20">20</option></select></label>
    <button className="button primary wide" disabled={disabled || !canSubmit}>{disabled ? 'Generating quiz...' : 'Generate quiz'}</button>
  </form>;
}
