// emails/new-fitting-owner.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface NewFittingOwnerEmailProps {
  ownerName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  fittingDate: string;
  fittingId: number;
  productNames: string[];
  note?: string;
  businessName?: string;
  dashboardUrl: string;
}

export const NewFittingOwnerEmail = ({
  ownerName,
  customerName,
  customerEmail,
  customerPhone,
  fittingDate,
  fittingId,
  productNames,
  note,
  businessName,

}: NewFittingOwnerEmailProps) => {
  const productList = productNames.length > 0 
    ? productNames.join(', ') 
    : 'No specific products selected';

  return (
    <Html>
      <Head />
      <Preview>New fitting appointment request from {customerName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>🎉 New Fitting Appointment Request</Heading>
            <Text style={text}>
              Hello {ownerName || businessName || 'Business Owner'},
            </Text>
          </Section>

          <Section style={content}>
            <Text style={text}>
              You have received a new fitting appointment request that requires your confirmation.
            </Text>

            <Section style={highlightBox}>
              <Heading as="h3" style={h3}>📅 Appointment Details</Heading>
              <Text style={infoText}>
                <strong>Fitting ID:</strong> #{fittingId}
              </Text>
              <Text style={infoText}>
                <strong>Date & Time:</strong> {fittingDate}
              </Text>
              <Text style={infoText}>
                <strong>Status:</strong> <span style={pendingStatus}>Pending Confirmation</span>
              </Text>
            </Section>

            <Section>
              <Heading as="h3" style={h3}>👤 Customer Information</Heading>
              <Text style={infoText}>
                <strong>Name:</strong> {customerName}
              </Text>
              <Text style={infoText}>
                <strong>Email:</strong> {customerEmail}
              </Text>
              {customerPhone && (
                <Text style={infoText}>
                  <strong>Phone:</strong> {customerPhone}
                </Text>
              )}
            </Section>

            <Section>
              <Heading as="h3" style={h3}>👗 Products for Fitting</Heading>
              <Text style={infoText}>{productList}</Text>
            </Section>

            {note && (
              <Section>
                <Heading as="h3" style={h3}>📝 Customer Notes</Heading>
                <Text style={infoText}>{note}</Text>
              </Section>
            )}

            <Section style={buttonContainer}>
              <Button style={button} href={"https://onrent.live/owner/fitting/schedule"}>
                View in Dashboard
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Please log in to your dashboard to confirm or reject this appointment.
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
  backgroundColor: '#f8f9fa',
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
  color: '#333',
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

const pendingStatus = {
  backgroundColor: '#fff3cd',
  color: '#856404',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: 'bold',
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

export default NewFittingOwnerEmail;