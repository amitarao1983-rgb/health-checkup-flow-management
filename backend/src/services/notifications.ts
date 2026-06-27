import { Notification } from '../types/index.js';
import { store } from './store.js';

/**
 * Notification Service (Placeholder)
 * Integrate Twilio / WhatsApp Business API / hospital SMS gateway in production.
 */
export class NotificationService {
  async sendSMS(phone: string, message: string): Promise<{ success: boolean; provider: string }> {
    console.log(`[SMS PLACEHOLDER] To: ${phone} | ${message}`);
    return { success: true, provider: 'twilio-placeholder' };
  }

  async sendWhatsApp(phone: string, message: string): Promise<{ success: boolean; provider: string }> {
    console.log(`[WhatsApp PLACEHOLDER] To: ${phone} | ${message}`);
    return { success: true, provider: 'whatsapp-business-placeholder' };
  }

  async notifyPatient(
    patientId: string,
    message: string,
    channels: Notification['type'][] = ['in_app']
  ): Promise<Notification[]> {
    const patient = store.getPatient(patientId);
    if (!patient) throw new Error('Patient not found');

    const results: Notification[] = [];

    for (const channel of channels) {
      if (channel === 'sms') await this.sendSMS(patient.phone, message);
      if (channel === 'whatsapp') await this.sendWhatsApp(patient.phone, message);
      results.push(store.addNotification(patientId, message, channel));
    }

    return results;
  }
}

export const notificationService = new NotificationService();
