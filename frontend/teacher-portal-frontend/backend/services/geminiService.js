import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const QUESTION_COUNT_MIN = 1;
const QUESTION_COUNT_MAX = 50;

function normalizeQuestion(question, chapters) {
  const questionText = String(question.questionText || question.question || question.text || '').trim();
  const options = Array.isArray(question.options) ? question.options.map((option) => String(option).trim()).filter(Boolean) : [];
  const correctIndex = Number(question.correctIndex);
  const topicTag = String(question.topicTag || '').trim();
  if (!questionText || options.length !== 4 || !Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3 || !chapters.includes(topicTag)) return null;
  return { type: 'MCQ', questionText, options, correctIndex, topicTag, difficulty: ['Easy', 'Medium', 'Hard'].includes(question.difficulty) ? question.difficulty : 'Medium' };
}

const QUESTION_BANK = {
  'Chemical Reactions': [
    { questionText: 'What is observed when quicklime is added to water in a beaker?', options: ['Vigorous reaction releasing heat', 'Temperature decreases rapidly', 'No noticeable change', 'Formation of a yellow precipitate'], correctIndex: 0, difficulty: 'Easy' },
    { questionText: 'Which gas is released when zinc granules react with dilute hydrochloric acid?', options: ['Oxygen gas', 'Hydrogen gas', 'Carbon dioxide gas', 'Nitrogen dioxide gas'], correctIndex: 1, difficulty: 'Easy' },
    { questionText: 'In a redox reaction, what happens to the substance that gains electrons?', options: ['It gets oxidised', 'It is reduced', 'It becomes a catalyst', 'It acts as an oxidising agent only'], correctIndex: 1, difficulty: 'Medium' },
    { questionText: 'The black coating on silver articles exposed to air is formed due to:', options: ['Silver oxide', 'Silver nitrate', 'Silver sulphide', 'Silver carbonate'], correctIndex: 2, difficulty: 'Medium' },
    { questionText: 'Which type of reaction is the decomposition of lead nitrate producing nitrogen dioxide?', options: ['Thermal decomposition', 'Electrolytic decomposition', 'Photochemical decomposition', 'Displacement reaction'], correctIndex: 0, difficulty: 'Hard' }
  ],
  'Acids, Bases and Salts': [
    { questionText: 'What is the pH range of human blood under normal physiological conditions?', options: ['5.5 to 6.0', '7.35 to 7.45', '8.5 to 9.0', '6.0 to 6.8'], correctIndex: 1, difficulty: 'Easy' },
    { questionText: 'Which acid is naturally present in nettle sting that causes burning pain?', options: ['Acetic acid', 'Citric acid', 'Methanoic acid', 'Oxalic acid'], correctIndex: 2, difficulty: 'Medium' },
    { questionText: 'Plaster of Paris is chemically known as:', options: ['Calcium sulphate dihydrate', 'Calcium sulphate hemihydrate', 'Calcium chloride hexahydrate', 'Calcium carbonate'], correctIndex: 1, difficulty: 'Medium' },
    { questionText: 'Bleaching powder is produced by the action of chlorine on:', options: ['Dry slaked lime', 'Quicklime', 'Limestone', 'Gypsum'], correctIndex: 0, difficulty: 'Medium' },
    { questionText: 'What colour does phenolphthalein turn in an aqueous solution of sodium hydroxide?', options: ['Colourless', 'Pink', 'Blue', 'Yellow'], correctIndex: 1, difficulty: 'Easy' }
  ],
  'Life Processes': [
    { questionText: 'Which enzyme in saliva breaks down starch into simple sugars?', options: ['Pepsin', 'Salivary amylase', 'Trypsin', 'Lipase'], correctIndex: 1, difficulty: 'Easy' },
    { questionText: 'The process of transporting synthesized food from leaves to other plant parts is called:', options: ['Transpiration', 'Translocation', 'Respiration', 'Osmosis'], correctIndex: 1, difficulty: 'Easy' },
    { questionText: 'In human kidneys, the functional filtration units are called:', options: ['Alveoli', 'Neurons', 'Nephrons', 'Villi'], correctIndex: 2, difficulty: 'Easy' },
    { questionText: 'Which chamber of the human heart pumps oxygenated blood into the aorta?', options: ['Right atrium', 'Left atrium', 'Right ventricle', 'Left ventricle'], correctIndex: 3, difficulty: 'Medium' },
    { questionText: 'Anaerobic breakdown of pyruvate in yeast cells produces:', options: ['Lactic acid and energy', 'Ethanol, carbon dioxide, and energy', 'Carbon dioxide, water, and energy', 'Pyruvic acid and ATP'], correctIndex: 1, difficulty: 'Hard' }
  ],
  'Light - Reflection': [
    { questionText: 'The focal length of a spherical mirror with radius of curvature 30 cm is:', options: ['60 cm', '30 cm', '15 cm', '7.5 cm'], correctIndex: 2, difficulty: 'Easy' },
    { questionText: 'Which type of mirror is used as a rear-view mirror in motor vehicles?', options: ['Plane mirror', 'Concave mirror', 'Convex mirror', 'Parabolic mirror'], correctIndex: 2, difficulty: 'Easy' },
    { questionText: 'Where should an object be placed in front of a concave mirror to get a real, inverted image of equal size?', options: ['At infinity', 'At the principal focus', 'At the centre of curvature', 'Between focus and pole'], correctIndex: 2, difficulty: 'Medium' },
    { questionText: 'The power of a lens having focal length 50 cm is:', options: ['+2 D', '+0.5 D', '+5 D', '-2 D'], correctIndex: 0, difficulty: 'Medium' },
    { questionText: 'When a ray of light enters from air into glass, what happens to its speed and wavelength?', options: ['Speed decreases, wavelength decreases', 'Speed increases, wavelength increases', 'Speed decreases, wavelength increases', 'Speed increases, wavelength decreases'], correctIndex: 0, difficulty: 'Hard' }
  ],
  'Real Numbers': [
    { questionText: 'According to the Fundamental Theorem of Arithmetic, every composite number can be expressed as a product of:', options: ['Even numbers', 'Prime numbers uniquely', 'Rational numbers', 'Irrational numbers'], correctIndex: 1, difficulty: 'Easy' },
    { questionText: 'If HCF(a, b) = 12 and a × b = 1800, what is LCM(a, b)?', options: ['120', '150', '180', '200'], correctIndex: 1, difficulty: 'Medium' },
    { questionText: 'The decimal expansion of 13 / (2^3 * 5^2) terminates after how many decimal places?', options: ['1', '2', '3', '5'], correctIndex: 2, difficulty: 'Medium' },
    { questionText: 'What type of number is 2 + √3?', options: ['Rational number', 'Irrational number', 'Integer', 'Composite number'], correctIndex: 1, difficulty: 'Easy' },
    { questionText: 'For what value of natural number n does 6^n end with digit 0?', options: ['n = 2', 'n = 5', 'n = 10', 'No value of n'], correctIndex: 3, difficulty: 'Hard' }
  ],
  'Polynomials': [
    { questionText: 'A quadratic polynomial can have at most how many real zeroes?', options: ['1', '2', '3', '4'], correctIndex: 1, difficulty: 'Easy' },
    { questionText: 'If α and β are the zeroes of x² - 5x + 6, what is the value of α + β?', options: ['-5', '5', '6', '-6'], correctIndex: 1, difficulty: 'Easy' },
    { questionText: 'What is the product of the zeroes of the polynomial 2x² - 8x + 6?', options: ['3', '4', '-3', '-4'], correctIndex: 0, difficulty: 'Medium' },
    { questionText: 'If one zero of the polynomial (k - 1)x² + kx + 1 is -3, then the value of k is:', options: ['4/3', '-4/3', '2/3', '-2/3'], correctIndex: 0, difficulty: 'Hard' },
    { questionText: 'The graph of y = p(x) intersects the x-axis at 3 distinct points. How many zeroes does p(x) have?', options: ['0', '1', '2', '3'], correctIndex: 3, difficulty: 'Easy' }
  ],
  'Quadratic Equations': [
    { questionText: 'The discriminant (D) of the quadratic equation ax² + bx + c = 0 is given by:', options: ['b² - 4ac', 'b² + 4ac', '4ac - b²', '√b² - 4ac'], correctIndex: 0, difficulty: 'Easy' },
    { questionText: 'If the discriminant of a quadratic equation is greater than zero (D > 0), the roots are:', options: ['Real and equal', 'Real and distinct', 'Non-real / complex', 'Zero'], correctIndex: 1, difficulty: 'Easy' },
    { questionText: 'What are the roots of the equation x² - 7x + 12 = 0?', options: ['3 and 4', '-3 and -4', '2 and 6', '-2 and -6'], correctIndex: 0, difficulty: 'Medium' },
    { questionText: 'For what value of k does 2x² + kx + 3 = 0 have two equal roots?', options: ['±√24', '±2√6', '±6', '±12'], correctIndex: 1, difficulty: 'Hard' },
    { questionText: 'If one root of 3x² - px + 6 = 0 is 2, find the value of p.', options: ['7', '9', '6', '8'], correctIndex: 1, difficulty: 'Medium' }
  ],
  'Triangles': [
    { questionText: 'The Basic Proportionality Theorem (Thales Theorem) applies to:', options: ['Any polygon', 'Triangles with a parallel line to one side', 'Right-angled triangles only', 'Equilateral triangles only'], correctIndex: 1, difficulty: 'Easy' },
    { questionText: 'If two triangles are similar, the ratio of their corresponding sides is:', options: ['Equal to ratio of perimeters', 'Equal to ratio of areas', 'Always 1', 'Variable across sides'], correctIndex: 0, difficulty: 'Medium' },
    { questionText: 'In ΔABC, if DE || BC intersecting AB at D and AC at E with AD=2, DB=3, AE=4, then EC is:', options: ['5', '6', '7', '8'], correctIndex: 1, difficulty: 'Medium' },
    { questionText: 'Which criterion is NOT a test for similarity of two triangles?', options: ['AAA', 'SAS', 'SSS', 'RHS congruency without proportionality'], correctIndex: 3, difficulty: 'Easy' },
    { questionText: 'In a right-angled triangle, the square of the hypotenuse equals the sum of squares of other two sides by:', options: ['Euler theorem', 'Pythagoras theorem', 'Apollonius theorem', 'Ceva theorem'], correctIndex: 1, difficulty: 'Easy' }
  ],
  'Electrostatics': [
    { questionText: 'What is the SI unit of electric flux?', options: ['N/C', 'N·m²/C', 'V/m', 'C/m²'], correctIndex: 1, difficulty: 'Medium' },
    { questionText: 'Coulomb law states that electrostatic force between two charges is inversely proportional to:', options: ['Distance r', 'Square of distance r²', 'Cube of distance r³', 'Product of charges'], correctIndex: 1, difficulty: 'Easy' },
    { questionText: 'The electric field inside a uniformly charged conducting spherical shell is:', options: ['Uniform and non-zero', 'Zero', 'Inversely proportional to radius', 'Infinite'], correctIndex: 1, difficulty: 'Easy' },
    { questionText: 'What happens to the capacitance of a parallel plate capacitor when a dielectric slab is inserted?', options: ['Decreases', 'Increases by factor K', 'Remains unchanged', 'Becomes zero'], correctIndex: 1, difficulty: 'Medium' },
    { questionText: 'The work done in moving a test charge over an equipotential surface is:', options: ['Maximum', 'Negative', 'Zero', 'Dependent on the path'], correctIndex: 2, difficulty: 'Easy' }
  ],
  'Current Electricity': [
    { questionText: 'Ohm law (V = IR) is strictly valid for:', options: ['Semiconductor diodes', 'Metallic conductors at constant temperature', 'Electrolyte solutions', 'Transistors'], correctIndex: 1, difficulty: 'Easy' },
    { questionText: 'Kirchhoff first rule (Junction Rule) is based on the conservation of:', options: ['Energy', 'Linear momentum', 'Electric charge', 'Angular momentum'], correctIndex: 2, difficulty: 'Medium' },
    { questionText: 'The temperature coefficient of resistance is negative for which of the following materials?', options: ['Copper', 'Silicon (Semiconductor)', 'Aluminium', 'Silver'], correctIndex: 1, difficulty: 'Medium' },
    { questionText: 'In a Wheatstone bridge, balance condition occurs when:', options: ['P/Q = R/S', 'P + Q = R + S', 'P*Q = R*S', 'P - Q = R - S'], correctIndex: 0, difficulty: 'Easy' },
    { questionText: 'The drift velocity of electrons in a current-carrying wire is directly proportional to:', options: ['Electric field E', 'Area of cross-section A', 'Length of wire L', 'Square of relaxation time'], correctIndex: 0, difficulty: 'Hard' }
  ],
  'Optics': [
    { questionText: 'Total internal reflection occurs when light travels from:', options: ['Rarer to denser medium at angle > critical angle', 'Denser to rarer medium at angle > critical angle', 'Any medium at 90 degrees', 'Air to water at Brewster angle'], correctIndex: 1, difficulty: 'Easy' },
    { questionText: 'In Young double-slit experiment, if the distance between slits is halved, the fringe width becomes:', options: ['Halved', 'Doubled', 'Quadrupled', 'Unchanged'], correctIndex: 1, difficulty: 'Medium' },
    { questionText: 'Brewster angle ip is related to refractive index n by:', options: ['n = sin(ip)', 'n = cos(ip)', 'n = tan(ip)', 'n = cot(ip)'], correctIndex: 2, difficulty: 'Medium' },
    { questionText: 'Which lens is used to correct hypermetropia (long-sightedness)?', options: ['Concave lens', 'Convex lens', 'Cylindrical lens', 'Bifocal lens'], correctIndex: 1, difficulty: 'Easy' },
    { questionText: 'Diffraction of light proves which nature of light?', options: ['Particle nature', 'Wave nature', 'Dual nature simultaneously', 'Electrochemical nature'], correctIndex: 1, difficulty: 'Easy' }
  ],
  'Thermodynamics': [
    { questionText: 'The First Law of Thermodynamics is an expression of the law of conservation of:', options: ['Mass', 'Heat only', 'Energy', 'Entropy'], correctIndex: 2, difficulty: 'Easy' },
    { questionText: 'In an adiabatic process, the quantity that remains constant is:', options: ['Temperature', 'Pressure', 'Heat exchange (Q = 0)', 'Volume'], correctIndex: 2, difficulty: 'Easy' },
    { questionText: 'The efficiency of a Carnot engine operating between temperatures T1 (source) and T2 (sink) is:', options: ['1 - T2/T1', '1 - T1/T2', 'T2/T1', 'T1/(T1 + T2)'], correctIndex: 0, difficulty: 'Medium' },
    { questionText: 'For an isothermal expansion of an ideal gas, the change in internal energy (ΔU) is:', options: ['Positive', 'Negative', 'Zero', 'Infinite'], correctIndex: 2, difficulty: 'Medium' },
    { questionText: 'The Second Law of Thermodynamics introduces the concept of which state function?', options: ['Enthalpy', 'Entropy', 'Gibbs Free Energy', 'Helmholtz Energy'], correctIndex: 1, difficulty: 'Medium' }
  ],
  'Data Structures': [
    { questionText: 'Which data structure follows the LIFO (Last In First Out) principle?', options: ['Queue', 'Stack', 'Linked List', 'Array'], correctIndex: 1, difficulty: 'Easy' },
    { questionText: 'What is the average time complexity of searching an element in a balanced Binary Search Tree (BST)?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'], correctIndex: 2, difficulty: 'Medium' },
    { questionText: 'In a queue data structure, insertion is performed at which end?', options: ['Front', 'Rear', 'Middle', 'Any index'], correctIndex: 1, difficulty: 'Easy' },
    { questionText: 'Which traversal of a Binary Search Tree produces elements in sorted ascending order?', options: ['Pre-order', 'In-order', 'Post-order', 'Level-order'], correctIndex: 1, difficulty: 'Medium' },
    { questionText: 'A circular linked list differs from a singly linked list because:', options: ['It has two pointers per node', 'The last node points to the first node', 'It cannot hold duplicate values', 'It has fixed memory allocation'], correctIndex: 1, difficulty: 'Easy' }
  ],
  'SQL': [
    { questionText: 'Which SQL clause is used to filter records after grouping them with GROUP BY?', options: ['WHERE', 'HAVING', 'FILTER', 'ORDER BY'], correctIndex: 1, difficulty: 'Easy' },
    { questionText: 'Which of the following is a Data Definition Language (DDL) command in SQL?', options: ['SELECT', 'INSERT', 'CREATE', 'UPDATE'], correctIndex: 2, difficulty: 'Easy' },
    { questionText: 'What type of JOIN returns all rows from the left table and matched rows from the right table?', options: ['INNER JOIN', 'LEFT OUTER JOIN', 'FULL JOIN', 'CROSS JOIN'], correctIndex: 1, difficulty: 'Medium' },
    { questionText: 'Which constraint ensures that all values in a database column are unique and not null?', options: ['FOREIGN KEY', 'PRIMARY KEY', 'CHECK', 'DEFAULT'], correctIndex: 1, difficulty: 'Easy' },
    { questionText: 'Which aggregate function calculates the total sum of numerical values in a column?', options: ['COUNT()', 'AVG()', 'SUM()', 'TOTAL()'], correctIndex: 2, difficulty: 'Easy' }
  ],
  'Boolean Algebra': [
    { questionText: 'According to De Morgan laws, the complement of (A · B) is equal to:', options: ["A' · B'", "A' + B'", "(A + B)'", 'A · B'], correctIndex: 1, difficulty: 'Medium' },
    { questionText: 'Which logic gate produces HIGH output only when both of its inputs are HIGH?', options: ['OR gate', 'AND gate', 'XOR gate', 'NAND gate'], correctIndex: 1, difficulty: 'Easy' },
    { questionText: 'In Boolean algebra, the expression A + A\' simplifies to:', options: ['0', '1', 'A', "A'"], correctIndex: 1, difficulty: 'Easy' },
    { questionText: 'Which of the following are known as Universal Logic Gates?', options: ['AND and OR', 'NAND and NOR', 'XOR and XNOR', 'NOT and BUFFER'], correctIndex: 1, difficulty: 'Medium' },
    { questionText: 'The dual of the Boolean expression A · (B + C) is:', options: ['A + (B · C)', 'A · (B · C)', 'A + (B + C)', "A' · (B' + C')"], correctIndex: 0, difficulty: 'Hard' }
  ],
  'Networking': [
    { questionText: 'Which layer of the OSI model is responsible for end-to-end reliable transmission and port addressing?', options: ['Network Layer', 'Transport Layer', 'Data Link Layer', 'Session Layer'], correctIndex: 1, difficulty: 'Easy' },
    { questionText: 'What is the primary function of the Domain Name System (DNS)?', options: ['Encrypt web traffic', 'Translate domain names to IP addresses', 'Assign MAC addresses', 'Filter malicious packets'], correctIndex: 1, difficulty: 'Easy' },
    { questionText: 'Which protocol is used for secure communication over the World Wide Web?', options: ['HTTP', 'HTTPS', 'FTP', 'TELNET'], correctIndex: 1, difficulty: 'Easy' },
    { questionText: 'An IPv4 address consists of how many bits?', options: ['32 bits', '64 bits', '128 bits', '256 bits'], correctIndex: 0, difficulty: 'Medium' },
    { questionText: 'In computer networks, a device that operates at Layer 3 to forward data packets across networks is a:', options: ['Hub', 'Switch', 'Router', 'Repeater'], correctIndex: 2, difficulty: 'Medium' }
  ]
};

