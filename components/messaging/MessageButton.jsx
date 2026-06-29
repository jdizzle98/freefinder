import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';

export default function MessageButton({ listingId, posterId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert('Please log in to send a message');
        return;
      }

      // Check if a conversation already exists for this listing and these two users
      const { data: existingConversation, error: fetchError } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listingId)
        .or(`poster_id.eq.${posterId},inquirer_id.eq.${posterId}`)
        .eq('poster_id', posterId) // Assuming posterId is the owner of the listing
        .eq('inquirer_id', user.id)
        .single();

      let conversationId;
      if (existingConversation && !fetchError) {
        conversationId = existingConversation.id;
      } else {
        // Create a new conversation
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            listing_id: listingId,
            poster_id: posterId,
            inquirer_id: user.id,
          })
          .select()
          .single();

        if (createError) throw createError;
        conversationId = newConversation.id;
      }

      // Navigate to the conversation page
      // We'll assume we have a route like /messages/[conversationId]
      // For now, we'll just alert the conversation ID
      alert(`Redirecting to conversation ${conversationId}`);
      // In a real app, we would use router.push(`/messages/${conversationId}`);
    } catch (err) {
      setError(err.message);
      alert('Failed to start conversation: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors`}
    >
      {loading ? 'Sending...' : 'Message Poster'}
    </button>
  );
}
