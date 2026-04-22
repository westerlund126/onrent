// lib/resend.ts
import { Resend } from 'resend';
import { render } from '@react-email/components';
import { FittingConfirmedEmail, FittingRejectedEmail, NewFittingOwnerEmail, NewRentalCustomerEmail, ReturnRequestOwnerEmail, FittingCanceledOwnerEmail, } from 'components/emails';
import { JSX } from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);
interface ProductDetail {
  name: string;
  variant: string;
}
export class EmailService {
  sendEmail(arg0: { to: string; subject: string; react: JSX.Element; }) {
    throw new Error('Method not implemented.');
  }
  private fromEmail = process.env.FROM_EMAIL || 'noreply@onrent.live';

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

   async notifyOwnerFittingCanceled({
    ownerEmail,
    ownerName,
    customerName,
    customerEmail,
    customerPhone,
    fittingDate,
    fittingId,
    productNames,
    cancellationReason,
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
    cancellationReason?: string;
    businessName?: string;
  }) {
    try {
      const subject = `❌ Fitting Appointment Canceled - ${customerName}`;
      
      const emailHtml = await render(
        FittingCanceledOwnerEmail({
          ownerName,
          customerName,
          customerEmail,
          customerPhone,
          fittingDate,
          fittingId,
          productNames,
          cancellationReason,
          businessName,
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/owner/fitting/schedule`,
        })
      );

      const { data, error } = await resend.emails.send({
        from: this.fromEmail,
        to: [ownerEmail],
        subject,
        html: emailHtml,
      });

      if (error) {
        console.error('Error sending owner cancellation notification email:', error);
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Failed to send owner cancellation notification email:', error);
      throw error;
    }
  }

  async notifyCustomerNewRental({
    customerEmail,
    customerName,
    ownerName,
    businessName,
    rentalCode,
    startDate,
    endDate,
    productDetails,
    rentalUrl,
    additionalInfo,
  }: {
    customerEmail: string;
    customerName: string;
    ownerName: string;
    businessName?: string;
    rentalCode: string;
    startDate: string;
    endDate: string;
    productDetails: ProductDetail[];
    rentalUrl: string;
    additionalInfo?: string;
  }) {
    try {
      const subject = `✅ Rental Anda Dikonfirmasi - #${rentalCode}`;
      
      const emailHtml = await render(
        NewRentalCustomerEmail({
          customerName,
          ownerName,
          businessName,
          rentalCode,
          startDate,
          endDate,
          productDetails,
          rentalUrl,
          additionalInfo,
        })
      );

      const { data, error } = await resend.emails.send({
        from: this.fromEmail,
        to: [customerEmail],
        subject,
        html: emailHtml,
      });

      if (error) {
        console.error('Error sending new rental customer email:', error);
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Failed to send new rental customer email:', error);
      throw error;
    }
  }

  async notifyOwnerReturnRequest({
    ownerEmail,
    ownerName,
    customerName,
    rentalCode,
    productNames,
    dashboardUrl,
  }: {
    ownerEmail: string;
    ownerName: string;
    customerName: string;
    rentalCode: string;
    productNames: string[];
    dashboardUrl: string;
  }) {
    try {
      const subject = `Barang Dikembalikan - Konfirmasi Diperlukan untuk Rental #${rentalCode}`;
      
      const emailHtml = await render(
        ReturnRequestOwnerEmail({
          ownerName,
          customerName,
          rentalCode,
          productNames,
          dashboardUrl,
        })
      );

      const { data, error } = await resend.emails.send({
        from: this.fromEmail,
        to: [ownerEmail],
        subject,
        html: emailHtml,
      });

      if (error) {
        console.error('Error sending owner return request email:', error);
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Failed to send owner return request email:', error);
      throw error;
    }
  }
}