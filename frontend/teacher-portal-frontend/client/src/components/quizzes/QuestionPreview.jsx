import { displayValue } from '../../utils/safeData.jsx';

export default function QuestionPreview({ questions }) {
  if (!questions?.length) return null;
  return <div className="question-list">{questions.map((question, index) => {
    const questionText = question?.questionText || question?.question || question?.text;
    const options = Array.isArray(question?.options) ? question.options : [];
    return <article className="question-card" key={question?._id || question?.id || index}>
      <span className="question-number">{String(index + 1).padStart(2, '0')}</span>
      <div>
        <span className="eyebrow">Multiple choice question</span>
        <h3>{displayValue(questionText, 'Question text unavailable')}</h3>
        {options.length > 0 && <ol className="mcq-options" type="A">{options.map((option, optionIndex) => <li key={`${question?._id || index}-${optionIndex}`}>{displayValue(option, 'Option unavailable')}</li>)}</ol>}
      </div>
    </article>;
  })}</div>;
}
