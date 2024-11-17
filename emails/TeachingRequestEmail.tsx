import React from 'react';

interface EmailTemplateProps {
  teacherName: string;
  schoolName: string;
  subject: string;
  schedule?: any; // Define proper type based on your JSONB structure
}

const EmailTemplate = ({ teacherName, schoolName, subject, schedule }: EmailTemplateProps) => {
  return (
    <div>
      <h1>Teaching Request Update</h1>
      <p>Teacher: {teacherName}</p>
      <p>School: {schoolName}</p>
      <p>Subject: {subject}</p>
      {schedule && (
        <div>
          <p>Schedule Details:</p>
          <pre>{JSON.stringify(schedule, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default EmailTemplate;
