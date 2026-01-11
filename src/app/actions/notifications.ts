"use server";

import * as React from 'react';
import { Resend } from 'resend';
import { ReportEmailTemplate } from '@/components/email-template';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReportNotification(report: {
  id: string;
  category: { name: string; email: string };
  description: string;
  location: string;
  reporterName: string;
  reporterPhone: string;
}) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_123')) {
    console.warn('RESEND_API_KEY is not set or invalid. Email notification skipped.');
    return { error: 'Email service not configured' };
  }

    try {
      const adminEmail = 'suraj100allinone@gmail.com';
      const adminPhone = '8181084451';
      
      // Attempt to send SMS (Mock)
      console.log(`[SMS-SUCCESS] To Reporter (${report.reporterPhone}): Your report ${report.id} received.`);
      console.log(`[SMS-SUCCESS] To Admin (${adminPhone}): New report ${report.id} in ${report.category.name}.`);
      
      const recipients: string[] = [adminEmail];
      
      // Only add category email if it's different and looks like a real test email
      // Note: Resend free tier (onboarding@resend.dev) ONLY sends to the owner's email.
      if (report.category.email && 
          report.category.email.includes('@') && 
          report.category.email !== adminEmail &&
          !report.category.email.endsWith('.gov.in')) { // Avoid gov.in placeholders which fail in free tier
        recipients.push(report.category.email);
      }

      console.log('Attempting to send email to:', recipients);

      const { data, error } = await resend.emails.send({
        from: 'Citizen Alert <onboarding@resend.dev>',
        to: recipients,
        subject: `New Incident Report: ${report.id} - ${report.category.name}`,
      react: React.createElement(ReportEmailTemplate, {
        reportId: report.id,
        category: report.category.name,
        description: report.description,
        location: report.location,
        reporterName: report.reporterName,
        reporterPhone: report.reporterPhone,
      }),
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
