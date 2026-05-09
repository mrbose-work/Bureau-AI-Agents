"use client";

import { useState, useRef, useEffect, useCallback } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  agent?: 'Benjamin' | 'Bella';
};

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState<'Benjamin' | 'Bella' | 'System'>('System');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Web Speech API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const handleSend = useCallback(async (text: string = input) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history })
      });
      
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      
      setActiveAgent(data.agent);
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response,
        agent: data.agent
      }]);
      
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please check your API keys." }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, messages]);

  // Separate speak function to avoid dependency loop
  const speakResponse = useCallback((text: string, agent: string) => {
    if (!('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    
    let voice;
    if (agent === 'Benjamin') {
      voice = voices.find(v => v.name.includes('Google US English') || v.name.includes('David') || v.name.includes('Male'));
    } else if (agent === 'Bella') {
      voice = voices.find(v => v.name.includes('Google UK English Female') || v.name.includes('Zira') || v.name.includes('Female'));
    }
    
    if (voice) {
      utterance.voice = voice;
    }
    
    if (agent === 'Benjamin') {
      utterance.pitch = 0.9;
      utterance.rate = 1.0;
    } else if (agent === 'Bella') {
      utterance.pitch = 1.1;
      utterance.rate = 0.95;
    }

    window.speechSynthesis.speak(utterance);
  }, [voices]);

  // Hook to speak when messages change
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.agent) {
      speakResponse(lastMessage.content, lastMessage.agent);
    }
  }, [messages, speakResponse]);

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
    }

    // Load voices
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [handleSend]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    if (activeAgent === 'Benjamin') {
      document.documentElement.style.setProperty('--agent-color-current', 'var(--benjamin-color)');
    } else if (activeAgent === 'Bella') {
      document.documentElement.style.setProperty('--agent-color-current', 'var(--bella-color)');
    } else {
      document.documentElement.style.setProperty('--agent-color-current', 'var(--text-color)');
    }
  }, [messages, activeAgent]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setInput('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <main style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '24px'
    }}>
      
      <header style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 700, 
          letterSpacing: '-1px',
          color: activeAgent === 'System' ? 'var(--text-color)' : `var(--${activeAgent.toLowerCase()}-color)`,
          transition: 'color 0.5s ease'
        }}>
          Bureau OS
        </h1>
        <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>
          {activeAgent === 'System' ? 'Awaiting Input...' : `Currently Active: ${activeAgent}`}
        </p>
      </header>

      <div className="glass-panel" style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {messages.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center', opacity: 0.5 }}>
            <p>Welcome to the Bureau.</p>
            <p style={{ fontSize: '0.8rem', marginTop: '8px' }}>Speak or type to begin.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: msg.role === 'user' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.4)',
              borderLeft: msg.role === 'assistant' ? `4px solid var(--${msg.agent?.toLowerCase()}-color)` : 'none',
              borderRight: msg.role === 'user' ? `4px solid rgba(255,255,255,0.3)` : 'none',
            }}>
              {msg.role === 'assistant' && (
                <div style={{ 
                  fontSize: '0.75rem', 
                  opacity: 0.6, 
                  marginBottom: '4px',
                  color: `var(--${msg.agent?.toLowerCase()}-color)`,
                  fontWeight: 600
                }}>
                  {msg.agent}
                </div>
              )}
              <div style={{ lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div style={{ alignSelf: 'flex-start', opacity: 0.5 }}>
            Thinking...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button 
          onClick={toggleListening}
          className="btn"
          style={{ 
            padding: '12px', 
            borderRadius: '50%', 
            width: '48px', 
            height: '48px',
            borderColor: isListening ? '#ff3366' : ''
          }}
          title="Voice Input"
        >
          {isListening ? (
            <div className="listening-indicator" />
          ) : (
            <span style={{ fontSize: '1.2rem' }}>🎤</span>
          )}
        </button>
        
        <input 
          type="text"
          className="glass-input"
          style={{ flex: 1 }}
          placeholder="Type your request here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
        />
        
        <button 
          className="btn btn-primary"
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
        >
          Send ↗
        </button>
      </div>

    </main>
  );
}
