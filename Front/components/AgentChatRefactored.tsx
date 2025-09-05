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
  Loader2,
  AlertCircle,
  Plus
} from 'lucide-react';

// Importar as funções reais da API
import {
  sendFirstMessage,
  sendMessage,
  getChatSessions,
  getTwilioSessions,
  getChatHistory
} from '@/app/(app)/agents/[id]/api/chatApi';

// Import dos tipos diretamente da interface
import { 
  Module as ModuleType, 
  ChatSessionResponse, 
  TwilioSession,
  ChatHistoryResponse 
} from '@/lib/interface/Chat';

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

// Interface para sessões pessoais (salvas localmente)
interface PersonalSession {
  sessionId: string;
  userName: string;
  lastSendDate: string;
  totalInteractions: number;
  messages: ChatMessage[];
}

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
  const [activeTab, setActiveTab] = useState<'personal' | 'shared' | 'twilio'>('personal');
  const [selectedSession, setSelectedSession] = useState<SelectedSession>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSessionResponse[]>([]);
  const [personalSessions, setPersonalSessions] = useState<PersonalSession[]>([]);
  const [twilioSessions, setTwilioSessions] = useState<TwilioSession[]>([]);
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

  // Carregar sessões pessoais do localStorage ao montar
  useEffect(() => {
    const savedSessions = localStorage.getItem('personalChatSessions');
    if (savedSessions) {
      setPersonalSessions(JSON.parse(savedSessions));
    }
  }, []);

  // Salvar sessões pessoais no localStorage quando mudarem
  useEffect(() => {
    if (personalSessions.length > 0) {
      localStorage.setItem('personalChatSessions', JSON.stringify(personalSessions));
    }
  }, [personalSessions]);

  // Se tiver uma sessão inicial, seleciona ela
  useEffect(() => {
    if (initialSessionId && activeTab === 'shared') {
      setSelectedSession({ 
        sessionId: initialSessionId, 
        userName: 'Sessão Atual',
        lastSendDate: new Date().toISOString(),
        totalInteractions: 0
      });
    }
  }, [initialSessionId, activeTab]);

  // Carregar sessões baseado na aba ativa
  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      if (activeTab === 'shared') {
        // Carregar sessões reais da API
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
        // Não carregar para Twilio já que está "Em breve"
        setTwilioSessions([]);
      } else if (activeTab === 'personal') {
        // Sessões pessoais já são carregadas do localStorage
      }
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
    } finally {
      setLoadingSessions(false);
    }
  }, [activeTab, module, agentId, userId, initialSessionId]);

  // Carregar sessões quando a aba mudar
  useEffect(() => {
    if (activeTab === 'shared') {
      loadSessions();
    }
  }, [activeTab, loadSessions]);

  // Carregar histórico quando uma sessão for selecionada
  const loadChatHistory = useCallback(async () => {
    if (!selectedSession) return;
    
    // Se for uma sessão pessoal, carregar do localStorage
    if (activeTab === 'personal') {
      const personalSession = personalSessions.find(s => s.sessionId === selectedSession.sessionId);
      if (personalSession) {
        setMessages(personalSession.messages);
      }
      return;
    }
    
    // Para sessões compartilhadas, carregar da API
    if (activeTab === 'shared') {
      setLoading(true);
      try {
        const history = await getChatHistory(module, selectedSession.sessionId);
        
        // Converter o formato da API para o formato do componente
        const formattedMessages = history.map((msg: ChatHistoryResponse): ChatMessage => ({
          role: msg.role === 0 ? 'assistant' as const : 'user' as const,
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
    }
  }, [selectedSession, module, activeTab, personalSessions]);

  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Criar nova sessão pessoal
  const createNewPersonalSession = () => {
    const newSession: PersonalSession = {
      sessionId: `personal-${Date.now()}`,
      userName: `Conversa Pessoal ${personalSessions.length + 1}`,
      lastSendDate: new Date().toISOString(),
      totalInteractions: 0,
      messages: []
    };
    setPersonalSessions(prev => [newSession, ...prev]);
    setSelectedSession(newSession);
    setMessages([]);
  };

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
      // Para sessões pessoais
      if (activeTab === 'personal' && selectedSession) {
        // Usar a API real para obter resposta do agente
        let response;
        
        // Verificar se é a primeira mensagem da sessão pessoal
        const personalSession = personalSessions.find(s => s.sessionId === selectedSession.sessionId);
        if (personalSession && personalSession.messages.length === 0) {
          // Primeira mensagem - criar nova sessão na API
          const firstMessageResponse = await sendFirstMessage(module, agentId, userMessage.content);
          response = { messageResponse: firstMessageResponse.messageResponse };
          
          // Podemos associar o sessionId da API com a sessão pessoal se necessário
        } else {
          // Para mensagens subsequentes em sessões pessoais, 
          // ainda precisamos de um sessionId válido da API
          // Por enquanto, vamos criar uma nova sessão a cada mensagem
          const firstMessageResponse = await sendFirstMessage(module, agentId, userMessage.content);
          response = { messageResponse: firstMessageResponse.messageResponse };
        }
        
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: response.messageResponse,
          sendDate: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        // Atualizar sessão pessoal no localStorage
        setPersonalSessions(prev => 
          prev.map(s => 
            s.sessionId === selectedSession.sessionId 
              ? { 
                  ...s, 
                  messages: [...s.messages, userMessage, aiMessage],
                  totalInteractions: s.totalInteractions + 1,
                  lastSendDate: new Date().toISOString()
                }
              : s
          )
        );
      } 
      // Para sessões compartilhadas (equipe)
      else if (activeTab === 'shared') {
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
      }
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
    if (loadingSessions && activeTab === 'shared') {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      );
    }

    // Aba Twilio - Em breve
    if (activeTab === 'twilio') {
      return (
        <div className="text-center text-gray-500 mt-8">
          <Phone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium">Integração Twilio</p>
          <div className="mt-3 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600 mx-auto mb-2" />
            <p className="text-sm text-yellow-700 font-medium">Em breve</p>
            <p className="text-xs text-yellow-600 mt-1">Esta funcionalidade está em desenvolvimento</p>
          </div>
        </div>
      );
    }

    // Aba Pessoal - Sessões locais
    if (activeTab === 'personal') {
      if (personalSessions.length === 0) {
        return (
          <div className="text-center text-gray-500 mt-8">
            <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Nenhuma conversa pessoal ainda</p>
            <button 
              onClick={createNewPersonalSession}
              className="mt-3 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
            >
              Iniciar Conversa Pessoal
            </button>
          </div>
        );
      }

      return (
        <div className="space-y-2">
          <button 
            onClick={createNewPersonalSession}
            className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Conversa Pessoal
          </button>
          {personalSessions.map((session) => (
            <div
              key={session.sessionId}
              onClick={() => {
                setSelectedSession(session);
                setMessages(session.messages);
              }}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedSession?.sessionId === session.sessionId
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm text-black">{session.userName}</span>
                <span className="text-xs text-gray-500">{session.totalInteractions} msgs</span>
              </div>
              <p className="text-xs text-gray-400">
                {new Date(session.lastSendDate).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      );
    }

    // Aba Compartilhada (Equipe) - Sessões da API
    if (activeTab === 'shared') {
      
        return (
          <div className="text-center text-gray-500 mt-8">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Nenhuma sessão compartilhada</p>
            <p className="text-xs text-gray-400 mt-1">Inicie uma conversa para começar</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
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
              Equipe
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
                  {agentName} • {
                    activeTab === 'personal' ? 'Conversa Pessoal' : 
                    activeTab === 'twilio' ? 'WhatsApp' : 
                    'Chat Compartilhado'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-gray-500">Selecione ou inicie uma conversa</p>
            </div>
          )}
        </div>

        {/* Área de Mensagens */}
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : !selectedSession ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Nenhuma conversa selecionada</p>
                <p className="text-sm mt-2">Escolha uma conversa existente ou inicie uma nova</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Bot className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Conversa vazia</p>
                <p className="text-sm mt-2">Envie uma mensagem para começar</p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                >
                  <div className={`flex items-start max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.role === 'user' ? 'bg-blue-500 ml-2' : 'bg-gray-500 mr-2'
                    }`}>
                      {msg.role === 'user' ? 
                        <User className="w-5 h-5 text-white" /> : 
                        <Bot className="w-5 h-5 text-white" />
                      }
                    </div>
                    <div className={`px-4 py-2 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-gray-800 text-white' 
                        : 'bg-white border text-black border-gray-200'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        msg.role === 'user' ? 'text-gray-200' : 'text-gray-400'
                      }`}>
                        {new Date(msg.sendDate).toLocaleTimeString()}
                        {msg.usage && ` • ${msg.usage.totalTokens} tokens`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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
                placeholder={selectedSession ? "Digite sua mensagem..." : "Selecione uma conversa primeiro"}
                className="text-black flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                rows={1}
                disabled={sendingMessage || !selectedSession || activeTab === 'twilio'}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={sendingMessage || !message.trim() || !selectedSession || activeTab === 'twilio'}
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
                </div>
              </div>
            )}
          </div>

          {/* Acordeon Arquivos - Em Breve */}
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
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                  <p className="text-sm font-medium text-yellow-700">Em Breve</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Funcionalidade de anexar arquivos está em desenvolvimento
                  </p>
                  <div className="mt-3 pt-3 border-t border-yellow-200">
                    <p className="text-xs text-gray-500">
                      Em breve você poderá anexar PDF, DOC, TXT (máx. 10MB)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Acordeon Conhecimento - Em Breve */}
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
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                  <p className="text-sm font-medium text-yellow-700">Em Breve</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Funcionalidade de base de conhecimento está em desenvolvimento
                  </p>
                  <div className="mt-3 pt-3 border-t border-yellow-200">
                    <p className="text-xs text-gray-500">
                      Em breve você poderá conectar documentos, FAQs e bases de dados
                    </p>
                  </div>
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