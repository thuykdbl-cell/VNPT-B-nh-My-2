/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const SUGGESTIONS = [
  'Gói cước nào bán chạy nhất?',
  'Nhà 2 lầu nên chọn gói nào?',
  'Khuyến mãi lắp đặt hiện tại là gì?',
  'Gói Home TV VIP có ưu đãi gì?'
];

export default function AIAdvisor() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Dạ, VNPT Bình Mỹ xin kính chào Anh/Chị! Em là trợ lý AI chuyên viên tư vấn cáp quang, truyền hình và camera thông minh. Anh/Chị cần em tư vấn thông tin gì ạ?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Gather context history (excluding the first welcome message to keep payload clean)
      const formattedHistory = [...messages.slice(1), userMsg].map((m) => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: formattedHistory })
      });

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'bot',
        text: data.text || 'Dạ, hiện tại em chưa kết nối được máy chủ AI. Xin Anh/Chị vui lòng liên hệ hotline 18001166 để được hỗ trợ trực tiếp ạ.',
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'bot',
        text: 'Dạ, kết nối bị gián đoạn. Anh/Chị có thể đăng ký trực tiếp trên form hoặc gọi Hotline miễn phí **18001166** để VNPT Bình Mỹ hỗ trợ ngay lập tức ạ!',
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#006191] to-[#0b5eaf] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center pulse-online">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm flex items-center gap-1">
                    VNPT AI Advisor <Sparkles className="w-3 h-3 text-orange-300" />
                  </h4>
                  <p className="text-[10px] text-sky-100">Hỗ trợ tư vấn trực tuyến 24/7</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages body */}
            <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-slate-50 no-scrollbar">
              {messages.map((m) => {
                const isBot = m.sender === 'bot';
                return (
                  <div
                    key={m.id}
                    className={`flex gap-2.5 max-w-[85%] ${
                      isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs ${
                        isBot ? 'bg-[#006191] text-white' : 'bg-orange-500 text-white'
                      }`}
                    >
                      {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div
                      className={`rounded-2xl p-3 text-sm shadow-sm leading-relaxed ${
                        isBot
                          ? 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                          : 'bg-[#006191] text-white rounded-tr-none'
                      }`}
                    >
                      {/* Standard render with support for simple bold formatting */}
                      {m.text.split('\n').map((line, idx) => (
                        <p key={idx} className={idx > 0 ? 'mt-1' : ''}>
                          {line.split('**').map((part, i) =>
                            i % 2 === 1 ? <strong key={i} className="font-semibold text-orange-500">{part}</strong> : part
                          )}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
              {isLoading && (
                <div className="flex gap-2.5 mr-auto max-w-[85%]">
                  <div className="w-7 h-7 rounded-full bg-[#006191] text-white flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white text-slate-500 border border-slate-100 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length === 1 && (
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 mb-1.5 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" /> Gợi ý câu hỏi:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(s)}
                      className="text-xs bg-white text-[#006191] border border-sky-100 hover:border-sky-300 rounded-full px-2.5 py-1 text-left transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input area */}
            <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                placeholder="Nhập câu hỏi của bạn tại đây..."
                className="flex-grow border border-slate-200 focus:border-[#006191] focus:ring-1 focus:ring-[#006191] outline-none rounded-xl px-3 py-2 text-sm"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isLoading}
                className="bg-[#006191] hover:bg-[#0b5eaf] disabled:opacity-50 text-white rounded-xl p-2 flex items-center justify-center transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-[#006191] to-[#0b5eaf] text-white rounded-full p-4 shadow-2xl flex items-center justify-center gap-2 pulse-online group cursor-pointer"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out text-sm font-semibold whitespace-nowrap">
              Tư vấn AI 24/7
            </span>
          </>
        )}
      </motion.button>
    </div>
  );
}
