import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Send, WandSparkles } from 'lucide-react';
import { Link } from 'wouter';
import PageHeader from '../components/common/PageHeader.jsx';
import QuizForm from '../components/quizzes/QuizForm.jsx';
import QuizGenerationLoader from '../components/quizzes/QuizGenerationLoader.jsx';
import QuestionPreview from '../components/quizzes/QuestionPreview.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { quizService } from '../services/quizService.jsx';

export default function CreateQuizPage() {
  const [state, setState] = useState({ loading: false, publishing: false, error: '', notice: '', quiz: null });
  const generate = async (payload) => {
    setState({ loading: true, publishing: false, error: '', notice: '', quiz: null });
    try { const data = await quizService.generateQuiz(payload); setState({ loading: false, publishing: false, error: '', notice: '', quiz: data?.quiz || data }); }
    catch (error) { setState({ loading: false, publishing: false, error: error?.message || 'Unable to generate a quiz.', notice: '', quiz: null }); }
  };
  const publish = async () => {
    const id = state.quiz?._id || state.quiz?.id;
    if (!id) return;
    setState((current) => ({ ...current, publishing: true, error: '', notice: '' }));
    try { const data = await quizService.publishQuiz(id); setState((current) => ({ ...current, publishing: false, notice: 'Quiz published. Connected students can now receive it.', quiz: data?.quiz || { ...current.quiz, published: true, publishedAt: new Date().toISOString() } })); }
    catch (error) { setState((current) => ({ ...current, publishing: false, error: error?.message || 'Unable to publish this quiz.' })); }
  };
  const questions = state.quiz?.questions || state.quiz?.items;
  const quizId = state.quiz?._id || state.quiz?.id;
  return <div className="page-stack"><PageHeader eyebrow="Create quiz" title="Turn the next lesson into a better question." description="Describe the learning context. Your backend will handle the AI generation workflow." action={<span className="page-icon"><WandSparkles size={20} /></span>} /><div className="quiz-layout"><QuizForm onSubmit={generate} disabled={state.loading || state.publishing} /><div className="quiz-preview panel">{state.loading ? <QuizGenerationLoader /> : state.error && !state.quiz ? <ErrorState message={state.error} onRetry={() => setState((current) => ({ ...current, error: '' }))} /> : state.quiz ? <><div className="panel-heading"><div><span className="eyebrow">Generated preview</span><h2>{state.quiz.published ? 'Published quiz' : 'Review before you publish'}</h2></div><CheckCircle2 className="success-icon" size={20} /></div><QuestionPreview questions={questions} />{!questions?.length && <p className="muted-note">The backend returned no question items to preview yet.</p>}<div className="preview-actions">{state.error && <p className="inline-notice error">{state.error}</p>}{state.notice && <p className="inline-notice success">{state.notice}</p>}<button className="button primary" onClick={publish} disabled={!quizId || state.publishing || state.quiz.published}>{state.publishing ? 'Publishing...' : state.quiz.published ? 'Published for connected students' : <><Send size={15} /> Publish quiz</>}</button><Link href="/dashboard/create-quiz" className="button secondary"><ArrowLeft size={15} /> Start another quiz</Link></div></> : <div className="preview-empty"><span className="preview-number">02</span><h2>Your quiz draft will appear here.</h2><p>Complete the brief on the left to generate a preview from real backend data.</p></div>}</div></div></div>;
}
