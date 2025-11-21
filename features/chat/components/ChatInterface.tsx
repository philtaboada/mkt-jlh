'use client';

import { useState } from 'react';
import { useConversations, useConversation } from '@/features/chat/hooks/useConversations';
import { useMessages } from '@/features/chat/hooks/useMessages';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, Send } from 'lucide-react';

export default function ChatInterface() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  const { data: conversationsResult, isLoading: conversationsLoading } = useConversations();
  const conversations = conversationsResult?.data || [];
  const { data: selectedConversation } = useConversation(selectedConversationId || '');
  const { data: messages, isLoading: messagesLoading } = useMessages(selectedConversationId || '');
  console.log('conversations', conversations);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    // TODO: Implement send message API call
    console.log('Sending message:', messageText);
    setMessageText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Conversations */}
      <div className="w-80 border-r bg-white shadow-sm">
        <div className="p-4 border-b bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Conversaciones</h2>
        </div>
        <ScrollArea className="h-full">
          {conversationsLoading ? (
            <div className="p-4 text-center text-gray-500">Cargando...</div>
          ) : conversations?.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No hay conversaciones</div>
          ) : (
            conversations?.map((conv: any) => (
              <div
                key={conv.id}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversationId === conv.id
                    ? 'bg-blue-50 border-r-2 border-r-blue-500'
                    : ''
                }`}
                onClick={() => setSelectedConversationId(conv.id)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-blue-500 text-white">
                      {conv.mkt_contacts?.name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {conv.mkt_contacts?.name || 'Sin nombre'}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">{conv.channel}</p>
                  </div>
                  {conv.last_message_at && (
                    <p className="text-xs text-gray-400">
                      {new Date(conv.last_message_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white shadow-sm">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback className="bg-blue-500 text-white">
                    {selectedConversation.mkt_contacts?.name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedConversation.mkt_contacts?.name}
                  </h3>
                  <p className="text-sm text-gray-500 capitalize">{selectedConversation.channel}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 space-y-4">
              {messagesLoading ? (
                <div className="text-center text-gray-500">Cargando mensajes...</div>
              ) : messages?.length === 0 ? (
                <div className="text-center text-gray-500">No hay mensajes</div>
              ) : (
                messages?.map((msg: any) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md ${msg.sender_type === 'user' ? 'order-2' : 'order-1'}`}
                    >
                      <Card
                        className={`p-3 shadow-sm ${
                          msg.sender_type === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-900'
                        }`}
                      >
                        {msg.body && <p className="text-sm">{msg.body}</p>}
                        {msg.media_url && (
                          <div className="mt-2">
                            {msg.media_mime?.startsWith('image/') ? (
                              <img
                                src={msg.media_url}
                                alt="Media"
                                className="max-w-full h-auto rounded-lg"
                              />
                            ) : (
                              <a
                                href={msg.media_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-sm underline ${
                                  msg.sender_type === 'user' ? 'text-blue-200' : 'text-blue-600'
                                }`}
                              >
                                Ver archivo
                              </a>
                            )}
                          </div>
                        )}
                      </Card>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-end space-x-2">
                <Button variant="outline" size="sm" className="shrink-0">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe un mensaje..."
                    className="min-h-10 resize-none"
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                💬
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecciona una conversación
              </h3>
              <p className="text-gray-500">
                Elige una conversación del panel lateral para ver los mensajes
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
