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
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="x-apple-disable-message-reformatting" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Update Janji Temu Fitting</title>
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
      <Preview>Update tentang permintaan janji temu fitting Anda</Preview>
      <Body style={main}>
        <Container style={container}>

          {/* Hero Section */}
          <Section style={heroSection} className="hero-section">
            <Heading style={heroTitle} className="hero-title">Update Janji Temu Fitting</Heading>
            <Text style={heroSubtitle} className="hero-subtitle">
              Informasi terbaru mengenai permintaan fitting Anda
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Text style={greetingText}>
              Halo <strong>{customerName}</strong>,
            </Text>

            <Text style={introText}>
              Kami mohon maaf untuk menginformasikan bahwa permintaan janji temu fitting Anda 
              tidak dapat diakomodasi pada waktu yang diminta.
            </Text>

            {/* Appointment Details */}
            <Section style={card} className="card">
              <Text style={cardTitleText}>📅 Detail Permintaan Janji Temu</Text>
              
              <table style={detailTable} className="detail-table">
                <tr>
                  <td style={labelCell} className="label-cell">ID Fitting</td>
                  <td style={valueCell} className="value-cell">#{fittingId}</td>
                </tr>
                <tr>
                  <td style={labelCell} className="label-cell">Tanggal & Waktu yang Diminta</td>
                  <td style={valueCell} className="value-cell">{fittingDate}</td>
                </tr>
                <tr>
                  <td style={labelCell} className="label-cell">Bisnis</td>
                  <td style={valueCell} className="value-cell">{businessName || ownerName}</td>
                </tr>
                <tr>
                  <td style={labelCell} className="label-cell">Status</td>
                  <td style={valueCell} className="value-cell">
                    <span style={rejectedBadge}>Tidak Dapat Diakomodasi</span>
                  </td>
                </tr>
              </table>
            </Section>

            {/* Rejection Reason (if provided) */}
            {rejectionReason && (
              <Section style={card} className="card">
                <Text style={cardTitleText}>📝 Alasan</Text>
                <Text style={reasonText}>{rejectionReason}</Text>
              </Section>
            )}

            <Text style={introText}>
              Kami mohon maaf atas ketidaknyamanan ini. Berikut beberapa opsi yang dapat Anda lakukan:
            </Text>

            {/* Alternative Options */}
            <Section style={alternativeCard} className="card">
              <Text style={cardTitleText}>💡 Opsi Alternatif:</Text>
              <ul style={alternativeList}>
                <li style={alternativeItem}>Cаri slot waktu yang tersedia untuk tanggal lain</li>
                <li style={alternativeItem}>Hubungi bisnis secara langsung untuk pengaturan alternatif</li>
                <li style={alternativeItem}>Coba booking dengan penyedia layanan lain yang tersedia</li>
                <li style={alternativeItem}>Simpan bisnis ini dalam wishlist untuk kesempatan berikutnya</li>
              </ul>
            </Section>

            {/* Action Button */}
            <Section style={buttonSection}>
              <Button style={primaryButton} className="primary-button" href={browseUrl}>
                Cari Slot yang Tersedia
              </Button>
            </Section>

            <Text style={footerActionText}>
              Terima kasih atas pengertian Anda. Kami berharap dapat melayani Anda di kesempatan lain!
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Jangan menyerah! Masih banyak pilihan menarik lainnya. 🟧
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
  background: 'linear-gradient(to right, #f59e0b, #f97316)',
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

const alternativeCard: React.CSSProperties = {
  backgroundColor: '#fef3c7',
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

const rejectedBadge: React.CSSProperties = {
  backgroundColor: '#fecaca',
  color: '#991b1b',
  padding: '4px 12px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: 'bold',
};

const reasonText: React.CSSProperties = {
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

const alternativeList: React.CSSProperties = {
  paddingLeft: '20px',
  margin: '10px 0 0',
};

const alternativeItem: React.CSSProperties = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '8px 0',
};

const buttonSection: React.CSSProperties = {
  textAlign: 'center',
  margin: '30px 0 20px',
};

const primaryButton: React.CSSProperties = {
  background: 'linear-gradient(to right, #f59e0b, #f97316)',
  borderRadius: '25px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  padding: '12px 30px',
  border: 'none',
  cursor: 'pointer',
  minWidth: '200px',
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

export default FittingRejectedEmail;