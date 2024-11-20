// app/(dashboard)/teacher/page.tsx
import { TeachingRequestsList } from '@/components/TeachingRequestsProvider';
import { createClient } from "@/utils/supabase/server";

export default async function TeacherDashboard() {
  const supabase = await createClient();

  // Fetch initial requests
  const { data: initialRequests } = await supabase
    .from('teaching_requests')
    .select(`
      *,
      school:school_profiles(
        school_name,
        location,
        curriculum_type
      )
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Teaching Requests</h1>
      <TeachingRequestsList initialRequests={initialRequests || []} />
    </div>
  );
}