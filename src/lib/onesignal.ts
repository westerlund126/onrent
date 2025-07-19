// lib/onesignal.ts
interface OneSignalNotification {
  app_id: string;
  include_external_user_ids: string[];
  headings: {
    en: string;
    id?: string;
  };
  contents: {
    en: string;
    id?: string;
  };
  data?: Record<string, any>;
  url?: string;
  web_url?: string;
}

export class OneSignalService {
  private readonly appId: string;
  private readonly apiKey: string;
  private readonly apiUrl = 'https://onesignal.com/api/v1/notifications';

  constructor() {
    this.appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!;
    this.apiKey = process.env.ONESIGNAL_REST_API_KEY!;

    if (!this.appId || !this.apiKey) {
      throw new Error('OneSignal configuration is missing');
    }
  }

  async sendNotification(notification: Omit<OneSignalNotification, 'app_id'>) {
    try {
      const payload: OneSignalNotification = {
        app_id: this.appId,
        ...notification,
      };

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OneSignal API error: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log('[OneSignal] Notification sent successfully:', result);
      return result;
    } catch (error) {
      console.error('[OneSignal] Failed to send notification:', error);
      throw error;
    }
  }

  // Notification templates for rental events
  async notifyOwnerReturnRequest({
    ownerExternalId,
    customerName,
    rentalCode,
    productNames,
    rentalId,
  }: {
    ownerExternalId: string;
    customerName: string;
    rentalCode: string;
    productNames: string[];
    rentalId: number;
  }) {
    const productList = productNames.length > 1 
      ? `${productNames.slice(0, -1).join(', ')} dan ${productNames[productNames.length - 1]}`
      : productNames[0];

    return this.sendNotification({
      include_external_user_ids: [ownerExternalId],
      headings: {
        en: 'Return Request',
        id: 'Permintaan Pengembalian'
      },
      contents: {
        en: `${customerName} has returned rental ${rentalCode}`,
        id: `${customerName} telah mengembalikan rental ${rentalCode} (${productList}). Mohon konfirmasi penerimaan produk.`
      },
      data: {
        type: 'rental_return',
        rentalId: rentalId.toString(),
        rentalCode,
        customerName,
      },
      web_url: `${process.env.NEXT_PUBLIC_APP_URL}/owner/rentals/${rentalId}`,
    });
  }

  async notifyCustomerReturnConfirmed({
    customerExternalId,
    rentalCode,
    ownerName,
    rentalId,
  }: {
    customerExternalId: string;
    rentalCode: string;
    ownerName: string;
    rentalId: number;
  }) {
    return this.sendNotification({
      include_external_user_ids: [customerExternalId],
      headings: {
        en: 'Return Confirmed',
        id: 'Pengembalian Dikonfirmasi'
      },
      contents: {
        en: `Your rental ${rentalCode} return has been confirmed`,
        id: `Pengembalian rental ${rentalCode} Anda telah dikonfirmasi oleh ${ownerName}. Terima kasih!`
      },
      data: {
        type: 'rental_return_confirmed',
        rentalId: rentalId.toString(),
        rentalCode,
        ownerName,
      },
      web_url: `${process.env.NEXT_PUBLIC_APP_URL}/customer/activities/rental/${rentalId}`,
    });
  }

  async notifyOwnerNewRental({
    ownerExternalId,
    customerName,
    rentalCode,
    productNames,
    rentalId,
    startDate,
  }: {
    ownerExternalId: string;
    customerName: string;
    rentalCode: string;
    productNames: string[];
    rentalId: number;
    startDate: string;
  }) {
    const productList = productNames.length > 1 
      ? `${productNames.slice(0, -1).join(', ')} dan ${productNames[productNames.length - 1]}`
      : productNames[0];

    return this.sendNotification({
      include_external_user_ids: [ownerExternalId],
      headings: {
        en: 'New Rental Order',
        id: 'Pesanan Rental Baru'
      },
      contents: {
        en: `New rental order ${rentalCode} from ${customerName}`,
        id: `Pesanan rental baru ${rentalCode} dari ${customerName} untuk ${productList}. Mulai: ${startDate}`
      },
      data: {
        type: 'new_rental',
        rentalId: rentalId.toString(),
        rentalCode,
        customerName,
      },
      web_url: `${process.env.NEXT_PUBLIC_APP_URL}/owner/rentals/${rentalId}`,
    });
  }

  async notifyCustomerFittingAccepted({
    customerExternalId,
    ownerName,
    fittingId,
    fittingDate,
  }: {
    customerExternalId: string;
    ownerName: string;
    fittingId: number;
    fittingDate: string;
  }) {
    return this.sendNotification({
      include_external_user_ids: [customerExternalId],
      headings: {
        en: 'Fitting Accepted',
        id: 'Fitting Diterima'
      },
      contents: {
        en: `Your fitting appointment has been accepted by ${ownerName}`,
        id: `Jadwal fitting Anda telah diterima oleh ${ownerName} pada ${fittingDate}.`
      },
      data: {
        type: 'fitting_accepted',
        fittingId: fittingId.toString(),
        ownerName,
      },
      web_url: `${process.env.NEXT_PUBLIC_APP_URL}/customer/activities/fitting/${fittingId}`,
    });
  }

  async notifyOwnerNewFitting({
    ownerExternalId,
    customerName,
    fittingId,
    fittingDate,
    productNames,
  }: {
    ownerExternalId: string;
    customerName: string;
    fittingId: number;
    fittingDate: string;
    productNames: string[];
  }) {
    const productList = productNames.length > 1 
      ? `${productNames.slice(0, -1).join(', ')} dan ${productNames[productNames.length - 1]}`
      : productNames[0];

    return this.sendNotification({
      include_external_user_ids: [ownerExternalId],
      headings: {
        en: 'New Fitting Request',
        id: 'Permintaan Fitting Baru'
      },
      contents: {
        en: `New fitting request from ${customerName}`,
        id: `Permintaan fitting baru dari ${customerName} untuk ${productList} pada ${fittingDate}.`
      },
      data: {
        type: 'new_fitting',
        fittingId: fittingId.toString(),
        customerName,
      },
      web_url: `${process.env.NEXT_PUBLIC_APP_URL}/owner/fittings/${fittingId}`,
    });
  }
}