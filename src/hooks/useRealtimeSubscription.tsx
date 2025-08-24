import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeSubscriptionOptions {
  table: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  onChange?: (payload: any) => void;
}

export const useRealtimeSubscription = ({
  table,
  onInsert,
  onUpdate,
  onDelete,
  onChange
}: UseRealtimeSubscriptionOptions) => {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const channel = supabase.channel(`${table}-realtime-${Math.random()}`);

    // Listen to all events if onChange is provided
    if (onChange) {
      channel.on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table 
      }, (payload) => {
        console.log(`Real-time change in ${table}:`, payload);
        onChange(payload);
      });
    } else {
      // Listen to specific events
      if (onInsert) {
        channel.on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table 
        }, onInsert);
      }
      
      if (onUpdate) {
        channel.on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table 
        }, onUpdate);
      }
      
      if (onDelete) {
        channel.on('postgres_changes', { 
          event: 'DELETE', 
          schema: 'public', 
          table 
        }, onDelete);
      }
    }

    channel.subscribe((status) => {
      console.log(`Real-time subscription status for ${table}:`, status);
    });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, onInsert, onUpdate, onDelete, onChange]);

  return channelRef.current;
};