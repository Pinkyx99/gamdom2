import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { ChatMessage } from '../types';
import { ChatUserContextMenu } from './ChatUserContextMenu';

interface ChatRailProps {
  session: Session | null;
  onClose?: () => void;
  onTipUser: (recipient: { id: string; username: string }) => void;
  onViewProfile: (userId: string) => void;
}

const Message: React.FC<{ msg: ChatMessage, onUserClick: (event: React.MouseEvent, user: { id: string, username: string }) => void }> = React.memo(({ msg, onUserClick }) => (
    <div className="flex items-start space-x-3 p-3 hover:bg-white/5 rounded-md">
        <button onClick={(e) => onUserClick(e, { id: msg.user_id, username: msg.profiles.username })} className="flex-shrink-0">
            <img src={msg.profiles.avatar_url || 'https://i.imgur.com/L4pP31z.png'} alt={msg.profiles.username} className="w-8 h-8 rounded-full mt-0.5" />
        </button>
        <div className="flex-1">
            <button
              onClick={(e) => onUserClick(e, { id: msg.user_id, username: msg.profiles.username })}
              className="font-bold text-sm text-primary-light hover:underline text-left"
            >
              {msg.profiles.username}
            </button>
            <p className="text-sm text-text-main/90 break-words">{msg.message}</p>
        </div>
    </div>
));

export const ChatRail: React.FC<ChatRailProps> = ({ session, onClose, onTipUser, onViewProfile }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [channelName] = useState(() => `realtime-chat-${crypto.randomUUID()}`);
    const [contextMenu, setContextMenu] = useState<{ user: { id: string; username: string }, position: { x: number, y: number } } | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        const handleNewMessage = (payload: any) => {
            const newMsg = payload.new as Omit<ChatMessage, 'profiles'> & { id: string; user_id: string };
            
            supabase
                .from('profiles')
                .select('username, avatar_url')
                .eq('id', newMsg.user_id)
                .single()
                .then(({ data: profileData }) => {
                    if (!profileData) return; // Don't add messages for non-existent profiles
                    const finalMessage: ChatMessage = {
                        ...newMsg,
                        profiles: profileData
                    };
                    
                    setMessages(currentMessages => {
                        if (currentMessages.some(msg => msg.id === finalMessage.id)) {
                            return currentMessages;
                        }
                        return [...currentMessages, finalMessage];
                    });
                });
        };

        const channel = supabase
            .channel(channelName) // Use the unique channel name
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chat_messages' },
                handleNewMessage
            )
            .subscribe(async (status, err) => {
                if (err) {
                     console.error(`Real-time chat subscription error on channel ${channelName}:`, err);
                     return;
                }
                
                if (status === 'SUBSCRIBED') {
                    const { data, error } = await supabase
                        .from('chat_messages')
                        .select(`*, profiles(username, avatar_url)`)
                        .order('created_at', { ascending: true })
                        .limit(100);
                    
                    if (error) {
                        console.error("Error fetching initial messages:", error);
                    } else if (data) {
                        setMessages(data as any);
                    }
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [channelName]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session || newMessage.trim() === '') return;

        setLoading(true);
        const messageContent = newMessage.trim();
        setNewMessage('');

        const { error } = await supabase.from('chat_messages').insert({
            user_id: session.user.id,
            message: messageContent,
        });
        
        setLoading(false);

        if (error) {
            setNewMessage(messageContent);
            console.error("Error sending message:", error);
        }
    };
    
    const handleUserClick = (event: React.MouseEvent, user: { id: string; username: string }) => {
        event.preventDefault();
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        // Position menu relative to viewport
        setContextMenu({
            user,
            position: { x: rect.left - 150, y: rect.top } 
        });
    };

    const handleIgnore = (userId: string) => {
        console.log(`Ignoring user ${userId}`); // Placeholder for ignore functionality
    };

    return (
        <div className="bg-sidebar h-full flex flex-col border-l border-border-color">
            {contextMenu && (
                <ChatUserContextMenu
                    user={contextMenu.user}
                    position={contextMenu.position}
                    onClose={() => setContextMenu(null)}
                    onProfile={onViewProfile}
                    onTip={onTipUser}
                    onIgnore={handleIgnore}
                />
            )}
            <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-border-color">
                <div>
                    <h2 className="font-bold text-white">Chat</h2>
                    <div className="flex items-center space-x-1.5 text-xs text-text-muted">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span>2,345 Online</span>
                    </div>
                </div>
                {onClose && (
                     <button onClick={onClose} className="p-2 text-text-muted hover:text-white xl:hidden" aria-label="Close chat">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                )}
            </header>
            
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-2">
                {messages.map(msg => (
                    <Message key={msg.id} msg={msg} onUserClick={handleUserClick} />
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 flex-shrink-0">
                {session ? (
                    <form onSubmit={handleSendMessage} className="relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full bg-background border border-border-color rounded-lg py-3 pl-4 pr-12 text-sm placeholder-text-muted focus:ring-2 focus:ring-primary focus:outline-none transition"
                        />
                         <button type="submit" disabled={loading} className="absolute inset-y-0 right-0 flex items-center pr-3 text-primary disabled:text-text-muted">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                         </button>
                    </form>
                ) : (
                    <div className="text-center text-sm text-text-muted p-4 bg-background rounded-lg">
                        Please <span className="font-bold text-primary">log in</span> to chat.
                    </div>
                )}
            </div>
        </div>
    );
};