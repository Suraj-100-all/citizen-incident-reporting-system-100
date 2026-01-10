import * as React from 'react';
import { Resend } from 'resend';
import { ReportEmailTemplate } from '@/components/email-template';

/**
 * Use a getter to avoid initialization error if API key is missing.
 */
const getResend = () => {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('re_123')) {
      return null;
    }
    return new Resend(apiKey);
  } catch (error) {
    console.error('Error initializing Resend:', error);
    return null;
  }
};

export async function sendReportNotification(report: {
  id: string;
  category: { name: string; email: string };
  description: string;
  location: string;
  reporterName: string;
  reporterPhone: string;
}) {
  const resend = getResend();
  
  if (!resend) {
    console.warn('RESEND_API_KEY is not set or invalid. Email notification skipped.');
    return { error: 'Email service not configured' };
  }

  try {
    const adminEmail = 'suraj100jaiswal100@gmail.com';
    
    // Resend free tier (onboarding@resend.dev) can ONLY send to the registered email.
    // We filter the 'to' list to ensure we don't include unverified addresses which would cause failure.
    const recipients = new Set<string>();
    recipients.add(adminEmail);
    
    // Only add category email if it's the admin email or if we want to risk it (not recommended on free tier)
    if (report.category.email === adminEmail) {
      recipients.add(report.category.email);
    }

    const { data, error } = await resend.emails.send({
      from: 'Citizen Alert <onboarding@resend.dev>',
      to: Array.from(recipients),
      subject: `New Incident Report: ${report.id} - ${report.category.name}`,
      react: (
        <ReportEmailTemplate
          reportId={report.id}
          category={report.category.name}
          description={report.description}
          location={report.location}
          reporterName={report.reporterName}
          reporterPhone={report.reporterPhone}
        />
      ),
    });

    if (error) {
      console.error('Resend API error:', error);
      return { error: error.message };
    }

    console.log('Email sent successfully:', data?.id);
    return { success: true, data };
  } catch (err: any) {
    console.error('Failed to send email via Server Action:', err);
    return { error: err.message };
  }
}
