import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, UserCircle, Bot, MessageSquare, Info, ChevronLeft, Trash2, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  sender_role: 'user' | 'admin';
  user_id: string;
  created_at: string;
}

interface Conversation {
  id: string;
  name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface ChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sidebarOffset?: number;
}

export function NotificationDrawer({ open, onOpenChange, sidebarOffset = 288 }: ChatDrawerProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<Conversation | null>(null);
  const [view, setView] = useState<'list' | 'chat'>('chat');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setSelectedUser(null);
      if (user?.role === 'admin') {
        setView('list');
      }
    }
  }, [open, user?.role]);

  const fetchMessages = useCallback(async (targetUserId?: string) => {
    try {
      setLoading(true);
      const userId = targetUserId || user?.id;
      const params = userId ? { user_id: userId } : {};
      const response = await api.get('/messages', { params });
      setMessages(response.data);
      
      // Mark as read
      if (userId) {
        api.post('/messages/read', { user_id: userId }).then(() => {
          window.dispatchEvent(new Event('messages-read'));
        });
        // Dispatch immediately for instant UI feedback
        window.dispatchEvent(new Event('messages-read'));
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (open) {
      if (user?.role === 'admin') {
        if (selectedUser) {
          setView('chat');
          fetchMessages(selectedUser.id);
          interval = setInterval(() => fetchMessages(selectedUser.id), 5000);
        } else {
          setView('list');
          fetchConversations();
          interval = setInterval(fetchConversations, 5000);
        }
      } else {
        setView('chat');
        fetchMessages();
        interval = setInterval(() => fetchMessages(), 5000);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [open, user?.role, selectedUser, fetchMessages, fetchConversations]);

  useEffect(() => {
    if (open && view === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open, view, messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const content = inputValue.trim();
    setInputValue('');

    // Optimistic Update
    const tempId = Date.now().toString();
    const tempMsg: Message = {
      id: tempId,
      content,
      sender_role: user?.role === 'admin' ? 'admin' : 'user',
      user_id: (user?.role === 'admin' ? selectedUser?.id : user?.id) || '',
      created_at: new Date().toISOString(),
      // @ts-ignore - added for UI feedback
      isSending: true
    };

    setMessages(prev => [...prev, tempMsg]);

    try {
      const payload: any = { 
        content,
        sender_role: user?.role === 'admin' ? 'admin' : 'user'
      };

      if (user?.role === 'admin' && selectedUser) {
        payload.user_id = selectedUser.id;
      } else if (user) {
        payload.user_id = user.id;
      }

      const response = await api.post('/messages', payload);
      setMessages(prev => prev.map(m => m.id === tempId ? response.data : m));
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      toast.error('Erreur lors de l\'envoi du message');
      console.error('Failed to send message:', error);
    }
  };

  const handleClearChat = async () => {
    if (!confirm('Êtes-vous sûr de vouloir effacer toute la conversation ?')) return;

    try {
      const userId = selectedUser?.id || user?.id;
      if (!userId) return;

      await api.delete('/messages/clear', { data: { user_id: userId } });
      setMessages([]);
      toast.success('Conversation effacée');
    } catch (error) {
      toast.error('Erreur lors de la suppression de la conversation');
      console.error('Failed to clear chat:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-transparent"
            onClick={() => onOpenChange(false)}
          />

          <div 
            style={{ left: sidebarOffset }}
            className="fixed top-0 bottom-0 z-[70] w-[400px] max-w-[calc(100vw-80px)] overflow-hidden pointer-events-none"
          >
            <motion.div
              key="panel"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="w-full h-full bg-card border-r border-border flex flex-col pointer-events-auto shadow-2xl"
            >
            <div className="px-6 pt-8 pb-5 bg-background/80 backdrop-blur-xl relative overflow-hidden shrink-0 border-b border-border/40">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[80px] rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 blur-[60px] rounded-full -ml-12 -mb-12" />

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  {view === 'chat' && user?.role === 'admin' && (
                    <button 
                      onClick={() => {
                        setView('list');
                        setSelectedUser(null);
                        fetchConversations();
                      }}
                      className="p-2 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground transition-all duration-300 hover:scale-105 active:scale-95 group"
                    >
                      <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                  )}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20 border border-white/20">
                       <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#1A1A1A] rounded-full shadow-sm" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-black text-foreground leading-none mb-1.5 uppercase tracking-tighter truncate">
                      {view === 'list' 
                        ? 'Communications' 
                        : (user?.role === 'admin' ? selectedUser?.name : 'Assistant Stock')}
                    </h2>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                        Actif maintenant
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {view === 'chat' && messages.length > 0 && (
                    <button
                      onClick={handleClearChat}
                      className="p-2.5 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all duration-300 active:scale-95 group/trash"
                      title="Effacer la conversation"
                    >
                      <Trash2 className="w-4 h-4 transition-transform group-hover/trash:rotate-12" />
                    </button>
                  )}
                  <button
                    onClick={() => onOpenChange(false)}
                    className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground transition-all duration-300 active:scale-95"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-muted/5 relative custom-scrollbar">
              {view === 'list' ? (
                <div className="p-4 space-y-2">
                  {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
                      <div className="w-20 h-20 bg-muted/50 rounded-[32px] flex items-center justify-center mb-6 border border-border/40 relative">
                        <MessageSquare className="w-8 h-8 text-muted-foreground/30" />
                        <div className="absolute inset-0 bg-indigo-500/5 blur-2xl rounded-full" />
                      </div>
                      <h3 className="text-sm font-black text-foreground uppercase tracking-tight mb-2">Aucune conversation</h3>
                      <p className="text-[11px] text-muted-foreground/60 leading-relaxed font-medium">
                        Les messages des utilisateurs apparaîtront ici dès qu'ils vous contacteront.
                      </p>
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => {
                          setSelectedUser(conv);
                          setConversations(prev => prev.map(c => 
                            c.id === conv.id ? { ...c, unread_count: 0 } : c
                          ));
                        }}
                        className="w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-all duration-300 rounded-[24px] group border border-transparent hover:border-border/40 hover:shadow-lg hover:shadow-black/5"
                      >
                        <div className="relative">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center shrink-0 border border-border group-hover:border-indigo-500/30 transition-colors overflow-hidden">
                            <UserCircle className="w-7 h-7 text-muted-foreground/60 group-hover:text-indigo-500 transition-colors" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#1A1A1A] rounded-full shadow-sm" />
                        </div>
                        
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <h4 className="font-black text-[14px] text-foreground truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                              {conv.name}
                            </h4>
                            <span className="text-[10px] font-bold text-muted-foreground/40 whitespace-nowrap ml-2">
                              {conv.last_message_time ? formatTime(conv.last_message_time) : ''}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[12px] text-muted-foreground/70 truncate leading-none">
                              {conv.last_message || 'Nouvelle conversation'}
                            </p>
                            {conv.unread_count > 0 && (
                              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)] animate-pulse shrink-0" />
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {/* Greeting for normal users */}
                  {user?.role !== 'admin' && messages.length === 0 && (
                    <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 p-4 rounded-2xl text-xs flex gap-3 mb-6">
                      <div className="shrink-0 mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                      <p className="leading-relaxed font-medium">
                        Bonjour ! Vous discutez avec l'administrateur. Laissez votre message et nous vous répondrons dès que possible.
                      </p>
                    </div>
                  )}

                  {(() => {
                    const groups: { [key: string]: Message[] } = {};
                    messages.forEach(msg => {
                      const date = new Date(msg.created_at).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      });
                      const today = new Date().toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      });
                      const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      });
                      
                      let label = date;
                      if (date === today) label = "Aujourd'hui";
                      else if (date === yesterday) label = "Hier";
                      
                      if (!groups[label]) groups[label] = [];
                      groups[label].push(msg);
                    });

                    return Object.entries(groups).map(([date, groupMessages]) => (
                      <div key={date} className="space-y-6">
                        <div className="flex justify-center my-6 relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border/40"></div>
                          </div>
                          <span className="relative px-3 py-1 bg-background text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 rounded-full border border-border/40 backdrop-blur-md">
                            {date}
                          </span>
                        </div>

                        {groupMessages.map((msg) => {
                          const isMe = msg.sender_role === user?.role;
                          // @ts-ignore
                          const isSending = msg.isSending;
                          return (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              key={msg.id}
                              className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end`}
                            >
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border border-border/50 shadow-sm ${
                                isMe ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'bg-background'
                              }`}>
                                {msg.sender_role === 'admin' ? (
                                  <Bot className={`w-3.5 h-3.5 ${isMe ? 'text-indigo-600' : 'text-muted-foreground'}`} />
                                ) : (
                                  <UserCircle className={`w-3.5 h-3.5 ${isMe ? 'text-indigo-600' : 'text-muted-foreground'}`} />
                                )}
                              </div>
                              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                                <div className={`group relative px-4 py-2.5 rounded-[20px] text-[13px] leading-relaxed transition-all duration-300 ${
                                  isMe 
                                    ? `bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg shadow-indigo-500/20 rounded-br-[4px] ${isSending ? 'opacity-70 animate-pulse' : ''}` 
                                    : 'bg-white dark:bg-[#1A1A1A] border border-border/60 text-foreground shadow-sm rounded-bl-[4px] hover:border-indigo-500/30'
                                }`}>
                                  {msg.content}
                                  
                                  {isSending && (
                                    <div className="absolute -left-6 bottom-1">
                                      <div className="flex gap-1">
                                        <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1 px-1">
                                  <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                                    {formatTime(msg.created_at)}
                                  </span>
                                  {isMe && !isSending && (
                                    <Check className="w-2.5 h-2.5 text-indigo-500" />
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ));
                  })()}
                  <div ref={messagesEndRef} className="h-4" />
                </div>
              )}
            </div>

            {view === 'chat' && (
              <div className="p-5 bg-background relative z-10 border-t border-border/40">
                 <div className="flex items-end gap-3 p-2.5 bg-white dark:bg-[#1A1A1A] rounded-[24px] border border-border/60 shadow-sm focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all duration-300">
                   <textarea
                     value={inputValue}
                     onChange={(e) => setInputValue(e.target.value)}
                     onKeyDown={handleKeyDown}
                     placeholder="Votre message..."
                     className="flex-1 bg-transparent border-none focus:outline-none resize-none min-h-[40px] max-h-[140px] text-[13px] py-2 px-3 leading-relaxed custom-scrollbar"
                     rows={1}
                   />
                   <button
                     onClick={handleSend}
                     disabled={!inputValue.trim() || loading}
                     className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20 transition-all duration-300 group"
                   >
                     <Send className="w-4 h-4 ml-0.5 group-hover:rotate-12 transition-transform" />
                   </button>
                 </div>
                 <div className="flex justify-center mt-3">
                   <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] animate-pulse">
                     Appuyez sur Entrée pour envoyer
                   </span>
                 </div>
              </div>
            )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
