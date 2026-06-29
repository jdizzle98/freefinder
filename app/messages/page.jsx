import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        setLoading(true);
        // Get conversations where the user is either poster or inquirer
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            *,
            listings (*),
            poster:users!poster_id (*),
            inquirer:users!inquirer_id (*),
            messages (*)
          `)
          .or(`poster_id.eq.${user.id},inquirer_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setConversations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('messages_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          // In a real app, we would update the specific conversation
          // For simplicity, we'll just refetch
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12">
        <div className="flex space-x-2">
          <div className="w-4 h-4 bg-green-600 rounded-full animate-pulse"></div>
          <div className="w-4 h-4 bg-green-600 rounded-full animate-pulse delay-100"></div>
          <div className="w-4 h-4 bg-green-600 rounded-full animate-pulse delay-200"></div>
        </div>
        <span className="ml-3 text-gray-600">Loading messages...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200">
          <div className="px-4 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No messages yet. Start a conversation by messaging a poster from a listing.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    currentUserId={user.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Conversation View */}
        <div className="flex-1 flex flex-col bg-gray-50">
          <div className="border-b border-gray-200">
            <div className="px-4 py-3">
              <h3 className="text-lg font-medium text-gray-900">Conversation</h3>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {/* Messages will go here */}
            <div className="text-center py-8">
              <p className="text-gray-500">Select a conversation to view messages</p>
            </div>
          </div>
          <div className="border-t border-gray-200">
            <div className="px-4 py-3">
              {/* Message input */}
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Conversation Item Component
function ConversationItem({ conversation, currentUserId }) {
  // Determine the other user in the conversation
  const otherUser = 
    conversation.poster_id === currentUserId 
      ? conversation.inquirer 
      : conversation.poster;

  // Get the last message
  const lastMessage = conversation.messages
    ? [...conversation.messages].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
    : null;

  return (
    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
      <div className="flex items-start space-x-3">
        {/* Other User's Avatar */}
        <div className="flex-shrink-0">
          <img
            src={otherUser?.avatar_url || '/default-avatar.png'}
            alt={`${otherUser?.name || 'User'}'s avatar`}
            className="w-10 h-10 rounded-full"
          />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-gray-900 truncate w-full">
                {otherUser?.name || 'Unknown User'}
              </h4>
              <p className="text-sm text-gray-500 line-clamp-1">
                {lastMessage ? (
                  <span className="truncate">
                    {lastMessage.content}
                  </span>
                ) : (
                  'No messages yet'
                )}
              </p>
            </div>
            <div className="text-xs text-gray-400 ml-3">
              {lastMessage ? (
                <span className="block">
                  {new Date(lastMessage.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              ) : (
                <span className="block">
                  {new Date(conversation.created_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
