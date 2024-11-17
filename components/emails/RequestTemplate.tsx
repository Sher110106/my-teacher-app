// components/emails/RequestTemplate.tsx
import {
    Html,
    Head,
    Body,
    Container,
    Section,
    Text,
    Button,
    Link,
  } from '@react-email/components';
  
  interface RequestEmailProps {
    teacherName: string;
    schoolName: string;
    subject: string;
    schedule: {
      date: string;
      time: string;
    };
  }
  
  export const RequestTemplate = ({
    teacherName,
    schoolName,
    subject,
    schedule,
  }: RequestEmailProps) => {
    return (
      <Html>
        <Head />
        <Body style={{ fontFamily: 'system-ui' }}>
          <Container>
            <Section>
              <Text>Dear {teacherName},</Text>
              <Text>
                You have received a new teaching request from {schoolName} for the
                following:
              </Text>
              <Text>
                Subject: {subject}
                <br />
                Date: {schedule.date}
                <br />
                Time: {schedule.time}
              </Text>
              <Button
                href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/requests`}
                style={{ background: '#000', color: '#fff', padding: '12px 20px' }}
              >
                View Request
              </Button>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  };
  
  export default RequestTemplate;
  