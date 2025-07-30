// lib/resend.ts
import { Resend } from 'resend';
import { render } from '@react-email/components';
import { FittingConfirmedEmail, FittingRejectedEmail, NewFittingOwnerEmail } from 'components/emails';

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  private fromEmail = process.env.FROM_EMAIL || 'noreply@onrent.live';

  // Notify owner when a new fitting is scheduled
  async notifyOwnerNewFitting({
    ownerEmail,
    ownerName,
    customerName,
    customerEmail,
    customerPhone,
    fittingDate,
    fittingId,
    productNames,
    note,
    businessName,
  }: {
    ownerEmail: string;
    ownerName: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    fittingDate: string;
    fittingId: number;
    productNames: string[];
    note?: string;
    businessName?: string;
  }) {
    try {
      const subject = `New Fitting Appointment - ${customerName}`;
      
      const emailHtml = await render(
        NewFittingOwnerEmail({
          ownerName,
          customerName,
          customerEmail,
          customerPhone,
          fittingDate,
          fittingId,
          productNames,
          note,
          businessName,
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/fittings`,
        })
      );

      const { data, error } = await resend.emails.send({
        from: this.fromEmail,
        to: [ownerEmail],
        subject,
        html: emailHtml,
      });

      if (error) {
        console.error('Error sending owner notification email:', error);
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Failed to send owner notification email:', error);
      throw error;
    }
  }

  // Notify customer when fitting is confirmed
  async notifyCustomerFittingConfirmed({
    customerEmail,
    customerName,
    ownerName,
    businessName,
    businessAddress,
    ownerPhone,
    fittingDate,
    fittingId,
    productNames,
    note,
  }: {
    customerEmail: string;
    customerName: string;
    ownerName: string;
    businessName?: string;
    businessAddress?: string;
    ownerPhone?: string;
    fittingDate: string;
    fittingId: number;
    productNames: string[];
    note?: string;
  }) {
    try {
      const subject = `✅ Fitting Appointment Confirmed - #${fittingId}`;
      
      const emailHtml = await render(
        FittingConfirmedEmail({
          customerName,
          ownerName,
          businessName,
          businessAddress,
          ownerPhone,
          fittingDate,
          fittingId,
          productNames,
          note,
        })
      );

      const { data, error } = await resend.emails.send({
        from: this.fromEmail,
        to: [customerEmail],
        subject,
        html: emailHtml,
      });

      if (error) {
        console.error('Error sending customer confirmation email:', error);
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Failed to send customer confirmation email:', error);
      throw error;
    }
  }

  // Notify customer when fitting is rejected
  async notifyCustomerFittingRejected({
    customerEmail,
    customerName,
    ownerName,
    businessName,
    fittingDate,
    fittingId,
    rejectionReason,
  }: {
    customerEmail: string;
    customerName: string;
    ownerName: string;
    businessName?: string;
    fittingDate: string;
    fittingId: number;
    rejectionReason?: string;
  }) {
    try {
      const subject = `❌ Fitting Appointment Update - #${fittingId}`;
      
      const emailHtml = await render(
        FittingRejectedEmail({
          customerName,
          ownerName,
          businessName,
          fittingDate,
          fittingId,
          rejectionReason,
          browseUrl: `${process.env.NEXT_PUBLIC_APP_URL}/fitting-slots`,
        })
      );

      const { data, error } = await resend.emails.send({
        from: this.fromEmail,
        to: [customerEmail],
        subject,
        html: emailHtml,
      });

      if (error) {
        console.error('Error sending customer rejection email:', error);
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Failed to send customer rejection email:', error);
      throw error;
    }
  }
}