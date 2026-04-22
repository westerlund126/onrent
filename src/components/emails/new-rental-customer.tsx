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
  Link,
} from '@react-email/components';
import * as React from 'react';

interface ProductDetail {
  name: string;
  variant: string;
}

interface NewRentalCustomerEmailProps {
  customerName: string;
  ownerName: string;
  businessName?: string;
  rentalCode: string;
  startDate: string;
  endDate: string;
  productDetails: ProductDetail[];
  rentalUrl: string;
  additionalInfo?: string;
}

export const NewRentalCustomerEmail = ({
  customerName,
  ownerName,
  businessName,
  rentalCode,
  startDate,
  endDate,
  productDetails,
  rentalUrl,
  additionalInfo,
}: NewRentalCustomerEmailProps) => {
  const productList = productDetails.map(p => `${p.name} (${p.variant})`).join(', ');

  return (
    <Html>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Konfirmasi Rental Baru - {rentalCode}</title>
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
      <Preview>Rental Anda dengan kode {rentalCode} telah dikonfirmasi!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={heroSection}>
            <Heading style={heroTitle} className="hero-title">✅ Rental Dikonfirmasi!</Heading>
            <Text style={heroSubtitle}>
              Pesanan rental Anda telah berhasil dibuat.
            </Text>
          </Section>

          <Section style={contentSection}>
            <Text style={greetingText}>
              Halo, <strong>{customerName}</strong>!
            </Text>
            <Text style={introText}>
              Terima kasih telah melakukan rental melalui OnRent. Berikut adalah detail pesanan Anda dari <strong>{businessName || ownerName}</strong>.
            </Text>

            <Section style={card}>
              <Text style={cardTitleText}>📦 Detail Rental</Text>
              <table style={detailTable}>
                <tbody>
                  <tr>
                    <td style={labelCell}>Kode Rental</td>
                    <td style={valueCell}>{rentalCode}</td>
                  </tr>
                  <tr>
                    <td style={labelCell}>Tanggal Mulai</td>
                    <td style={valueCell}>{startDate}</td>
                  </tr>
                  <tr>
                    <td style={labelCell}>Tanggal Selesai</td>
                    <td style={valueCell}>{endDate}</td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Section style={card}>
              <Text style={cardTitleText}>👗 Produk yang Dirental</Text>
              <Text style={productText}>{productList}</Text>
            </Section>

            {additionalInfo && (
              <Section style={card}>
                <Text style={cardTitleText}>📝 Catatan Tambahan</Text>
                <Text style={noteText}>{additionalInfo}</Text>
              </Section>
            )}

            <Section style={buttonSection}>
              <Button style={primaryButton} href={rentalUrl}>
                Lihat Detail Rental Saya
              </Button>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Jika Anda memiliki pertanyaan, silakan hubungi pemilik rental secara langsung.
            </Text>
            <Hr style={divider} />
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

// Styles from NewFittingOwnerEmail for consistency
const main: React.CSSProperties = {
  backgroundColor: '#f8f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};
const container: React.CSSProperties = {
  backgroundColor: 'transparent',
  margin: '0 auto',
  padding: '20px',
  maxWidth: '600px',
};
const heroSection: React.CSSProperties = {
  background: 'linear-gradient(to right, #10b981, #14b8a6)',
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
const detailTable: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};
const labelCell: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: 500,
  padding: '8px 0',
  borderBottom: '1px solid #e5e7eb',
  width: '40%',
};
const valueCell: React.CSSProperties = {
  color: '#111827',
  fontSize: '14px',
  fontWeight: 600,
  padding: '8px 0',
  borderBottom: '1px solid #e5e7eb',
  textAlign: 'right',
};
const productText: React.CSSProperties = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
};
const noteText: React.CSSProperties = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '1.6',
  fontStyle: 'italic',
  margin: '0',
};
const buttonSection: React.CSSProperties = {
  textAlign: 'center',
  margin: '30px 0 20px',
};
const primaryButton: React.CSSProperties = {
  background: 'linear-gradient(to right, #10b981, #14b8a6)',
  borderRadius: '25px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  padding: '12px 30px',
};
const footer: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  borderRadius: '12px',
  padding: '25px',
  textAlign: 'center',
  marginTop: '20px',
};
const footerText: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 8px',
};
const copyrightText: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '15px 0 0',
};
const divider: React.CSSProperties = {
  borderTop: '1px solid #e5e7eb',
  margin: '20px 0',
};

export default NewRentalCustomerEmail;
