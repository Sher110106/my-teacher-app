'use client';

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";

interface TeachingRequest {
  id: string;
  school_id: string;
  teacher_id: string;
  status: string;
  created_at: string;
  school: {
    school_name: string;
    location: string;
    curriculum_type: string;
  };
}

export function TeachingRequestsList({ 
  initialRequests 
}: { 
  initialRequests: TeachingRequest[] 
}) {
  const [requests, setRequests] = useState<TeachingRequest[]>(initialRequests);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  // Get current user on mount
  useEffect(() => {
    async function getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Filter initial requests for current user
        setRequests(initialRequests.filter(req => req.teacher_id === user.id));
      }
    }
    getCurrentUser();
  }, [initialRequests]);

  const handleStatusUpdate = async (requestId: string, newStatus: 'accepted' | 'rejected') => {
    if (!userId) return;
    
    setLoading(prev => ({ ...prev, [requestId]: true }));
    
    try {
      const { error } = await supabase
        .from('teaching_requests')
        .update({ status: newStatus })
        .eq('id', requestId)
        .eq('teacher_id', userId); // Ensure teacher can only update their own requests

      if (error) throw error;

      // Update local state
      setRequests(prev =>
        prev.map(request =>
          request.id === requestId
            ? { ...request, status: newStatus }
            : request
        )
      );
    } catch (error) {
      console.error('Error updating request status:', error);
    } finally {
      setLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('teaching_requests')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'teaching_requests',
        },
        async (payload) => {
          // Only add if the new request belongs to the current teacher
          if (payload.new.teacher_id !== userId) return;

          const { data: newRequest, error } = await supabase
            .from('teaching_requests')
            .select(`
              *,
              school:school_profiles(
                school_name,
                location,
                curriculum_type
              )
            `)
            .eq('id', payload.new.id)
            .eq('teacher_id', userId)
            .single();

          if (error) {
            console.error('Error fetching new request:', error);
            return;
          }

          setRequests(prev => [...prev, newRequest]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'teaching_requests',
        },
        async (payload) => {
          // Only update if the request belongs to the current teacher
          if (payload.new.teacher_id !== userId) return;

          setRequests(prev =>
            prev.map(request =>
              request.id === payload.new.id ? { ...request, ...payload.new } : request
            )
          );
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase, userId]);

  if (!userId) {
    return <div className="text-center py-8 text-gray-500">Please sign in to view your teaching requests</div>;
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div
          key={request.id}
          className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">
                {request.school.school_name}
              </h3>
              <p className="text-gray-600">
                {request.school.location} • {request.school.curriculum_type}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Received {format(new Date(request.created_at), 'PPp')}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  request.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : request.status === 'accepted'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
              
              {request.status === 'pending' && (
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate(request.id, 'rejected')}
                    disabled={loading[request.id]}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(request.id, 'accepted')}
                    disabled={loading[request.id]}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Accept
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {requests.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No teaching requests yet
        </div>
      )}
    </div>
  );
}