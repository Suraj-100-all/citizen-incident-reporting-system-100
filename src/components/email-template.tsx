import * as React from 'react';

interface ReportEmailTemplateProps {
  reportId: string;
  category: string;
  description: string;
  location: string;
  reporterName: string;
  reporterPhone: string;
}

export const ReportEmailTemplate: React.FC<Readonly<ReportEmailTemplateProps>> = ({
  reportId,
  category,
  description,
  location,
  reporterName,
  reporterPhone,
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', color: '#333' }}>
    <h2 style={{ color: '#d97706' }}>नया घटना रिपोर्ट प्राप्त हुआ (New Incident Report)</h2>
    <div style={{ backgroundColor: '#fef3c7', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #d97706' }}>
      <p><strong>संदर्भ संख्या (Reference ID):</strong> {reportId}</p>
      <p><strong>श्रेणी (Category):</strong> {category}</p>
      <p><strong>स्थान (Location):</strong> {location}</p>
    </div>
    
    <div style={{ marginTop: '20px' }}>
      <p><strong>विवरण (Description):</strong></p>
      <p style={{ backgroundColor: '#f9fafb', padding: '10px', borderRadius: '4px' }}>{description}</p>
    </div>

    <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
      <p><strong>रिपोर्टर का नाम (Reporter Name):</strong> {reporterName}</p>
      <p><strong>मोबाइल नंबर (Phone):</strong> {reporterPhone}</p>
    </div>

    <div style={{ marginTop: '30px' }}>
      <a 
        href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/authority/dashboard`}
        style={{ 
          backgroundColor: '#d97706', 
          color: 'white', 
          padding: '10px 20px', 
          textDecoration: 'none', 
          borderRadius: '5px',
          fontWeight: 'bold'
        }}
      >
        डैशबोर्ड पर देखें (View on Dashboard)
      </a>
    </div>
  </div>
);
