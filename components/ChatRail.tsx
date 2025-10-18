import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { ChatMessage } from '../types';
import { ChatUserContextMenu } from './ChatUserContextMenu';
import { FaceSmileIcon, PlayCircleIcon } from './icons';

interface ChatRailProps {
  session: Session | null;
  onClose?: () => void;
  onTipUser: (recipient: { id: string; username: string }) => void;
  onViewProfile: (userId: string) => void;
}

const EMOJI_CATEGORIES: Record<string, string[]> = {
  'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃'],
  'People': ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦵', '🦿', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁', '👅', '👄', '💋', '🩸'],
  'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛'],
  'Food': ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳'],
  'Objects': ['❤️', '💔', '🔥', '✨', '⭐', '💫', '💯', '💰', '💎', '👑', '💣', '💥', '🎉', '🎁', '🚀', '🛸', '💻', '📱', '💡', '💀', '🔑', '🔒', '🎲', '🎯', '🎮', '🎰'],
};

const GIF_LIST = [
  // Original GIFs
  'https://media.giphy.com/media/3o72FfM5HJydzafgUE/giphy.gif', // LOL what
  'https://media.giphy.com/media/26n6Gx9moCgs1pUuk/giphy.gif', // OK
  'https://media.giphy.com/media/3o6wNTC6U7sffE2i3K/giphy.gif', // Thanks
  'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif', // What?
  'https://media.giphy.com/media/26BRDHKiGS4pS5c6Q/giphy.gif', // Please
  'https://media.giphy.com/media/3o6ZtpxSZbQRR7bA4M/giphy.gif', // Hi
  'https://media.giphy.com/media/3o6ZtaAci85SelTuW4/giphy.gif', // Wow
  'https://media.giphy.com/media/3o7TKS6AWINqbg3x6M/giphy.gif', // No
  'https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif', // OMG
  'https://media.giphy.com/media/3oKIPEh5P3S42qNnkI/giphy.gif', // Yes
  'https://media.giphy.com/media/l0HlHFRbBJ3v1g70k/giphy.gif', // Congrats
  'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif', // Good luck

  // New GIFs
  'https://media.giphy.com/media/gVoBC0SuaHStq/giphy.gif', // Dancing Groot
  'https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif', // Spongebob Imagination
  'https://media.giphy.com/media/10UHeACse9w3Is/giphy.gif', // Homer Simpson disappears into hedge
  'https://media.giphy.com/media/vKHKDIdvxvN7vTAEOM/giphy.gif', // WandaVision wink
  'https://media.giphy.com/media/l4pTfx2qLszoacZRS/giphy.gif', // Salt Bae
  'https://media.giphy.com/media/fAnzw6YK33jMw/giphy.gif', // This is fine dog
  'https://media.giphy.com/media/xUPGcJ9uOAL2h5wA5a/giphy.gif', // Drake Hotline Bling
  'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif', // Roll Safe
  'https://media.giphy.com/media/d2Z4i1TGqC5_Ab8k/giphy.gif', // Confused Nick Young
  'https://media.giphy.com/media/xTiTnHXbRoaZ1B1Mo8/giphy.gif', // Michael Jackson popcorn
  'https://media.giphy.com/media/94EQmVHkveNck/giphy.gif', // Minions laughing
  'https://media.giphy.com/media/l4Ep6uxU6aedrYUik/giphy.gif', // Crying Jordan
  'https://media.giphy.com/media/yCdmeyPCU2b1C/giphy.gif', // Distracted boyfriend
  'https://media.giphy.com/media/3o7aD1zsNcOG26N9fy/giphy.gif', // Blinking guy
  'https://media.giphy.com/media/l41YqKTI3pFKuI9CE/giphy.gif', // Shia LaBeouf "Just Do It"
  'https://media.giphy.com/media/BzyTuYCmvSORqs1ABM/giphy.gif', // What? (The Office)
];

