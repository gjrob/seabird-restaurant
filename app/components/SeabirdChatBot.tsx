'use client';
import { useState, useRef, useEffect } from 'react';

interface Message { role: 'user' | 'assistant'; content: string; }

export default function SeabirdChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: 'Welcome to Seabird 🦪 I\'m Pearl, your guide to the coast. Ask me about tonight\'s catch, the pantry, reservations, or anything else!'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const updated = [...messages, { role: 'user' as const, content: text }];
    setMessages(updated);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated }),
      });
      if (!res.ok) throw new Error();
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let botText = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      setLoading(false);
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          botText += decoder.decode(value, { stream: true });
          setMessages(prev => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: 'assistant', content: botText };
            return copy;
          });
        }
      }
    } catch {
      setLoading(false);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Having trouble connecting. Please call (910) 769-5996 for reservations.' }]);
    }
  };

  return (
    <>
      <button className={`chatbot-bubble ${open ? 'open' : ''}`} onClick={() => setOpen(!open)} aria-label={open ? 'Close chat' : 'Open chat'}>
        {open ? '✕' : '🦪'}
      </button>
      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <div className="chatbot-avatar">🌊</div>
            <div className="chatbot-header-text">
              <h4>Pearl — Seabird Host</h4>
              <span><span className="chatbot-online" />Online now</span>
            </div>
          </div>
          <div className="chatbot-messages" ref={messagesRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.role === 'user' ? 'user' : 'bot'}`}>{msg.content}</div>
            ))}
            {loading && <div className="chat-typing"><span /><span /><span /></div>}
          </div>
          <div className="chatbot-input">
            <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }}} placeholder="Ask about the menu, tonight's catch..." autoFocus />
            <button onClick={send} disabled={loading} aria-label="Send">➤</button>
          </div>
        </div>
      )}
    </>
  );
}
