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

interface ReturnRequestOwnerEmailProps {
  ownerName: string;
  customerName: string;
  rentalCode: string;
  productNames: string[];
  dashboardUrl: string;
}

export const ReturnRequestOwnerEmail = ({
  ownerName,
  customerName,
  rentalCode,
  productNames,
  dashboardUrl,
}: ReturnRequestOwnerEmailProps) => {
  const productList = productNames.join(', ');

  return (
    <Html>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Permintaan Pengembalian Barang - {rentalCode}</title>
         <style>
          {`
            @media only screen and (max-width: 600px) {
              .container { width: 100% !important; padding: 10px !important; }
              .card { padding: 15px !important; }
              .hero-title { font-size: 22px !important; }
              .primary-button { width: 100% !important; }
            }
          `}
        </style>
      </Head>
      <Preview>Konfirmasi pengembalian untuk rental #{rentalCode}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={heroSection}>
            <Heading style={heroTitle} className="hero-title">📦 Barang Telah Dikembalikan</Heading>
            <Text style={heroSubtitle}>
              Pelanggan telah mengembalikan barang rental. Mohon konfirmasi penerimaan.
            </Text>
          </Section>

          <Section style={contentSection}>
            <Text style={greetingText}>
              Halo, <strong>{ownerName}</strong>!
            </Text>
            <Text style={introText}>
              Pelanggan Anda, <strong>{customerName}</strong>, telah menandai barang untuk rental dengan kode <strong>#{rentalCode}</strong> sebagai "telah dikembalikan".
            </Text>

            <Section style={card}>
              <Text style={cardTitleText}>Produk yang Dikembalikan</Text>
              <Text style={productText}>{productList}</Text>
            </Section>

            <Text style={actionText}>
              Silakan periksa kondisi barang dan segera lakukan konfirmasi pengembalian di dashboard Anda untuk menyelesaikan proses rental.
            </Text>

            <Section style={buttonSection}>
              <Button style={primaryButton} href={dashboardUrl}>
                Konfirmasi Pengembalian
              </Button>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Salam hangat,<br />
              <strong>Tim OnRent</strong>
            </Text>
             <Text style={copyrightText}>
              © {new Date().getFullYear()} OnRent. Hak cipta dilindungi undang-undang.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};


// Consistent styling
const main: React.CSSProperties = {
  backgroundColor: '#f8f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};
const container: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '20px',
};
const heroSection: React.CSSProperties = {
  background: 'linear-gradient(to right, #3b82f6, #2563eb)',
  borderRadius: '16px',
  padding: '40px 20px',
  textAlign: 'center',
  marginBottom: '20px',
};
const heroTitle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 10px',
};
const heroSubtitle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '16px',
  margin: '0',
};
const contentSection: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  padding: '30px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
};
const greetingText: React.CSSProperties = {
  color: '#374151',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 10px',
};
const introText: React.CSSProperties = {
  color: '#4b5563',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 25px',
};
const card: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '20px',
  margin: '0 0 20px',
};
const cardTitleText: React.CSSProperties = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 15px',
};
const productText: React.CSSProperties = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
};
const actionText: React.CSSProperties = {
  color: '#4b5563',
  fontSize: '15px',
  lineHeight: '1.6',
  textAlign: 'center',
  margin: '0 0 25px',
};
const buttonSection: React.CSSProperties = {
  textAlign: 'center',
  margin: '25px 0',
};
const primaryButton: React.CSSProperties = {
  background: 'linear-gradient(to right, #3b82f6, #2563eb)',
  borderRadius: '25px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  padding: '12px 30px',
};
const footer: React.CSSProperties = {
  textAlign: 'center',
  marginTop: '20px',
};
const footerText: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.5',
};
const copyrightText: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '15px 0 0',
};

export default ReturnRequestOwnerEmail;
