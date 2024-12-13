'use server';

interface EmailResponse {
  data: { email: string } | null;
  error: Error | null;
}

export const executeUpdateEmail = async ({
  email,
}: {
  email: string;
}): Promise<EmailResponse> => {
  console.log('executeUpdateEmail', email);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // placeholder
  return { data: { email }, error: null };
};

export const executeGetEmail = async (): Promise<EmailResponse> => {
  const mockEmail = 'user@example.com';
  console.log('executeGetEmail', mockEmail);
  return { data: { email: mockEmail }, error: null };
};
