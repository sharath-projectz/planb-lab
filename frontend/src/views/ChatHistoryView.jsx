import React, { useState } from 'react';
import { 
  MessageSquare, 
  Trash2, 
  ArrowRight, 
  Plus, 
  Clock, 
  Sparkles,
  Bot
} from 'lucide-react';

export default function ChatHistoryView({ onOpenConversationWithPrompt }) {
  const [conversations, setConversations] = useState([
    {
      id: 'conv-1',
      title: 'College Fest Registration Vulnerability Audit',
      workflowName: 'College Fest Registration',
      date: 'Today, 10:45 AM',
      messageCount: 6,
      snippet: 'Explored internet dropouts and verified that offline encrypted registration records with trained staff recovered 85% of compound stress test scenarios.'
    },
    {
      id: 'conv-2',
      title: 'POS Offline Transaction Spooling Audit',
      workflowName: 'Omnichannel Boutique Store Checkout',
      date: 'Yesterday, 3:15 PM',
      messageCount: 4,
      snippet: 'Evaluated NFC payment gateway timeouts and recommended offline store-and-forward batch authorization.'
    },
    {
      id: 'conv-3',
      title: 'Campus Emergency Evacuation Telecom Overload',
      workflowName: 'Campus Emergency Alert & Dispatch',
      date: 'Oct 11, 2026',
      messageCount: 8,
      snippet: 'Stress-tested cell broadcast failures and determined fallback floor wardens are critical to guarantee student safety.'
    }
  ]);

  const handleDelete = (id) => {
    setConversations(conversations.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="pb-4 border-b border-navy-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Chat History & Investigations</h1>
            <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
              Audit Logs
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Reopen previous AI Copilot investigations and continue discussions on saved workflows.
          </p>
        </div>

        <button
          onClick={() => onOpenConversationWithPrompt('Start a fresh resiliency audit on my workflow.')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all self-start"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Conversation</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="space-y-3">
        {conversations.length === 0 ? (
          <div className="p-8 rounded-2xl glass-panel text-center text-xs text-slate-400 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-500 mx-auto" />
            <p>No saved conversations found. Start a new investigation with Copilot.</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className="p-5 rounded-2xl glass-panel border border-navy-700/80 hover:border-indigo-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {conv.workflowName}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{conv.date}</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {conv.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {conv.snippet}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => onOpenConversationWithPrompt(`Continue discussion from ${conv.title}.`)}
                  className="px-3.5 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>Reopen</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(conv.id)}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-navy-800 transition-colors"
                  title="Delete conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
