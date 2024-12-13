'use server';

interface PaymentMethodData {
  lastFour: string;
  expiryMonth: number;
  expiryYear: number;
  type: 'credit' | 'debit';
}

interface PaymentMethodResponse {
  data: PaymentMethodData | null;
  error: Error | null;
}

export const executeUpdatePaymentMethod = async ({
  token,
}: {
  token: string;
}): Promise<PaymentMethodResponse> => {
  console.log('executeUpdatePaymentMethod', token);
  // placeholder
  return {
    data: {
      lastFour: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      type: 'credit',
    },
    error: null,
  };
};

export const executeGetPaymentMethod =
  async (): Promise<PaymentMethodResponse> => {
    const mockPaymentMethod: PaymentMethodData = {
      lastFour: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      type: 'credit',
    };
    console.log('executeGetPaymentMethod', mockPaymentMethod);
    return { data: mockPaymentMethod, error: null };
  };
