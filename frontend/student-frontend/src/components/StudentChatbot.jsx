import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Bot,
  User,
  Copy,
  Check,
  ChevronDown,
  BookOpen,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { studentApi, getStudentUser } from '../services/api';

const QUICK_PROMPTS = [
  { label: "📐 Ohm's Law Formula", prompt: "Explain Ohm's Law with formula, SI units, and a simple practical example." },
  { label: "💡 Optics: Convex vs Concave", prompt: "Explain the key differences between concave and convex mirrors with ray diagram rules." },
  { label: "🌿 Life Processes Revision", prompt: "Give me a quick high-yield summary of Life Processes for Class 10 exam revision." },
  { label: "⚡ Series vs Parallel Circuits", prompt: "How do voltage and current behave in Series vs Parallel circuits? Give formulas." },
  { label: "📝 Exam Strategy Tips", prompt: "Give me 3 proven tips to score high in science and math MCQs and numericals." },
];

export default function StudentChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "👋 Hi there! I'm **EduAI Study Assistant**, powered by Gemini AI. Ask me to explain any science or math topic, solve doubts, or provide formulas!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const student = getStudentUser();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessageId = `user_${Date.now()}`;
    const userMsg = {
      id: userMessageId,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Format history for backend
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text,
        }));

      const res = await studentApi.chatWithAssistant(
        query,
        history,
        'Science & Mathematics',
        student?.grade || '10th'
      );

      const replyText = res?.reply || "I'm having trouble retrieving an answer right now. Please try again.";

      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          sender: 'ai',
          text: `⚠️ **Could not connect to AI Tutor:** ${err.message || 'Please check your connection and try again.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: "👋 Chat reset! What topic or formula would you like to explore now?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Math sanitizer & equation formatter (converts LaTeX and $a$ symbols into clean unicode & readable math)
  const cleanAndFormatMath = (text) => {
    if (!text) return '';
    return text
      // Replace block math $$...$$ or \[...\]
      .replace(/\$\$([\s\S]*?)\$\$/g, (_, eq) => cleanAndFormatMath(eq.trim()))
      .replace(/\\\[([\s\S]*?)\\\]/g, (_, eq) => cleanAndFormatMath(eq.trim()))
      .replace(/\\\(([\s\S]*?)\\\)/g, (_, eq) => cleanAndFormatMath(eq.trim()))
      // Clean text tags
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/\\mathrm\{([^}]+)\}/g, '$1')
      .replace(/\\mathbf\{([^}]+)\}/g, '$1')
      // Chemistry arrows & reactions
      .replace(/\\xrightarrow(?:\[([^\]]*)\])?\{([^}]*)\}/g, (_, below, above) =>
        above ? ` ──(${above})──> ` : ' ──> '
      )
      .replace(/\\rightarrow|\\to/g, ' → ')
      .replace(/\\leftarrow/g, ' ← ')
      .replace(/\\leftrightarrow/g, ' ↔ ')
      // Common LaTeX operators
      .replace(/\\times/g, ' × ')
      .replace(/\\cdot/g, ' · ')
      .replace(/\\div/g, ' ÷ ')
      .replace(/\\pm/g, ' ± ')
      .replace(/\\approx/g, ' ≈ ')
      .replace(/\\neq/g, ' ≠ ')
      .replace(/\\le(?:q)?/g, ' ≤ ')
      .replace(/\\ge(?:q)?/g, ' ≥ ')
      .replace(/\\theta/g, 'θ')
      .replace(/\\pi/g, 'π')
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\gamma/g, 'γ')
      .replace(/\\delta/g, 'δ')
      .replace(/\\lambda/g, 'λ')
      .replace(/\\omega/g, 'ω')
      .replace(/\\mu/g, 'μ')
      .replace(/\\degree|\^\\circ/g, '°')
      .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
      // Superscripts with caret
      .replace(/\^\{?(-?\d+|[a-zA-Z+-]+)\}?/g, (_, p) => {
        const map = {
          '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
          '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', 'n': 'ⁿ', 'x': 'ˣ', '-1': '⁻¹', '-2': '⁻²', '-3': '⁻³',
        };
        return map[p] || p.split('').map((c) => map[c] || c).join('');
      })
      // Subscripts with underscore
      .replace(/_\{?(\d+|[a-zA-Z+-]+)\}?/g, (_, s) => {
        const map = {
          '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
          '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎', 'a': 'ₐ', 'e': 'ₑ', 'o': 'ₒ', 'x': 'ₓ', 'n': 'ₙ', '12': '₁₂',
        };
        return map[s] || s.split('').map((c) => map[c] || c).join('');
      })
      // Clean all remaining inline dollar signs like $a$, $b$, $a^2$
      .replace(/\$([^\$]+)\$/g, '$1')
      .replace(/\$/g, '');
  };

  // Simple Markdown formatter helper for bold, bullet points, headers, and math
  const formatMarkdown = (content) => {
    if (!content) return '';
    const cleanedContent = cleanAndFormatMath(content);
    const lines = cleanedContent.split('\n');

    return lines.map((line, idx) => {
      let formatted = line;

      // Horizontal rules
      if (formatted.trim() === '---' || formatted.trim() === '***') {
        return (
          <hr
            key={idx}
            style={{
              margin: '0.6rem 0',
              border: 'none',
              borderTop: '1px solid rgba(21, 39, 53, 0.1)',
            }}
          />
        );
      }

      // Heading 3 ###
      if (formatted.startsWith('### ')) {
        return (
          <h4 key={idx} style={{ margin: '0.5rem 0 0.25rem', fontWeight: 800, color: 'var(--ink)' }}>
            {formatted.replace('### ', '')}
          </h4>
        );
      }

      // Heading 2 ##
      if (formatted.startsWith('## ')) {
        return (
          <h3 key={idx} style={{ margin: '0.6rem 0 0.25rem', fontWeight: 800, color: 'var(--teal)' }}>
            {formatted.replace('## ', '')}
          </h3>
        );
      }

      // Heading 1 #
      if (formatted.startsWith('# ')) {
        return (
          <h2 key={idx} style={{ margin: '0.7rem 0 0.3rem', fontWeight: 800, color: 'var(--ink)' }}>
            {formatted.replace('# ', '')}
          </h2>
        );
      }

      // Bullet list
      const isBullet = formatted.startsWith('- ') || formatted.startsWith('* ') || formatted.startsWith('• ');
      if (isBullet) {
        formatted = formatted.replace(/^[-*•]\s+/, '');
      }

      // Numbered list (e.g. 1. , 2. )
      const numMatch = formatted.match(/^(\d+)\.\s+(.*)/);
      const isNumbered = Boolean(numMatch);
      let numPrefix = '';
      if (isNumbered) {
        numPrefix = numMatch[1];
        formatted = numMatch[2];
      }

      // Parse **bold** and *italic* and `code`
      const parts = formatted.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={pIdx}>{part.slice(1, -1)}</em>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={pIdx}
              style={{
                background: '#f1f5f9',
                padding: '0.1rem 0.3rem',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '0.85em',
                color: 'var(--teal)',
              }}
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={idx} style={{ display: 'flex', gap: '0.45rem', margin: '0.2rem 0', paddingLeft: '0.2rem' }}>
            <span style={{ color: 'var(--teal)', fontWeight: 800 }}>•</span>
            <span style={{ flex: 1 }}>{renderedParts}</span>
          </div>
        );
      }

      if (isNumbered) {
        return (
          <div key={idx} style={{ display: 'flex', gap: '0.45rem', margin: '0.2rem 0', paddingLeft: '0.2rem' }}>
            <span style={{ color: 'var(--teal)', fontWeight: 700, minWidth: '16px' }}>{numPrefix}.</span>
            <span style={{ flex: 1 }}>{renderedParts}</span>
          </div>
        );
      }

      return line.trim() ? (
        <p key={idx} style={{ margin: '0.3rem 0', lineHeight: 1.55 }}>
          {renderedParts}
        </p>
      ) : (
        <div key={idx} style={{ height: '0.35rem' }} />
      );
    });
  };

  return (
    <div className="student-chatbot-container" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chatbot-launcher"
          aria-label="Open EduAI Study Assistant"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            padding: '0.75rem 1.15rem',
            background: 'var(--teal, #0e8f86)',
            color: '#fff',
            border: 'none',
            borderRadius: '9999px',
            boxShadow: '0 8px 24px rgba(14, 143, 134, 0.35)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.86rem',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(14, 143, 134, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(14, 143, 134, 0.35)';
          }}
        >
          <Sparkles size={18} color="#fff" />
          <span>Ask EduAI</span>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#48bb78',
              boxShadow: '0 0 0 2px rgba(255,255,255,0.4)',
            }}
          />
        </button>
      )}

      {/* Expanded Chat Dialog */}
      {isOpen && (
        <div
          className="chatbot-window"
          style={{
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '560px',
            maxHeight: 'calc(100vh - 48px)',
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 20px 45px rgba(21, 39, 53, 0.22), 0 0 0 1px rgba(21, 39, 53, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeInUp 0.2s ease forwards',
          }}
        >
          {/* Header */}
          <div
            className="chatbot-header"
            style={{
              padding: '0.9rem 1.1rem',
              background: 'var(--ink, #152735)',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'var(--teal, #0e8f86)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Sparkles size={18} color="#fff" />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>
                  EduAI Study Assistant
                </strong>
                <span style={{ fontSize: '0.68rem', color: '#a0aec0', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#48bb78' }} />
                  Gemini-Powered Doubt Solver
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <button
                onClick={handleReset}
                title="Reset chat"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                }}
              >
                <RotateCcw size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                }}
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Quick Prompts Banner */}
          <div
            className="chatbot-quick-chips"
            style={{
              padding: '0.5rem 0.8rem',
              background: '#f8faf9',
              borderBottom: '1px solid #edf2f0',
              display: 'flex',
              gap: '0.4rem',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              scrollbarWidth: 'none',
            }}
          >
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp.prompt)}
                disabled={loading}
                style={{
                  padding: '0.25rem 0.55rem',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  background: '#ffffff',
                  color: 'var(--ink)',
                  border: '1px solid #d1ded9',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#e6f4f1')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div
            className="chatbot-messages"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.9rem',
              background: '#faf9f6',
            }}
          >
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                    gap: '0.5rem',
                    alignItems: 'flex-start',
                  }}
                >
                  {!isUser && (
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'var(--teal, #0e8f86)',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#fff',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      <Bot size={13} />
                    </div>
                  )}

                  <div style={{ maxWidth: '82%' }}>
                    <div
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        background: isUser ? 'var(--teal, #0e8f86)' : '#ffffff',
                        color: isUser ? '#ffffff' : 'var(--ink, #152735)',
                        boxShadow: isUser ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
                        border: isUser ? 'none' : '1px solid #e2e8f0',
                        fontSize: '0.78rem',
                        lineHeight: 1.5,
                        wordBreak: 'break-word',
                      }}
                    >
                      {isUser ? m.text : formatMarkdown(m.text)}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        marginTop: '0.2rem',
                        padding: '0 0.2rem',
                        justifyContent: isUser ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>{m.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(m.id, m.text)}
                          title="Copy explanation"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0',
                            color: '#94a3b8',
                          }}
                        >
                          {copiedId === m.id ? <Check size={11} color="var(--teal)" /> : <Copy size={11} />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'var(--teal)',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#fff',
                  }}
                >
                  <Bot size={13} />
                </div>
                <div
                  style={{
                    padding: '0.55rem 0.85rem',
                    borderRadius: '14px 14px 14px 2px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      background: 'var(--teal)',
                      borderRadius: '50%',
                      animation: 'bounce 0.8s infinite',
                    }}
                  />
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      background: 'var(--teal)',
                      borderRadius: '50%',
                      animation: 'bounce 0.8s infinite 0.2s',
                    }}
                  />
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      background: 'var(--teal)',
                      borderRadius: '50%',
                      animation: 'bounce 0.8s infinite 0.4s',
                    }}
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div
            className="chatbot-input-wrap"
            style={{
              padding: '0.75rem 0.9rem',
              background: '#ffffff',
              borderTop: '1px solid var(--line, #edf2f0)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#f8faf9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0.35rem 0.6rem',
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask EduAI a doubt or formula..."
                disabled={loading}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.8rem',
                  color: 'var(--ink)',
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                aria-label="Send query"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: input.trim() && !loading ? 'var(--teal)' : '#cbd5e1',
                  color: '#fff',
                  border: 'none',
                  cursor: input.trim() && !loading ? 'pointer' : 'default',
                  display: 'grid',
                  placeItems: 'center',
                  transition: 'background 0.2s ease',
                }}
              >
                <Send size={13} />
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.62rem', color: '#94a3b8' }}>
              <span>Press Enter to send</span>
              <span>EduMap AI Tutor</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
