import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  Minimize2,
  Trash2,
  Cpu
} from 'lucide-react';
import { api } from '../services/api';

export default function CopilotDrawer({ 
  isOpen, 
  onClose, 
  workflow, 
  simulationSuite, 
  queryToInject, 
  clearInjectedQuery,
  activeConversationId,
  setActiveConversationId
}) {
  const defaultWelcomeMessage = {
    id: 'welcome-msg',
    sender: 'assistant',
    text: `### **Hello! I'm PLANB Copilot**\n\nI audit your decision workflows, uncover cascading failures, and test contingency strategies.\n\nCurrently, you are inspecting the **College Fest Registration** pipeline. Ask me anything about dependencies, conditional failure calculations, or how to eliminate bottlenecks before your event begins!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState([defaultWelcomeMessage]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeEngineMode, setActiveEngineMode] = useState('decision-engine');
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    "What happens if the internet fails?",
    "Why is this component high risk?",
    "Which scenario remains unresolved?",
    "What should we improve first?",
    "Explain the results in simple English.",
    "Compare two contingency options.",
    "Which components depend on this service?"
  ];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load restored conversation if activeConversationId is provided
  useEffect(() => {
    if (activeConversationId) {
      let isSubscribed = true;
      async function restoreConversation() {
        setIsLoading(true);
        try {
          const conv = await api.getConversation(activeConversationId);
          if (isSubscribed && conv && conv.messages && conv.messages.length > 0) {
            const restored = conv.messages.map(m => ({
              id: m.id,
              sender: m.sender,
              text: m.message,
              timestamp: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Restored'
            }));
            setMessages(restored);
          }
        } catch (err) {
          console.warn('Failed to restore conversation:', err);
        } finally {
          if (isSubscribed) setIsLoading(false);
        }
      }
      restoreConversation();
      return () => { isSubscribed = false; };
    }
  }, [activeConversationId]);

  // Handle injected query from other views (e.g. node inspector or quick action)
  useEffect(() => {
    if (queryToInject) {
      handleSendMessage(queryToInject);
      clearInjectedQuery();
    }
  }, [queryToInject]);

  const handleSendMessage = async (userText) => {
    const textToSend = userText || inputMessage.trim();
    if (!textToSend || isLoading) return;

    const userMsgObj = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsgObj]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await api.askCopilot({
        message: textToSend,
        workflowState: workflow,
        simulationContext: simulationSuite,
        conversationId: activeConversationId
      });

      if (response.conversationId && !activeConversationId && setActiveConversationId) {
        setActiveConversationId(response.conversationId);
      }

      setActiveEngineMode(response.mode || 'decision-engine');

      const botMsgObj = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        mode: response.mode,
        notice: response.notice,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsgObj]);
    } catch (err) {
      setMessages(prev => [
        ...prev, 
        {
          id: `bot-err-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ Error communicating with Copilot backend: ${err.message}. Please verify the backend server is active on port 5000.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format simple markdown lines into styled elements
  const renderFormattedMarkdown = (text) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-sm font-bold text-white mt-2 mb-1">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="text-base font-bold text-indigo-300 mt-2 mb-1">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('- ')) {
        return (
          <li key={idx} className="ml-3 list-disc text-xs text-slate-300 my-0.5 leading-relaxed">
            {line.replace('- ', '')}
          </li>
        );
      }
      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
        return (
          <li key={idx} className="ml-3 list-decimal text-xs text-slate-300 my-0.5 leading-relaxed">
            {line.replace(/^\d+\.\s/, '')}
          </li>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-1.5" />;
      }
      return <p key={idx} className="text-xs text-slate-300 leading-relaxed">{line}</p>;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-navy-900/95 backdrop-blur-2xl border-l border-navy-700 shadow-2xl flex flex-col transition-all">
      {/* Header */}
      <div className="p-4 border-b border-navy-700 flex items-center justify-between bg-navy-950/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">PLANB Copilot</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                Decision Intelligence
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Contextual Explainer & Risk Advisor</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setMessages([defaultWelcomeMessage]);
              if (setActiveConversationId) setActiveConversationId(null);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-navy-800 transition-colors"
            title="Clear Chat / New Investigation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
            title="Close Copilot"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Prompts Carousel / Pills */}
      <div className="p-3 bg-navy-950/40 border-b border-navy-800/80 overflow-x-auto whitespace-nowrap scrollbar-thin space-x-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 inline-block">
          Quick Prompts:
        </span>
        {quickQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(q)}
            className="inline-block text-[11px] px-2.5 py-1 rounded-full bg-navy-800 hover:bg-indigo-900/40 text-slate-300 hover:text-indigo-200 border border-navy-700 hover:border-indigo-500/40 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div 
              key={msg.id} 
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                <span>{isUser ? 'You' : 'PLANB Copilot'}</span>
                {!isUser && msg.mode && (
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${
                    msg.mode === 'gemini-live'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}>
                    {msg.mode === 'gemini-live' ? '✦ Gemini 2.5 Live' : 'Deterministic Fallback'}
                  </span>
                )}
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>
              <div 
                className={`p-3.5 rounded-2xl max-w-[90%] text-xs shadow-md ${
                  isUser 
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-xs' 
                    : 'bg-navy-800/90 border border-navy-700/80 text-slate-200 rounded-bl-xs'
                }`}
              >
                {isUser ? (
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <div className="space-y-1">
                    {renderFormattedMarkdown(msg.text)}
                    {msg.notice && (
                      <div className="mt-3 pt-2 border-t border-navy-700 text-[10px] text-indigo-300/80 italic">
                        {msg.notice}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-navy-800/60 border border-indigo-500/20 max-w-[80%] animate-pulse">
            <Cpu className="w-4 h-4 text-indigo-400 animate-spin" />
            <span className="text-xs text-indigo-300 font-medium">Auditing simulation state & cascading dependencies...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-navy-700 bg-navy-950/70">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            id="copilot-input-box"
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask Copilot about risk, contingencies, or fallbacks..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-700 focus:border-indigo-500 focus:outline-none text-xs text-slate-100 placeholder-slate-400 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white transition-all shadow-md shadow-indigo-600/30"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span>Distinguishes mathematical facts from AI suggestions</span>
          <span className="font-mono text-indigo-400">Gemini 1.5/2.5 Ready</span>
        </div>
      </div>
    </div>
  );
}
