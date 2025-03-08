import { supabase } from './supabase';
import { getCurrentUsername } from './hiveAuth';

export interface PaymentDetails {
  amount: number;
  currency: string;
  planType: 'monthly' | 'yearly';
  paymentMethod: string;
  transactionId?: string;
}

export const verifyUPIPayment = async (transactionId: string): Promise<boolean> => {
  // In a production environment, you would verify the transaction with a payment gateway
  // For demo purposes, we'll simulate verification
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate 90% success rate
      resolve(Math.random() < 0.9);
    }, 2000);
  });
};

export const generateReceipt = (payment: any): string => {
  const receiptTemplate = `
Receipt ID: ${payment.id}
Date: ${new Date(payment.created_at).toLocaleDateString()}
Amount: ${payment.amount} ${payment.currency}
Plan: ${payment.plan_type}
Transaction ID: ${payment.transaction_id}
Status: ${payment.status}
  `;
  
  // Convert the text to a data URL for downloading
  const blob = new Blob([receiptTemplate], { type: 'text/plain' });
  return URL.createObjectURL(blob);
};

export const createPremiumMembership = async (paymentDetails: PaymentDetails) => {
  const username = getCurrentUsername();
  if (!username) throw new Error('User not logged in');

  try {
    // Start transaction
    const { data: membership, error: membershipError } = await supabase
      .from('premium_memberships')
      .insert({
        user_id: username,
        plan_type: paymentDetails.planType,
        start_date: new Date(),
        end_date: new Date(Date.now() + (paymentDetails.planType === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000),
        status: 'active'
      })
      .select()
      .single();

    if (membershipError) throw membershipError;

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: username,
        membership_id: membership.id,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        payment_method: paymentDetails.paymentMethod,
        transaction_id: paymentDetails.transactionId,
        status: 'completed',
        receipt_url: generateReceipt({ ...paymentDetails, id: membership.id })
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    return { membership, payment };
  } catch (error) {
    console.error('Error creating premium membership:', error);
    throw error;
  }
};

export const checkPremiumStatus = async (username: string): Promise<boolean> => {
  if (!username) return false;

  try {
    const { data: membership, error } = await supabase
      .from('premium_memberships')
      .select('*')
      .eq('user_id', username)
      .eq('status', 'active')
      .gt('end_date', new Date().toISOString())
      .maybeSingle();

    if (error) throw error;
    return !!membership;
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
};