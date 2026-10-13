import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  HelpCircle, 
  Cpu, 
  RotateCw, 
  CheckCircle2, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function CopilotView({
  workflow,
  simulationSuite,
  onTriggerRetest
}) {
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'assistant',
      text: `### **PLANB Copilot Decision Lead Interface**\n\nI am connected to the live deterministic simulation state of **${workflow.name}**.\n\n- Current Tested Coverage: **${simulationSuite.handledPercentage}%** handled (${simulationSuite.scenariosHandledSuccessfully}/${simulationSuite.totalScenariosTested} combinations).\n- Plan Health: **${simulationSuite.planHealth}**.\n\nAsk any question regarding failure cascades, probability calculations, or contingency tradeoffs.`,
      timestamp: 'Ready'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sampleQuestions = [
    "Why is OTP verification high risk?",
    "What happens if the internet fails?",
    "Which components depend on this service?",
    "Which scenario remains unresolved?",
    "What should we improve first?",
    "Explain the results in simple English.",
    "Compare two contingency options."
  ];

  const handleSend = async (text) => {
    const query = text || inputVal.trim();
    if (!query || isLoading) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);

    try {
      const res = await api.askCopilot({
        message: query,
        workflowState: workflow,
        simulationContext: simulationSuite
      });

      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: res.reply,
          mode: res.mode,
          notice: res.notice,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `Error contacting backend: ${err.message}`,
          timestamp: 'Error'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="pb-4 border-b border-navy-700 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">PLANB Copilot Intelligence Hub</h1>
            <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
              Interactive Advisor
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Explainable AI decision intelligence grounded in mathematical state, not fabricated hallucinations.
          </p>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-400 hover:text-rose-400 transition-colors"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Questions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {sampleQuestions.slice(0, 6).map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="p-3 rounded-xl bg-navy-900 hover:bg-navy-800/80 border border-navy-700/80 hover:border-indigo-500/40 text-left text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group"
          >
            <span className="truncate">{q}</span>
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 opacity-60 group-hover:opacity-100 flex-shrink-0 ml-1" />
          </button>
        ))}
      </div>

      {/* Messages Window */}
      <div className="p-6 rounded-2xl glass-panel border border-indigo-500/30 space-y-4 min-h-[420px] flex flex-col justify-between">
        <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-slate-400 mb-1 px-1">
                  {isUser ? 'You' : 'PLANB Copilot'} • {m.timestamp}
                </span>
                <div className={`p-4 rounded-2xl text-xs max-w-[85%] ${
                  isUser 
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-xs'
                    : 'bg-navy-950/80 border border-navy-700/80 text-slate-200 rounded-bl-xs'
                }`}>
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  ) : (
                    <div>
                      {renderFormattedMarkdown(m.text)}
                      {m.notice && (
                        <div className="mt-3 pt-2 border-t border-navy-800 text-[10px] text-indigo-400/80 italic">
                          {m.notice}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-navy-900 border border-indigo-500/20 max-w-sm animate-pulse">
              <Cpu className="w-4 h-4 text-indigo-400 animate-spin" />
              <span className="text-xs text-indigo-300">Evaluating simulation rules & generating analysis...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }} 
          className="pt-4 border-t border-navy-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type your question for Copilot..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-navy-950 border border-navy-700 focus:border-indigo-500 focus:outline-none text-xs text-white placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
}