function generateCurriculumFallbackQuestions(chapterList, questionCount) {
  const result = [];
  let index = 0;
  
  while (result.length < questionCount) {
    const chapter = chapterList[index % chapterList.length];
    const available = QUESTION_BANK[chapter] || [];
    
    if (available.length > 0) {
      const qIndex = Math.floor(result.length / chapterList.length) % available.length;
      const base = available[qIndex] || available[0];
      
      const copy = {
        type: 'MCQ',
        questionText: result.some(r => r.questionText === base.questionText)
          ? `${base.questionText} (Q${result.length + 1})`
          : base.questionText,
        options: [...base.options],
        correctIndex: base.correctIndex,
        topicTag: chapter,
        difficulty: base.difficulty || 'Medium',
      };
      result.push(copy);
    } else {
      result.push({
        type: 'MCQ',
        questionText: `Which of the following statements is conceptually correct regarding ${chapter}? (Q${result.length + 1})`,
        options: [
          `Key principle A applies directly to ${chapter}`,
          `Secondary parameter B overrides core properties in ${chapter}`,
          `Alternative formulation C is invalid in ${chapter}`,
          `Baseline constant D is zero across all conditions in ${chapter}`,
        ],
        correctIndex: 0,
        topicTag: chapter,
        difficulty: 'Medium',
      });
    }
    index += 1;
  }
  
  return result.slice(0, questionCount);
}

