import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Send, 
  User, 
  Building2, 
  MessageCircle, 
  HelpCircle, 
  Info, 
  Sparkles,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// AI Service
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const SYSTEM_INSTRUCTION = `너는 이제부터 아파트 입주민들의 궁금증을 시원하게 해결해 주는 '친절한 아파트 관리소장 AI'야.
너의 가장 중요한 임무는 아파트의 '장기수선계획'과 '장기수선충당금'에 대해 사람들이 물어볼 때, 어려운 법률 용어나 전문 용어를 쓰지 않고 아주 쉽고 친절하게 설명해 주는 거야.

[대답할 때 지켜야 할 규칙]
1. 비유 사용하기: 예를 들어 "장기수선충당금은 우리 아파트가 아플 때를 대비해서 모아두는 돼지저금통이나 건강보험과 같아요"처럼 초등학생도 이해할 수 있는 비유를 꼭 사용해 줘.
2. 친절한 말투: "~요", "~습니다"를 사용해서 항상 웃으며 응대하는 것처럼 따뜻하게 말해 줘.
3. 정확성과 한계 인정: 법적인 부분이나 비용에 대해 물어보면, 네가 아는 선에서 정확히 대답하되, 마지막에는 항상 "하지만 정확한 금액이나 법적 적용은 아파트마다 다를 수 있으니, 관리사무소에 한 번 더 확인하시는 것이 가장 좋습니다."라고 안내해 줘.
4. 답변은 한국어로 작성해줘.`;

interface Message {
  role: 'user' | 'model';
  text: string;
}

const QUICK_QUESTIONS = [
  "장기수선충당금이 뭐예요?",
  "왜 매달 돈을 내야 하나요?",
  "장기수선계획은 왜 필요한가요?",
  "이 돈은 나중에 돌려받을 수 있나요?",
  "엘리베이터 수리비도 여기서 나가나요?"
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      text: "안녕하세요! 우리 아파트의 든든한 도우미, 친절한 관리소장 AI입니다. 😊\n\n아파트 관리비 고지서에 나오는 '장기수선충당금'이나 '장기수선계획'에 대해 궁금한 점이 있으신가요? 무엇이든 편하게 물어보세요!" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
        history: messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }))
      });

      const response = await chat.sendMessage({ message: text });
      const modelMessage: Message = { role: 'model', text: response.text || "죄송해요, 잠시 문제가 생겼어요. 다시 말씀해 주시겠어요?" };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "어머나, 제가 잠시 자리를 비웠나 봐요. 다시 한번만 물어봐 주시겠어요? 😅" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-[#1a1a1a] font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#5A5A40]/10 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#5A5A40] rounded-full flex items-center justify-center text-white shadow-lg">
              <Building2 size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">친절한 관리소장 AI</h1>
              <p className="text-xs text-[#5A5A40]/60 font-medium">우리 아파트의 든든한 길잡이</p>
            </div>
          </div>
          <button 
            onClick={() => setMessages([{ role: 'model', text: "안녕하세요! 무엇을 도와드릴까요? 😊" }])}
            className="p-2 hover:bg-black/5 rounded-full transition-colors text-[#5A5A40]"
            title="대화 초기화"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 pb-32">
        {/* Chat History */}
        <div ref={scrollRef} className="space-y-6 mb-8">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-3",
                  msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                  msg.role === 'user' ? "bg-emerald-600 text-white" : "bg-white border border-[#5A5A40]/20 text-[#5A5A40]"
                )}>
                  {msg.role === 'user' ? <User size={16} /> : <Building2 size={16} />}
                </div>
                <div className={cn(
                  "max-w-[85%] px-4 py-3 rounded-2xl shadow-sm",
                  msg.role === 'user' 
                    ? "bg-emerald-600 text-white rounded-tr-none" 
                    : "bg-white border border-[#5A5A40]/10 rounded-tl-none"
                )}>
                  <div className={cn(
                    "text-sm leading-relaxed",
                    msg.role === 'user' ? "text-white" : "text-[#1a1a1a]"
                  )}>
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        code: ({ children }) => <code className="bg-black/10 px-1 rounded text-xs">{children}</code>,
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-white border border-[#5A5A40]/20 text-[#5A5A40] flex items-center justify-center animate-pulse">
                <Building2 size={16} />
              </div>
              <div className="bg-white border border-[#5A5A40]/10 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[#5A5A40]/40 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-[#5A5A40]/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-[#5A5A40]/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Quick Questions */}
        {messages.length < 3 && (
          <div className="space-y-3 mb-8">
            <p className="text-xs font-bold text-[#5A5A40]/60 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={12} /> 자주 묻는 질문
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="px-4 py-2 bg-white border border-[#5A5A40]/20 rounded-full text-sm hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm active:scale-95"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#f5f5f0] via-[#f5f5f0] to-transparent pt-10 pb-6 px-4">
        <div className="max-w-3xl mx-auto relative">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="궁금한 점을 물어보세요..."
              className="w-full bg-white border border-[#5A5A40]/20 rounded-2xl px-6 py-4 pr-16 shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-3 bg-[#5A5A40] text-white rounded-xl hover:bg-[#4A4A30] disabled:opacity-50 disabled:hover:bg-[#5A5A40] transition-all shadow-md active:scale-95"
            >
              <Send size={20} />
            </button>
          </form>
          <p className="text-[10px] text-center mt-3 text-[#5A5A40]/40 font-medium">
            정확한 법적 적용은 아파트마다 다를 수 있으니 관리사무소에 꼭 확인해 주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