const MediaPicker: React.FC<{
  onEmojiSelect: (emoji: string) => void;
  onGifSelect: (gifUrl: string) => void;
}> = ({ onEmojiSelect, onGifSelect }) => {
  const [activeTab, setActiveTab] = useState<'emojis' | 'gifs'>('emojis');
  const [activeEmojiCategory, setActiveEmojiCategory] = useState(Object.keys(EMOJI_CATEGORIES)[0]);

  return (
    <div className="absolute bottom-full right-0 mb-2 bg-card border border-outline rounded-lg shadow-lg z-20 w-80 h-96 flex flex-col">
      <div className="flex-shrink-0 flex border-b border-outline">
        <button 
          onClick={() => setActiveTab('emojis')} 
          className={`flex-1 p-2 flex justify-center items-center transition-colors ${activeTab === 'emojis' ? 'bg-white/10 text-primary' : 'text-text-muted hover:bg-white/5'}`}
          aria-label="Show emojis"
        >
          <FaceSmileIcon className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setActiveTab('gifs')} 
          className={`flex-1 p-2 flex justify-center items-center transition-colors ${activeTab === 'gifs' ? 'bg-white/10 text-primary' : 'text-text-muted hover:bg-white/5'}`}
          aria-label="Show GIFs"
        >
          <PlayCircleIcon className="w-6 h-6" />
        </button>
      </div>

      {activeTab === 'emojis' && (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-shrink-0 flex space-x-1 p-2 overflow-x-auto no-scrollbar border-b border-outline">
            {Object.keys(EMOJI_CATEGORIES).map(category => (
              <button 
                key={category} 
                onClick={() => setActiveEmojiCategory(category)} 
                className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${activeEmojiCategory === category ? 'bg-primary text-background' : 'text-text-muted hover:bg-white/10'}`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <div className="grid grid-cols-8 gap-1">
              {EMOJI_CATEGORIES[activeEmojiCategory].map(emoji => (
                <button key={emoji} onClick={() => onEmojiSelect(emoji)} className="text-2xl rounded-md hover:bg-white/10 transition-colors p-1" aria-label={`Select emoji ${emoji}`}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'gifs' && (
        <div className="flex-1 overflow-y-auto p-2">
          <div className="grid grid-cols-2 gap-2">
            {GIF_LIST.map(gifUrl => (
              <button key={gifUrl} onClick={() => onGifSelect(gifUrl)} className="aspect-square rounded-md overflow-hidden hover:ring-2 ring-primary ring-offset-2 ring-offset-card" aria-label="Select GIF">
                <img src={gifUrl} alt="GIF" className="w-full h-full object-cover" loading="lazy"/>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


const Message: React.FC<{ msg: ChatMessage, onUserClick: (event: React.MouseEvent, user: { id: string, username: string }) => void }> = React.memo(({ msg, onUserClick }) => {
    const gifRegex = /^(https?:\/\/.+\.gif)$/i;
    const isGif = gifRegex.test(msg.message);
    
    return (
        <div className="flex items-start space-x-3 p-3 hover:bg-white/5 rounded-md">
            <button onClick={(e) => onUserClick(e, { id: msg.user_id, username: msg.profiles.username })} className="flex-shrink-0">
                <img src={msg.profiles.avatar_url || 'https://i.imgur.com/L4pP31z.png'} alt={msg.profiles.username} className="w-8 h-8 rounded-full mt-0.5" />
            </button>
            <div className="flex-1 min-w-0">
                <button
                  onClick={(e) => onUserClick(e, { id: msg.user_id, username: msg.profiles.username })}
                  className="font-bold text-sm text-primary-light hover:underline text-left"
                >
                  {msg.profiles.username}
                </button>
                {isGif ? (
                    <img src={msg.message} alt="GIF from user" className="mt-1 rounded-lg max-w-full h-auto" />
                ) : (
                    <p className="text-sm text-text-main/90 break-words">{msg.message}</p>
                )}
            </div>
        </div>
    );
});

export const ChatRail: React.FC<ChatRailProps> = ({ session, onClose, onTipUser, onViewProfile }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [channelName] = useState(() => `realtime-chat-${crypto.randomUUID()}`);
    const [contextMenu, setContextMenu] = useState<{ user: { id: string; username: string }, position: { x: number, y: number } } | null>(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const chatFormRef = useRef<HTMLDivElement>(null);

    // Anti-spam state
    const [canSendMessage, setCanSendMessage] = useState(true);
    const [messageTimestamps, setMessageTimestamps] = useState<number[]>([]);
    const [isMuted, setIsMuted] = useState(false);
    const [muteEndTime, setMuteEndTime] = useState(0);
    const [timeUntilUnmute, setTimeUntilUnmute] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

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
                    if (!profileData) return;
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
            .channel(channelName)
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

    const handleSendMessage = async (e?: React.FormEvent, contentOverride?: string) => {
        if (e) e.preventDefault();
        if (!session || !canSendMessage || isMuted || loading) return;

        const messageContent = contentOverride || newMessage.trim();
        if (messageContent === '') return;

        const now = Date.now();
        const recentTimestamps = [...messageTimestamps, now].filter(ts => now - ts < 5000);
        setMessageTimestamps(recentTimestamps);

        if (recentTimestamps.length > 4) {
            setIsMuted(true);
            setMuteEndTime(now + 10000);
            setMessageTimestamps([]);
            setNewMessage('');
            return;
        }

        setLoading(true);
        setCanSendMessage(false);

        if (!contentOverride) {
            setNewMessage('');
            setIsPickerOpen(false);
        }

        const { error } = await supabase.from('chat_messages').insert({
            user_id: session.user.id,
            message: messageContent,
        });
        
        setLoading(false);
        setTimeout(() => setCanSendMessage(true), 2000);

        if (error) {
            if (!contentOverride) {
                setNewMessage(messageContent);
            }
            console.error("Error sending message:", error);
        }
    };
    
    useEffect(() => {
        if (!isMuted) return;
        const interval = setInterval(() => {
            const timeLeft = Math.ceil((muteEndTime - Date.now()) / 1000);
            if (timeLeft <= 0) {
                setIsMuted(false);
                clearInterval(interval);
            } else {
                setTimeUntilUnmute(timeLeft);
            }
        }, 500);
        setTimeUntilUnmute(Math.ceil((muteEndTime - Date.now()) / 1000));
        return () => clearInterval(interval);
    }, [isMuted, muteEndTime]);
    
    const handleUserClick = (event: React.MouseEvent, user: { id: string; username: string }) => {
        event.preventDefault();
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        setContextMenu({
            user,
            position: { x: rect.left - 150, y: rect.top } 
        });
    };

    const handleIgnore = (userId: string) => {
        console.log(`Ignoring user ${userId}`);
    };

    const handleEmojiSelect = (emoji: string) => {
        setNewMessage(prev => prev + emoji);
        inputRef.current?.focus();
    };

    const handleGifSelect = (gifUrl: string) => {
        if (!session || !canSendMessage || isMuted || loading) return;
        handleSendMessage(undefined, gifUrl);
        setIsPickerOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (chatFormRef.current && !chatFormRef.current.contains(event.target as Node)) {
                setIsPickerOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

            <div ref={chatFormRef} className="p-4 flex-shrink-0">
                {session ? (
                     isMuted ? (
                        <div className="text-center text-sm text-red-400 p-4 bg-red-900/20 rounded-lg border border-red-500/30">
                            You are muted for spamming.
                            <br />
                            Please wait <span className="font-bold">{timeUntilUnmute}s</span>.
                        </div>
                    ) : (
                        <form onSubmit={handleSendMessage} className="relative">
                            {isPickerOpen && <MediaPicker onEmojiSelect={handleEmojiSelect} onGifSelect={handleGifSelect} />}
                            <input
                                ref={inputRef}
                                type="text"
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="w-full bg-background border border-border-color rounded-lg py-3 pl-4 pr-24 text-sm placeholder-text-muted focus:ring-2 focus:ring-primary focus:outline-none transition"
                            />
                             <div className="absolute inset-y-0 right-0 flex items-center">
                                 <button 
                                    type="button" 
                                    onClick={() => setIsPickerOpen(o => !o)} 
                                    className="px-3 text-text-muted hover:text-white"
                                    aria-label="Open emoji and GIF picker"
                                >
                                    <FaceSmileIcon className="w-6 h-6" />
                                 </button>
                                 <button
                                     type="submit"
                                     disabled={loading || !canSendMessage || newMessage.trim() === ''}
                                     className="px-3 text-primary disabled:text-text-muted"
                                     aria-label="Send message"
                                     title={!canSendMessage ? 'Sending too fast' : 'Send'}
                                 >
                                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                                 </button>
                             </div>
                        </form>
                    )
                ) : (
                    <div className="text-center text-sm text-text-muted p-4 bg-background rounded-lg">
                        Please <span className="font-bold text-primary">log in</span> to chat.
                    </div>
                )}
            </div>
        </div>
    );
};