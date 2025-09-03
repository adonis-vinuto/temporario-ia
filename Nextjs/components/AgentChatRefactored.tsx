// components/AgentChatRefactored.tsx

"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  User, 
  Bot, 
  MessageSquare,
  Phone,
  Users,
  ChevronDown,
  ChevronUp,
  Paperclip,
  BookOpen,
  Settings,
  Loader2
} from 'lucide-react';
import {
  sendFirstMessage,
  sendMessage,
  getChatSessions,
  getTwilioSessions,
  getChatHistory
} from '@/app/(app)/agents/[id]/api/chatApi';

// Import dos tipos diretamente da interface
import { 
  ModuleType, 
  ChatSessionResponse, 
  TwilioSession,
  ChatHistoryResponse 
} from '@/lib/interface/Chat';

// Props do componente
interface AgentChatRefactoredProps {
  module: ModuleType;
  agentId: string;
  userId: string;
  agentName?: string;
  initialSessionId?: string;
  onNewSession?: (sessionId: string) => void;
}

// ===================== INTERFACES LOCAIS =====================

// Interface para mensagens no chat
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sendDate: string;
  usage?: {
    totalTokens: number;
    totalTime: number;
  };
}

// Interface para sessão selecionada (união dos tipos possíveis)
type SelectedSession = ChatSessionResponse | TwilioSession | {
  sessionId: string;
  userName?: string;
  phoneNumber?: string;
  lastSendDate: string;
  totalInteractions: number;
} | null;

// Props do componente
interface AgentChatRefactoredProps {
  module: ModuleType;
  agentId: string;
  userId: string;
  agentName?: string;
  initialSessionId?: string;
  onNewSession?: (sessionId: string) => void;
}

