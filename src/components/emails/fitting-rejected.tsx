// emails/fitting-rejected.tsx
import {
  Body,
  Button,
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

interface FittingRejectedEmailProps {
  customerName: string;
  ownerName: string;
  businessName?: string;
  fittingDate: string;
  fittingId: number;
  rejectionReason?: string;
  browseUrl: string;
}

export const FittingRejectedEmail = ({
  customerName,
  ownerName,
  businessName,
  fittingDate,
  fittingId,
  rejectionReason,
  browseUrl,
}: FittingRejectedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Update on your fitting appointment request</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Fitting Appointment Update</Heading>
            <Text style={text}>
              Hello {customerName},
            </Text>
          </Section>

          <Section style={content}>
            <Text style={text}>
              We regret to inform you that your fitting appointment request could not be accommodated at this time.
            </Text>

            <Section style={highlightBox}>
              <Heading as="h3" style={h3}>📅 Appointment Details</Heading>
              <Text style={infoText}>
                <strong>Fitting ID:</strong> #{fittingId}
              </Text>
              <Text style={infoText}>
                <strong>Requested Date & Time:</strong> {fittingDate}
              </Text>
              <Text style={infoText}>
                <strong>Business:</strong> {businessName || ownerName}
              </Text>
              <Text style={infoText}>
                <strong>Status:</strong> <span style={rejectedStatus}>Not Available</span>
              </Text>
            </Section>

            {rejectionReason && (
              <Section>
                <Heading as="h3" style={h3}>📝 Reason</Heading>
                <Text style={infoText}>{rejectionReason}</Text>
              </Section>
            )}

            <Text style={text}>
              We apologize for any inconvenience. Please feel free to:
            </Text>

            <ul style={list}>
              <li style={listItem}>Browse available time slots for a different date</li>
              <li style={listItem}>Contact the business directly for alternative arrangements</li>
              <li style={listItem}>Try booking with other available providers</li>
            </ul>

            <Section style={buttonContainer}>
              <Button style={button} href={browseUrl}>
                Browse Available Slots
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Thank you for your understanding.
            </Text>
            <Text style={footerText}>
              This is an automated message from your dress rental system.
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
  backgroundColor: '#f8d7da',
  borderRadius: '8px',
  marginBottom: '20px',
  padding: '20px',
};

const content = {
  padding: '20px',
};

const highlightBox = {
  backgroundColor: '#fff3cd',
  borderRadius: '4px',
  padding: '15px',
  margin: '15px 0',
};

const h1 = {
  color: '#721c24',
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

const rejectedStatus = {
  backgroundColor: '#f8d7da',
  color: '#721c24',
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

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#007bff',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
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

export default FittingRejectedEmail;