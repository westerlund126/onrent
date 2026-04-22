import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
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
    : 'Produk yang dipilih';

  return (
    <Html>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="x-apple-disable-message-reformatting" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Janji Temu Fitting Dikonfirmasi!</title>
        <style>
          {`
            @media only screen and (max-width: 600px) {
              .container {
                width: 100% !important;
                padding: 10px !important;
              }
              .card {
                padding: 15px !important;
              }
              .hero-section {
                padding: 30px 15px !important;
              }
              .hero-title {
                font-size: 22px !important;
              }
              .hero-subtitle {
                font-size: 14px !important;
              }
              .primary-button {
                width: 100% !important;
                padding: 14px 20px !important;
              }
              .detail-table td {
                display: block !important;
                width: 100% !important;
                text-align: left !important;
                padding: 6px 0 !important;
                border: none !important;
              }
              .label-cell {
                font-weight: 600 !important;
                color: #4b5563 !important;
                padding-bottom: 2px !important;
              }
              .value-cell {
                padding-bottom: 12px !important;
                border-bottom: 1px solid #e5e7eb !important;
              }
            }
          `}
        </style>
      </Head>
      <Preview>Janji temu fitting Anda telah dikonfirmasi!</Preview>
      <Body style={main}>
        <Container style={container}>

          {/* Hero Section */}
          <Section style={heroSection} className="hero-section">
            <Heading style={heroTitle} className="hero-title">✅ Fitting Dikonfirmasi!</Heading>
            <Text style={heroSubtitle} className="hero-subtitle">
              Janji temu fitting Anda telah berhasil dikonfirmasi
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Text style={greetingText}>
              Halo <strong>{customerName}</strong>!
            </Text>

            <Text style={introText}>
              Kabar baik! Janji temu fitting Anda telah dikonfirmasi oleh <strong>{businessName || ownerName}</strong>. 
              Kami sangat menantikan kedatangan Anda!
            </Text>

            {/* Appointment Details */}
            <Section style={card} className="card">
              <Text style={cardTitleText}>📅 Detail Janji Temu yang Dikonfirmasi</Text>
              
              <table style={detailTable} className="detail-table">
                <tr>
                  <td style={labelCell} className="label-cell">ID Fitting</td>
                  <td style={valueCell} className="value-cell">#{fittingId}</td>
                </tr>
                <tr>
                  <td style={labelCell} className="label-cell">Tanggal & Waktu</td>
                  <td style={valueCell} className="value-cell">{fittingDate}</td>
                </tr>
                <tr>
                  <td style={labelCell} className="label-cell">Status</td>
                  <td style={valueCell} className="value-cell">
                    <span style={confirmedBadge}>Dikonfirmasi</span>
                  </td>
                </tr>
              </table>
            </Section>

            {/* Business Info */}
            <Section style={card} className="card">
              <Text style={cardTitleText}>🏪 Informasi Bisnis</Text>
              
              <table style={detailTable} className="detail-table">
                <tr>
                  <td style={labelCell} className="label-cell">Bisnis</td>
                  <td style={valueCell} className="value-cell">{businessName || ownerName}</td>
                </tr>
                {businessAddress && (
                  <tr>
                    <td style={labelCell} className="label-cell">Alamat</td>
                    <td style={valueCell} className="value-cell">{businessAddress}</td>
                  </tr>
                )}
                {ownerPhone && (
                  <tr>
                    <td style={labelCell} className="label-cell">Kontak</td>
                    <td style={valueCell} className="value-cell">
                      <Link href={`tel:${ownerPhone}`} style={linkStyle}>
                        {ownerPhone}
                      </Link>
                    </td>
                  </tr>
                )}
              </table>
            </Section>

            {/* Products */}
            <Section style={card} className="card">
              <Text style={cardTitleText}>👗 Produk untuk Fitting</Text>
              <Text style={productText}>{productList}</Text>
            </Section>

            {/* Notes (if exists) */}
            {note && (
              <Section style={card} className="card">
                <Text style={cardTitleText}>📝 Catatan Tambahan</Text>
                <Text style={noteText}>{note}</Text>
              </Section>
            )}

            {/* Important Reminders */}
            <Section style={reminderCard} className="card">
              <Text style={cardTitleText}>⏰ Pengingat Penting:</Text>
              <ul style={reminderList}>
                <li style={reminderItem}>Datang 5-10 menit sebelum waktu yang dijadwalkan</li>
                <li style={reminderItem}>Bawa kartu identitas yang masih berlaku</li>
                <li style={reminderItem}>Kenakan pakaian dalam yang sesuai untuk fitting</li>
                <li style={reminderItem}>Hubungi bisnis jika perlu mengubah jadwal</li>
              </ul>
            </Section>

            <Text style={footerActionText}>
              Kami sangat menantikan kedatangan Anda di janji temu fitting!
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Terima kasih telah mempercayai layanan kami! 🟧
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

// Responsive Styles
const main: React.CSSProperties = {
  backgroundColor: '#f8f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  padding: '0',
  margin: '0 auto',
  width: '100%',
};

const container: React.CSSProperties = {
  backgroundColor: 'transparent',
  margin: '0 auto',
  padding: '20px',
  maxWidth: '600px',
  width: '100%',
};

const heroSection: React.CSSProperties = {
  background: 'linear-gradient(to right, #10b981, #059669)',
  borderRadius: '16px',
  padding: '40px 20px',
  textAlign: 'center',
  margin: '0 0 20px',
};

const heroTitle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 10px',
  textAlign: 'center',
  lineHeight: '1.3',
};

const heroSubtitle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '16px',
  margin: '0',
  lineHeight: '1.4',
};

const contentSection: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  margin: '0 0 20px',
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

const reminderCard: React.CSSProperties = {
  backgroundColor: '#fffbeb',
  border: '1px solid #fbbf24',
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
  margin: '0',
};

const labelCell: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: 500,
  padding: '8px 0',
  borderBottom: '1px solid #e5e7eb',
  width: '40%',
  verticalAlign: 'top',
};

const valueCell: React.CSSProperties = {
  color: '#111827',
  fontSize: '14px',
  fontWeight: 600,
  padding: '8px 0',
  borderBottom: '1px solid #e5e7eb',
  textAlign: 'right',
  verticalAlign: 'top',
};

const confirmedBadge: React.CSSProperties = {
  backgroundColor: '#d1fae5',
  color: '#065f46',
  padding: '4px 12px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: 'bold',
};

const productText: React.CSSProperties = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
  padding: '15px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
};

const noteText: React.CSSProperties = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
  padding: '15px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  fontStyle: 'italic',
};

const reminderList: React.CSSProperties = {
  paddingLeft: '20px',
  margin: '10px 0 0',
};

const reminderItem: React.CSSProperties = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '8px 0',
};

const footerActionText: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 20px',
  textAlign: 'center',
};

const footer: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  borderRadius: '12px',
  margin: '0',
  padding: '25px',
  textAlign: 'center',
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
  lineHeight: '1.5',
  margin: '15px 0 5px',
};

const divider: React.CSSProperties = {
  borderTop: '1px solid #e5e7eb',
  margin: '20px 0',
};

const linkStyle: React.CSSProperties = {
  color: '#059669',
  textDecoration: 'underline',
};

export default FittingConfirmedEmail;