const AgentChatRefactored: React.FC<AgentChatRefactoredProps> = ({ 
  module, 
  agentId, 
  userId,
  agentName = "Agent",
  initialSessionId,
  onNewSession 
}) => {
  // Estados do componente
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'personal' | 'shared' | 'twilio'>('shared');
  const [selectedSession, setSelectedSession] = useState<SelectedSession>(null); // CORRIGIDO: tipo específico
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]); // CORRIGIDO: array tipado
  const [sessions, setSessions] = useState<ChatSessionResponse[]>([]); // CORRIGIDO: array tipado
  const [twilioSessions, setTwilioSessions] = useState<TwilioSession[]>([]); // CORRIGIDO: array tipado
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Estados para os acordeons do menu direito
  const [accordionStates, setAccordionStates] = useState({
    settings: false,
    files: false,
    knowledge: false
  });

  // Se tiver uma sessão inicial, seleciona ela
  useEffect(() => {
    if (initialSessionId) {
      setSelectedSession({ 
        sessionId: initialSessionId, 
        userName: 'Sessão Atual',
        lastSendDate: new Date().toISOString(),
        totalInteractions: 0
      });
    }
  }, [initialSessionId]);

  // Carregar sessões baseado na aba ativa
  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      if (activeTab === 'shared') {
        const data = await getChatSessions(module, agentId, userId);
        setSessions(data);
        
        // Se tiver uma sessão inicial e ela está na lista, seleciona
        if (initialSessionId) {
          const sessionExists = data.find((s: ChatSessionResponse) => s.sessionId === initialSessionId);
          if (sessionExists) {
            setSelectedSession(sessionExists);
          }
        }
      } else if (activeTab === 'twilio') {
        const data = await getTwilioSessions(module, agentId);
        setTwilioSessions(data);
      } else {
        // Personal sessions - vazio por enquanto
        setSessions([]);
      }
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
    } finally {
      setLoadingSessions(false);
    }
  }, [activeTab, module, agentId, userId, initialSessionId]);

  // Carregar sessões quando a aba mudar
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Carregar histórico quando uma sessão for selecionada
  const loadChatHistory = useCallback(async () => {
    if (!selectedSession) return;
    
    setLoading(true);
    try {
      const history = await getChatHistory(module, selectedSession.sessionId);
      
      // Converter o formato da API para o formato do componente
      const formattedMessages = history.map((msg: ChatHistoryResponse): ChatMessage => ({
        role: msg.role === 0 ? 'assistant' as const : 'user' as const, // Adicione 'as const'
        content: msg.content,
        sendDate: msg.sendDate,
        usage: msg.usage
        }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedSession, module]);

  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Enviar mensagem
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
        role: 'user',
        content: message,
        sendDate: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setSendingMessage(true);

    try {
      let response;
      let newSessionId = selectedSession?.sessionId;
      
      if (!newSessionId) {
        // Primeira mensagem - criar nova sessão
        const firstMessageResponse = await sendFirstMessage(module, agentId, userMessage.content);
        
        newSessionId = firstMessageResponse.sessionId;
        
        // Atualizar sessão selecionada com o novo ID
        const newSession = {
          sessionId: newSessionId,
          userName: 'Nova Conversa',
          lastSendDate: new Date().toISOString(),
          totalInteractions: 1
        };
        setSelectedSession(newSession);
        
        response = { messageResponse: firstMessageResponse.messageResponse };
        
        // Notificar o componente pai sobre a nova sessão
        if (onNewSession) {
          onNewSession(newSessionId);
        }
        
        // Recarregar lista de sessões
        loadSessions();
      } else {
        // Mensagem em sessão existente
        response = await sendMessage(module, agentId, newSessionId, userMessage.content);
      }

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: response.messageResponse,
        sendDate: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Remover a mensagem do usuário se houver erro
      setMessages(prev => prev.slice(0, -1));
      setMessage(userMessage.content);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleAccordion = (key: string) => {
    setAccordionStates(prev => ({
      ...prev,
      [key as keyof typeof prev]: !prev[key as keyof typeof prev]
    }));
  };

  const renderSessions = () => {
    const sessionsToRender = activeTab === 'twilio' ? twilioSessions : sessions;
    
    if (loadingSessions) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      );
    }

    if (sessionsToRender.length === 0) {
      const EmptyIcon = activeTab === 'personal' ? User : activeTab === 'twilio' ? Phone : Users;
      const emptyMessage = 
        activeTab === 'personal' ? 'Sessões pessoais' :
        activeTab === 'twilio' ? 'Integrações Twilio' :
        'Nenhuma sessão compartilhada';

      return (
        <div className="text-center text-gray-500 mt-8">
          <EmptyIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">{emptyMessage}</p>
          {activeTab !== 'shared' && (
            <p className="text-xs text-gray-400 mt-1">Em breve</p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {sessionsToRender.map((session: ChatSessionResponse | TwilioSession) => (
          <div
            key={session.sessionId}
            onClick={() => setSelectedSession(session)}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              selectedSession?.sessionId === session.sessionId
                ? 'bg-blue-50 border border-blue-200'
                : 'hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">{session.totalInteractions} msgs</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Menu Lateral Esquerdo - Sessões */}
      <div className={`${leftSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Sessões de Chat</h2>
            <button 
              onClick={() => setLeftSidebarOpen(false)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          {/* Abas */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('personal')}
              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'personal' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <User className="w-4 h-4 mr-1" />
              Pessoal
            </button>
            <button
              onClick={() => setActiveTab('shared')}
              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'shared' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Users className="w-4 h-4 mr-1" />
              Compartilhado
            </button>
            <button
              onClick={() => setActiveTab('twilio')}
              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'twilio' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Phone className="w-4 h-4 mr-1" />
              Twilio
            </button>
          </div>
        </div>
        
        {/* Lista de Sessões */}
        <div className="flex-1 overflow-y-auto p-4">
          {renderSessions()}
        </div>
      </div>

      {/* Botão para abrir menu esquerdo quando fechado */}
      {!leftSidebarOpen && (
        <button
          onClick={() => setLeftSidebarOpen(true)}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 rounded-r-lg p-2 shadow-md hover:bg-gray-50 z-10 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      )}

      {/* Área Principal do Chat */}
      <div className="flex-1 flex flex-col">
        {/* Header do Chat */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          {selectedSession ? (
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                {(selectedSession.userName || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {selectedSession.userName || `Sessão ${selectedSession.sessionId.slice(-6)}`}
                </h3>
                <p className="text-sm text-gray-500">
                  {agentName} • {activeTab === 'twilio' ? 'WhatsApp' : 'Chat'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                <MessageSquare className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{agentName}</h3>
                <p className="text-sm text-gray-500">Selecione ou inicie uma conversa</p>
              </div>
            </div>
          )}
        </div>

        {/* Área de Mensagens */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 mt-8">
                  <Bot className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Pronto para conversar!</p>
                  <p className="text-sm mt-2">
                    {selectedSession 
                      ? 'Digite uma mensagem para continuar a conversa'
                      : 'Digite uma mensagem para começar uma nova conversa'}
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className={`mb-6 ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
                    {msg.role === 'assistant' ? (
                      // Mensagem da IA - Sem balão
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          <div className="flex items-center gap-3 mt-1">

                            {msg.usage && (
                              <span className="text-xs text-gray-400">
                                {msg.usage.totalTokens} tokens • {msg.usage.totalTime.toFixed(2)}s
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Mensagem do Usuário - Com balão
                      <div className="max-w-xs lg:max-w-md">
                        <div className="bg-blue-500 text-white rounded-2xl rounded-br-none px-4 py-3">
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>

                      </div>
                    )}
                  </div>
                ))
              )}
              {sendingMessage && (
                <div className="flex items-start mb-6">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input de Mensagem */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center space-x-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                rows={1}
                disabled={sendingMessage}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={sendingMessage || !message.trim()}
                className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {sendingMessage ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Lateral Direito - Configurações */}
      <div className={`${rightSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-l border-gray-200 flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Configurações</h2>
            <button 
              onClick={() => setRightSidebarOpen(false)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {/* Acordeon Configurações Gerais */}
          <div className="mb-3">
            <button
              onClick={() => toggleAccordion('settings')}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <Settings className="w-5 h-5 text-gray-600 mr-2" />
                <span className="font-medium text-gray-700">Configurações</span>
              </div>
              {accordionStates.settings ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </button>
            {accordionStates.settings && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Módulo</label>
                    <p className="text-sm text-gray-600 capitalize">{module}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Agente</label>
                    <p className="text-sm text-gray-600">{agentName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">ID do Agente</label>
                    <p className="text-sm text-gray-600 font-mono">{agentId}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    Mais configurações em desenvolvimento...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Acordeon Arquivos */}
          <div className="mb-3">
            <button
              onClick={() => toggleAccordion('files')}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <Paperclip className="w-5 h-5 text-gray-600 mr-2" />
                <span className="font-medium text-gray-700">Atrelar Arquivos</span>
              </div>
              {accordionStates.files ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </button>
            {accordionStates.files && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Paperclip className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Arraste arquivos aqui ou clique para enviar</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOC, TXT (máx. 10MB)</p>
                  <button className="mt-3 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:bg-gray-300" disabled>
                    Em desenvolvimento
                  </button>
                </div>
                {selectedSession && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-xs text-yellow-700">
                      Os arquivos serão vinculados à sessão atual quando esta funcionalidade for implementada.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Acordeon Conhecimento */}
          <div className="mb-3">
            <button
              onClick={() => toggleAccordion('knowledge')}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <BookOpen className="w-5 h-5 text-gray-600 mr-2" />
                <span className="font-medium text-gray-700">Atrelar Conhecimento</span>
              </div>
              {accordionStates.knowledge ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </button>
            {accordionStates.knowledge && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">Base de Conhecimento</p>
                      <button className="text-xs text-blue-500 hover:text-blue-600">
                        Adicionar
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">Conecte documentos, FAQs e bases de dados</p>
                  </div>
                  <div className="p-3 bg-white rounded border border-gray-200 opacity-50">
                    <p className="text-sm font-medium text-gray-700">Contexto Adicional</p>
                    <p className="text-xs text-gray-500 mt-1">Configure informações contextuais do agente</p>
                  </div>
                  <p className="text-xs text-gray-400 text-center mt-3">
                    Funcionalidade em desenvolvimento
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botão para abrir menu direito quando fechado */}
      {!rightSidebarOpen && (
        <button
          onClick={() => setRightSidebarOpen(true)}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 rounded-l-lg p-2 shadow-md hover:bg-gray-50 z-10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
      )}
    </div>
  );
};

export default AgentChatRefactored;