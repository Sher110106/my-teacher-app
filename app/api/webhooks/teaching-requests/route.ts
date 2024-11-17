import { headers } from 'next/headers';
import { Resend } from 'resend';
import crypto from 'crypto';
import { createClient } from "@/utils/supabase/server";
import { render } from '@react-email/render';
import EmailTemplate from '@/emails/TeachingRequestEmail';

const resend = new Resend(process.env.RESEND_API_KEY!);

function isValidSignature(signature: string, payload: string, secret: string): boolean {
  console.log('Validating signature...');
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('base64');
  const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hmac));
  console.log('Signature validation result:', isValid);
  return isValid;
}

export async function POST(req: Request) {
  console.log('Webhook received at:', new Date().toISOString());
  
  try {
    // Get headers and signature
    const headersList = await headers();
    const signature = headersList.get('x-signature');
    console.log('Received headers:', Object.fromEntries(headersList.entries()));
    console.log('Signature:', signature);

    // Initialize Supabase client
    console.log('Initializing Supabase client...');
    const supabase = await createClient();

    // Get and parse request body
    const body = await req.text();
    console.log('Raw request body:', body);
    
    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
      console.log('Parsed request body:', parsedBody);
    } catch (error) {
      console.error('JSON parsing error:', error);
      return new Response('Invalid JSON body', { status: 400 });
    }

    // Fetch webhook secret
    console.log('Fetching webhook secret...');
    const { data: secretData, error: secretError } = await supabase
      .from('config')
      .select('value')
      .eq('key', 'webhook_secret')
      .single();

    if (secretError || !secretData) {
      console.error('Error fetching webhook secret:', secretError?.message || 'No secret found');
      return new Response('Internal server error while fetching secret', { status: 500 });
    }
    console.log('Webhook secret fetched successfully');

    // Validate signature
    const secret = secretData.value;
    if (!signature || !isValidSignature(signature, body, secret)) {
      console.error('Invalid signature received');
      return new Response('Invalid signature', { status: 401 });
    }
    console.log('Signature validated successfully');

    // Destructure payload
    const { record, type } = parsedBody;
    console.log('Processing webhook type:', type);
    console.log('Record:', record);

    // Fetch teacher data
    console.log('Fetching teacher data...');
    const { data: teacherData, error: teacherError } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', record.teacher_id)
      .single();

    // Fetch school data
    console.log('Fetching school data...');
    const { data: schoolData, error: schoolError } = await supabase
      .from('profiles')
      .select('school_name, email')
      .eq('id', record.school_id)
      .single();

    if (teacherError || schoolError) {
      console.error('Error fetching profiles:', {
        teacherError,
        schoolError
      });
      return new Response('Error processing webhook', { status: 500 });
    }

    console.log('Teacher data:', teacherData);
    console.log('School data:', schoolData);

    // Render email template
    console.log('Rendering email template...');
    const emailHTML = await render(EmailTemplate({
      teacherName: teacherData.full_name,
      schoolName: schoolData.school_name,
      subject: record.subject,
      schedule: record.schedule
    }));
    console.log('Email HTML generated');

    // Send appropriate email based on status
    console.log('Processing request status:', record.status);
    try {
      switch (record.status) {
        case 'pending':
          console.log('Sending pending notification to teacher:', teacherData.email);
          const pendingResult = await resend.emails.send({
            from: 'noreply@bugzer.tech',
            to: teacherData.email,
            subject: 'New Teaching Request',
            html: emailHTML,
          });
          console.log('Pending email sent successfully:', pendingResult);
          break;

        case 'accepted':
          console.log('Sending acceptance notification to school:', schoolData.email);
          const acceptedResult = await resend.emails.send({
            from: 'noreply@bugzer.tech',
            to: schoolData.email,
            subject: 'Teaching Request Accepted',
            html: emailHTML,
          });
          console.log('Acceptance email sent successfully:', acceptedResult);
          break;

        case 'rejected':
          console.log('Sending rejection notification to school:', schoolData.email);
          const rejectedResult = await resend.emails.send({
            from: 'noreply@bugzer.tech',
            to: schoolData.email,
            subject: 'Teaching Request Declined',
            html: emailHTML,
          });
          console.log('Rejection email sent successfully:', rejectedResult);
          break;

        default:
          console.warn('Unhandled request status:', record.status);
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      // Don't return error response here - we still want to acknowledge the webhook
      // Just log the error and continue
    }

    console.log('Webhook processed successfully');
    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}