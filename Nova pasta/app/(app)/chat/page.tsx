'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef } from 'react';
import { Bot, User } from 'lucide-react';

import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    maxSteps: 5,
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className='flex flex-col w-full h-screen bg-zinc-900 text-white px-4 py-4 overflow-auto'>
      <div className='flex-1 overflow-auto space-y-4 mb-28'>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role !== 'user' && (
              <div className='bg-zinc-800 p-2 rounded-full'>
                <Bot size={20} />
              </div>
            )}

            <div
              className={`max-w-md px-4 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-zinc-800 text-gray-100 rounded-bl-none'
              }`}
            >
              {message.parts.map((part, i) => {
                if (part.type === 'text') {
                  return (
                    <div
                      key={`${message.id}-${i}`}
                      className='prose prose-invert max-w-none text-sm'
                    >
                      <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                        {part.text}
                      </ReactMarkdown>
                    </div>
                  );
                }

                if (part.type === 'tool-invocation') {
                  return (
                    <pre key={`${message.id}-${i}`}>
                      {JSON.stringify(part.toolInvocation, null, 2)}
                    </pre>
                  );
                }

                return null;
              })}
            </div>

            {message.role === 'user' && (
              <div className='bg-blue-600 p-2 rounded-full'>
                <User size={20} />
              </div>
            )}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className='fixed bottom-0 left-0 w-full flex justify-center p-4 bg-zinc-900'
      >
        <input
          className='w-full max-w-2xl p-3 rounded-lg border border-zinc-700 bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
          value={input}
          placeholder='Digite sua mensagem...'
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
