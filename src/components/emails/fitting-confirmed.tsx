// emails/fitting-confirmed.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface FittingConfirmedEmailProps {
  customerName: string;
  ownerName: string;
  businessName?: string;
  businessAddress?: string;
  ownerPhone?: string;
  fittingDate: string;
  fittingId: number;
  productNames: string[];
  note?: string;
}

export const FittingConfirmedEmail = ({
  customerName,
  ownerName,
  businessName,
  businessAddress,
  ownerPhone,
  fittingDate,
  fittingId,
  productNames,
  note,
}: FittingConfirmedEmailProps) => {
  const productList = productNames.length > 0 
    ? productNames.join(', ') 
    : 'Selected products';

  return (
    <Html>
      <Head />
      <Preview>Your fitting appointment has been confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>✅ Your Fitting Appointment is Confirmed!</Heading>
            <Text style={text}>
              Hello {customerName},
            </Text>
          </Section>

          <Section style={content}>
            <Text style={text}>
              Great news! Your fitting appointment has been confirmed by {businessName || ownerName}.
            </Text>

            <Section style={highlightBox}>
              <Heading as="h3" style={h3}>📅 Confirmed Appointment Details</Heading>
              <Text style={infoText}>
                <strong>Fitting ID:</strong> #{fittingId}
              </Text>
              <Text style={infoText}>
                <strong>Date & Time:</strong> {fittingDate}
              </Text>
              <Text style={infoText}>
                <strong>Status:</strong> <span style={confirmedStatus}>Confirmed</span>
              </Text>
            </Section>

            <Section>
              <Heading as="h3" style={h3}>🏪 Business Information</Heading>
              <Text style={infoText}>
                <strong>Business:</strong> {businessName || ownerName}
              </Text>
              {businessAddress && (
                <Text style={infoText}>
                  <strong>Address:</strong> {businessAddress}
                </Text>
              )}
              {ownerPhone && (
                <Text style={infoText}>
                  <strong>Contact:</strong> {ownerPhone}
                </Text>
              )}
            </Section>

            <Section>
              <Heading as="h3" style={h3}>👗 Products for Fitting</Heading>
              <Text style={infoText}>{productList}</Text>
            </Section>

            {note && (
              <Section>
                <Heading as="h3" style={h3}>📝 Additional Notes</Heading>
                <Text style={infoText}>{note}</Text>
              </Section>
            )}

            <Section style={reminderBox}>
              <Heading as="h4" style={h4}>⏰ Important Reminders:</Heading>
              <ul style={list}>
                <li style={listItem}>Please arrive 5-10 minutes before your scheduled time</li>
                <li style={listItem}>Bring a valid ID for verification</li>
                <li style={listItem}>Wear appropriate undergarments for fitting</li>
                <li style={listItem}>Contact the business if you need to reschedule</li>
              </ul>
            </Section>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              We look forward to seeing you at your fitting appointment!
            </Text>
            <Text style={footerText}>
              This is an automated confirmation from your dress rental system.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  borderRadius: '8px',
  margin: '40px auto',
  padding: '20px',
  width: '465px',
};

const header = {
  backgroundColor: '#d4edda',
  borderRadius: '8px',
  marginBottom: '20px',
  padding: '20px',
};

const content = {
  padding: '20px',
};

const highlightBox = {
  backgroundColor: '#e7f3ff',
  borderRadius: '4px',
  padding: '15px',
  margin: '15px 0',
};

const reminderBox = {
  backgroundColor: '#fff3cd',
  borderRadius: '4px',
  padding: '15px',
  margin: '20px 0',
};

const h1 = {
  color: '#155724',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 15px',
  textAlign: 'left' as const,
};

const h3 = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '20px 0 10px',
};

const h4 = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 10px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 10px',
};

const infoText = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '8px 0',
};

const confirmedStatus = {
  backgroundColor: '#d4edda',
  color: '#155724',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: 'bold',
};

const list = {
  paddingLeft: '20px',
  margin: '10px 0',
};

const listItem = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '5px 0',
};

const hr = {
  border: 'none',
  borderTop: '1px solid #eaeaea',
  margin: '26px 0',
  width: '100%',
};

const footer = {
  color: '#6c757d',
  fontSize: '12px',
  textAlign: 'center' as const,
};

const footerText = {
  margin: '0 0 10px',
};

export default FittingConfirmedEmail;