import { Resend } from 'resend';
import { createClient } from "@/utils/supabase/server";
import { render } from '@react-email/render';
import EmailTemplate from '@/emails/TeachingRequestEmail';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  console.log('Supabase webhook received at:', new Date().toISOString());

  try {
    // Parse incoming request
    const payload = await req.json();
    console.log('Received payload:', payload);

    // Validate the payload structure
    const { type, record, table, schema } = payload;

    if (!type || !record) {
      console.error('Invalid webhook payload. Missing "type" or "record".');
      return new Response('Invalid webhook payload', { status: 400 });
    }

    // Log for debugging
    console.log(`Event type: ${type}, Table: ${table}, Schema: ${schema}`);
    console.log('Record:', record);

    // Initialize Supabase client
    const supabase = await createClient();
    console.log('Supabase client initialized');

    // Fetch teacher data
    const { data: teacherData, error: teacherError } = await supabase
    .from('teacher_profiles')
    .select('full_name, email')
    .eq('id', record.teacher_id)
    .single();
  
  // Fetch school data
  const { data: schoolData, error: schoolError } = await supabase
    .from('school_profiles')
    .select('school_name, email')
    .eq('id', record.school_id)
    .single();

    // Handle errors while fetching profiles
    if (teacherError || schoolError) {
      console.error('Error fetching profiles:', {
        teacherError,
        schoolError,
      });
      return new Response('Error processing webhook', { status: 500 });
    }

    console.log('Teacher data:', teacherData);
    console.log('School data:', schoolData);

    // Render email template
    console.log('Rendering email template...');
    const emailHTML = await render(
      EmailTemplate({
        teacherName: teacherData.full_name,
        schoolName: schoolData.school_name,
        subject: record.subject,
        schedule: record.schedule,
      })
    );
    console.log('Email HTML generated');

    // Handle request status and send email
    console.log('Processing request status:', record.status);

    try {
      switch (record.status) {
        case 'pending':
          console.log('Sending pending notification to teacher:', teacherData.email);
          await resend.emails.send({
            from: 'noreply@bugzer.tech',
            to: teacherData.email,
            subject: 'New Teaching Request',
            html: emailHTML,
          });
          break;

        case 'accepted':
          console.log('Sending acceptance notification to school:', schoolData.email);
          await resend.emails.send({
            from: 'noreply@bugzer.tech',
            to: schoolData.email,
            subject: 'Teaching Request Accepted',
            html: emailHTML,
          });
          break;

        case 'rejected':
          console.log('Sending rejection notification to school:', schoolData.email);
          await resend.emails.send({
            from: 'noreply@bugzer.tech',
            to: schoolData.email,
            subject: 'Teaching Request Declined',
            html: emailHTML,
          });
          break;

        default:
          console.warn('Unhandled status:', record.status);
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Allow webhook acknowledgment even if email fails
    }

    console.log('Webhook processed successfully');
    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
