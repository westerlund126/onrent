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
    : 'Tidak ada produk spesifik dipilih';

  return (
    <Html>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Preview>Permintaan fitting baru dari {customerName}</Preview>
      <Body style={main}>
        <Container style={container}>

          {/* Hero Section */}
          <Section style={heroSection}>
            <Img
              src="https://res.cloudinary.com/dpiq28w1p/image/upload/v1754232730/logo_k67xni.png"
              width="120"
              height="60"
              alt="OnRent Logo"
              style={{ margin: 'auto' }}
            />
            <Heading style={heroTitle}>Permintaan Fitting Baru!</Heading>
            <Text style={heroSubtitle}>
              Anda memiliki janji temu baru yang menunggu konfirmasi
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Text style={greetingText}>
              Halo {ownerName || businessName || 'Pemilik Bisnis'} !
            </Text>

            {/* Appointment Details */}
            <Section style={card}>
              <div style={cardHeaderWithBadge}>
                <Text style={cardTitleText}>📅 Detail Janji Temu</Text>
              </div>
              
              <table style={detailTable}>
                <tr>
                  <td style={labelCell}>Tanggal & Waktu</td>
                  <td style={valueCell}>{fittingDate}</td>
                </tr>
              </table>
            </Section>

            {/* Customer Info */}
            <Section style={card}>
              <Text style={cardTitleText}>👤 Informasi Pelanggan</Text>
              
              <table style={detailTable}>
                <tr>
                  <td style={labelCell}>Nama</td>
                  <td style={valueCell}>{customerName}</td>
                </tr>
                <tr>
                  <td style={labelCell}>Email</td>
                  <td style={valueCell}>{customerEmail}</td>
                </tr>
                {customerPhone && (
                  <tr>
                    <td style={labelCell}>Telepon</td>
                    <td style={valueCell}>{customerPhone}</td>
                  </tr>
                )}
              </table>
            </Section>

            {/* Products */}
            <Section style={card}>
              <Text style={cardTitleText}>👗 Produk untuk Fitting</Text>
              <Text style={productText}>{productList}</Text>
            </Section>

            {/* Notes (if exists) */}
            {note && (
              <Section style={card}>
                <Text style={cardTitleText}>📝 Catatan Pelanggan</Text>
                <Text style={noteText}>{note}</Text>
              </Section>
            )}

            {/* Action Button */}
            <Section style={buttonSection}>
              <Button style={primaryButton} href="https://onrent.live/owner/fitting/schedule">
                Lihat di Dashboard
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Silakan masuk ke dashboard Anda untuk mengonfirmasi atau menolak janji temu ini.
            </Text>
            <Text style={footerText}>
              Ini adalah pesan otomatis dari OnRent.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Responsive Styles
const main = {
  backgroundColor: '#f8f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  padding: '20px 10px',
  margin: '0',
  width: '100%',
};

const container = {
  backgroundColor: 'transparent',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  width: '100%',
};

const headerSection = {
  textAlign: 'center' as const,
  padding: '20px 0 10px',
};

const logo = {
  margin: '0 auto',
  display: 'block',
};

const heroSection = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: '16px',
  padding: '40px 20px',
  textAlign: 'center' as const,
  margin: '0 10px 20px',
};

const heroIcon = {
  margin: '0 auto 20px',
  display: 'block',
  filter: 'brightness(0) invert(1)',
};

const heroTitle = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 10px',
  textAlign: 'center' as const,
  lineHeight: '1.3',
};

const heroSubtitle = {
  color: '#e2e8f0',
  fontSize: '16px',
  margin: '0',
  lineHeight: '1.4',
};

const contentSection = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  margin: '0 10px',
  padding: '30px 20px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
};

const greetingText = {
  color: '#374151',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 25px',
};

const card = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '20px',
  margin: '15px 0',
};

const cardHeaderWithBadge = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '15px',
  flexWrap: 'wrap' as const,
  gap: '10px',
};

const cardTitleText = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 15px',
};

const statusBadge = {
  backgroundColor: '#fef3c7',
  borderRadius: '20px',
  padding: '4px 12px',
  display: 'inline-block',
};

const statusText = {
  color: '#92400e',
  fontSize: '11px',
  fontWeight: 'bold',
  margin: '0',
  textTransform: 'uppercase' as const,
};

const detailTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  margin: '0',
};

const labelCell = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '500',
  padding: '8px 0',
  borderBottom: '1px solid #e5e7eb',
  width: '40%',
  verticalAlign: 'top' as const,
};

const valueCell = {
  color: '#111827',
  fontSize: '14px',
  fontWeight: '600',
  padding: '8px 0',
  borderBottom: '1px solid #e5e7eb',
  textAlign: 'right' as const,
  verticalAlign: 'top' as const,
};

const productText = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
  padding: '15px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
};

const noteText = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
  padding: '15px',
  backgroundColor: '#fffbeb',
  borderRadius: '8px',
  border: '1px solid #fbbf24',
  fontStyle: 'italic',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '30px 0 20px',
};

const primaryButton = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: '25px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 30px',
  border: 'none',
  cursor: 'pointer',
  minWidth: '200px',
};

const footer = {
  backgroundColor: '#f9fafb',
  borderRadius: '12px',
  margin: '20px 10px',
  padding: '20px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#6b7280',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '0 0 8px',
};

export default NewFittingOwnerEmail;