import { headers } from 'next/headers';
import { Resend } from 'resend';
import crypto from 'crypto';
import { createClient } from "@/utils/supabase/server";
import { render } from '@react-email/render';
import EmailTemplate from '@/emails/TeachingRequestEmail';

const resend = new Resend(process.env.RESEND_API_KEY!);

function isValidSignature(signature: string, payload: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hmac));
}

export async function POST(req: Request) {
  const headersList = await headers();
  const signature = headersList.get('x-signature');
  const supabase = await createClient();

  const body = await req.text();
  let parsedBody;
  try {
    parsedBody = JSON.parse(body);
  } catch (error) {
    return new Response('Invalid JSON body', { status: 400 });
  }

  try {
    const { data: secretData, error: secretError } = await supabase
      .from('config')
      .select('value')
      .eq('key', 'webhook_secret')
      .single();

    if (secretError || !secretData) {
      console.error('Error fetching webhook secret:', secretError?.message || 'No secret found');
      return new Response('Internal server error while fetching secret', { status: 500 });
    }

    const secret = secretData.value;

    if (!signature || !isValidSignature(signature, body, secret)) {
      return new Response('Invalid signature', { status: 401 });
    }

    const { record, type } = parsedBody;

    const { data: teacherData, error: teacherError } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', record.teacher_id)
      .single();

    const { data: schoolData, error: schoolError } = await supabase
      .from('profiles')
      .select('school_name, email')
      .eq('id', record.school_id)
      .single();

    if (teacherError || schoolError) {
      console.error('Error fetching profiles:', teacherError || schoolError);
      return new Response('Error processing webhook', { status: 500 });
    }

    const emailHTML = await render(EmailTemplate({
        teacherName: teacherData.full_name,
        schoolName: schoolData.school_name,
        subject: record.subject,
        schedule: record.schedule
    }));

    switch (record.status) {
      case 'pending':
        await resend.emails.send({
          from: 'noreply@yourdomain.com',
          to: teacherData.email,
          subject: 'New Teaching Request',
          html: emailHTML,
        });
        break;

      case 'accepted':
        await resend.emails.send({
          from: 'noreply@yourdomain.com',
          to: schoolData.email,
          subject: 'Teaching Request Accepted',
          html: emailHTML,
        });
        break;

      case 'rejected':
        await resend.emails.send({
          from: 'noreply@yourdomain.com',
          to: schoolData.email,
          subject: 'Teaching Request Declined',
          html: emailHTML,
        });
        break;
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
