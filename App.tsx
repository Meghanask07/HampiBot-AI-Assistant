
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, Sender } from './types';
import { sendMessage } from './services/geminiService';

const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2 .01 7z" />
  </svg>
);

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === Sender.USER;
  const bubbleClasses = isUser
    ? 'bg-red-600 text-white self-end'
    : 'bg-white text-gray-800 self-start shadow';
  const containerClasses = isUser ? 'flex justify-end' : 'flex justify-start';

  const renderContent = () => {
    return message.text.split('\n').map((line, lineIndex) => (
      line.trim() && <p key={lineIndex} className="mb-1 last:mb-0">{line}</p>
    ));
  };

  return (
    <div className={containerClasses}>
      <div className={`rounded-2xl max-w-md break-words ${bubbleClasses} p-4`}>
        {renderContent()}
      </div>
    </div>
  );
};

const TypingIndicator: React.FC = () => (
  <div className="flex justify-start">
    <div className="bg-white text-gray-800 self-start shadow rounded-2xl p-4 max-w-sm md:max-w-md">
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-red-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-red-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-red-300 rounded-full animate-bounce"></div>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'initial-welcome',
      text: 'ನಮಸ್ಕಾರ! ಹಂಪಿಬಾಟ್‌ಗೆ ಸುಸ್ವಾಗತ. ಹಂಪಿಯ ಭವ್ಯ ಅವಶೇಷಗಳನ್ನು ಅನ್ವೇಷಿಸಲು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?',
      sender: Sender.BOT,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      sender: Sender.USER,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const botResponseText = await sendMessage(input);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: Sender.BOT,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Failed to get response from bot:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "Oops! Something went wrong. Please try again.",
        sender: Sender.BOT,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-yellow-300 to-red-400 font-sans">
      <header className="bg-red-600 text-white p-4 text-center font-bold text-xl shadow-lg z-10">
        <h1>HampiBot</h1>
      </header>

      <main
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6"
        aria-live="polite"
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={chatEndRef} />
      </main>

      <footer className="sticky bottom-0 bg-white border-t border-stone-200 p-2 md:p-4 z-10">
        <form onSubmit={handleSendMessage} className="flex items-center max-w-3xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Hampi Utsav..."
            className="flex-grow w-full border rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            disabled={isLoading}
            aria-label="Your message"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="ml-3 bg-red-600 hover:bg-red-700 text-white rounded-full p-3 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors duration-300"
            aria-label="Send message"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default App;