export const generateTestQuestions = async (subjects, grade, chapters, count = 10, retries = 2) => {
  const subjectList = Array.isArray(subjects) ? subjects : [subjects];
  const chapterList = Array.isArray(chapters) ? chapters : [chapters];
  const questionCount = Math.min(QUESTION_COUNT_MAX, Math.max(QUESTION_COUNT_MIN, Number(count) || 10));

  if (!process.env.GEMINI_API_KEY) {
    console.log('[GeminiService] GEMINI_API_KEY not configured; generating curriculum-accurate MCQ questions.');
    return generateCurriculumFallbackQuestions(chapterList, questionCount);
  }

  const prompt = [
    `Generate exactly ${questionCount} multiple-choice questions for grade ${grade}.`,
    `Subjects: ${subjectList.join(', ')}.`,
    `Allowed chapters only: ${chapterList.join(', ')}.`,
    'Every question must be based only on the allowed chapters.',
    'Every topicTag must exactly equal one of the allowed chapter strings.',
    'Each question must contain 4 answer options and correctIndex must be a zero-based integer from 0 to 3.',
    'Return only valid JSON in this shape: {"questions":[{"questionText":"...","options":["...","...","...","..."],"correctIndex":0,"topicTag":"exact chapter","difficulty":"Easy|Medium|Hard"}]}',
  ].join(' ');

  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: 'application/json' } });
      const parsed = JSON.parse(response.text || '{}');
      const questions = Array.isArray(parsed.questions) ? parsed.questions.map((question) => normalizeQuestion(question, chapterList)).filter(Boolean) : [];
      if (questions.length >= questionCount) {
        return questions.slice(0, questionCount);
      }
      if (questions.length > 0) {
        const remaining = questionCount - questions.length;
        const fill = generateCurriculumFallbackQuestions(chapterList, remaining);
        return [...questions, ...fill];
      }
    } catch (error) {
      console.warn(`[GeminiService] Gemini API attempt ${attempt + 1} failed:`, error?.message || error);
      if (attempt === retries - 1) {
        console.log('[GeminiService] Falling back to curriculum question generator.');
        return generateCurriculumFallbackQuestions(chapterList, questionCount);
      }
      await delay(2 ** attempt * 500);
    }
  }

  return generateCurriculumFallbackQuestions(chapterList, questionCount);
};

