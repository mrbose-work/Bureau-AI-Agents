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
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const handleSend = useCallback(async (text: string = input) => {
    if (!text.trim()) return;

    // Immediately stop any currently playing voice
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

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

    // Stop previous speaking
    window.speechSynthesis.cancel();

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

  // Hook to speak when messages change (only if voice is enabled)
  useEffect(() => {
    if (!voiceEnabled) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.agent) {
      speakResponse(lastMessage.content, lastMessage.agent);
    }
  }, [messages, speakResponse, voiceEnabled]);

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
      height: '100dvh', // iOS dynamic viewport fix
      maxWidth: '850px',
      margin: '0 auto',
      padding: '16px 20px',
      position: 'relative'
    }}>
      
      <header style={{ 
        textAlign: 'center', 
        padding: '10px 0 16px 0', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        marginBottom: '16px'
      }}>
        <h1 style={{ 
          fontSize: '2.2rem', 
          fontWeight: 700, 
          letterSpacing: '-1px',
          color: activeAgent === 'System' ? 'var(--text-color)' : `var(--${activeAgent.toLowerCase()}-color)`,
          transition: 'color 0.5s ease'
        }}>
          Bureau OS
        </h1>
        <p style={{ opacity: 0.6, fontSize: '0.85rem', marginTop: '4px' }}>
          {activeAgent === 'System' ? 'Awaiting Input...' : `Currently Active: ${activeAgent}`}
        </p>
      </header>

      {/* Chat Messages Panel */}
      <div className="glass-panel" style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '16px',
        borderRadius: '16px'
      }}>
        {messages.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center', opacity: 0.6, padding: '20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💼</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>Welcome to Bureau OS</h3>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.5', maxWidth: '320px', margin: '0 auto' }}>
              I am your business partner. Type or use voice controls below to manage tasks, schedule meetings, or query Notion.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div 
              key={idx} 
              className="message-bubble"
              style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: msg.role === 'user' ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.45)',
                borderLeft: msg.role === 'assistant' ? `4px solid var(--${msg.agent?.toLowerCase()}-color)` : 'none',
                borderRight: msg.role === 'user' ? `4px solid rgba(255, 255, 255, 0.2)` : 'none',
              }}
            >
              {msg.role === 'assistant' && (
                <div style={{ 
                  fontSize: '0.75rem', 
                  opacity: 0.8, 
                  marginBottom: '6px',
                  color: `var(--${msg.agent?.toLowerCase()}-color)`,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {msg.agent}
                </div>
              )}
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div style={{ 
            alignSelf: 'flex-start', 
            opacity: 0.5, 
            padding: '12px 16px',
            fontSize: '0.9rem',
            fontStyle: 'italic'
          }}>
            Thinking...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input controls container */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '10px', 
        paddingBottom: '10px'
      }}>
        {/* Main Text Input Field */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          style={{ display: 'flex', gap: '10px', width: '100%', alignItems: 'center' }}
        >
          <input 
            type="text"
            className="glass-input"
            style={{ flex: 1 }}
            placeholder={isListening ? "Listening to voice input..." : "Type your request here..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
            disabled={isLoading}
          />
          
          <button 
            type="submit"
            className="btn btn-primary"
            disabled={!input.trim() || isLoading}
            style={{ 
              height: '48px', 
              padding: '0 24px', 
              fontSize: '0.95rem',
              whiteSpace: 'nowrap'
            }}
          >
            Send ↗
          </button>
        </form>
        
        {/* Secondary Voice Controls */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <button 
            type="button"
            onClick={() => {
              setVoiceEnabled(v => !v);
              if (voiceEnabled) window.speechSynthesis.cancel();
            }}
            className="btn"
            style={{ 
              padding: '8px 16px', 
              borderRadius: '20px',
              fontSize: '0.8rem',
              borderColor: voiceEnabled ? 'var(--agent-color-current)' : 'rgba(255,255,255,0.06)',
              backgroundColor: voiceEnabled ? 'rgba(255,255,255,0.03)' : 'transparent',
              opacity: voiceEnabled ? 1 : 0.6
            }}
            title={voiceEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
          >
            <span style={{ fontSize: '1rem' }}>{voiceEnabled ? '🔊 Voice Response On' : '🔇 Voice Response Off'}</span>
          </button>

          <button 
            type="button"
            onClick={toggleListening}
            className="btn"
            style={{ 
              padding: '8px 16px', 
              borderRadius: '20px',
              fontSize: '0.8rem',
              borderColor: isListening ? '#ff3366' : 'rgba(255,255,255,0.06)',
              backgroundColor: isListening ? 'rgba(255, 51, 102, 0.08)' : 'transparent'
            }}
            title="Toggle Voice Input"
          >
            {isListening ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div className="listening-indicator" />
                <span>Listening... Click to Stop</span>
              </div>
            ) : (
              <span>🎤 Press to Speak</span>
            )}
          </button>
        </div>
      </div>

    </main>
  );
}
