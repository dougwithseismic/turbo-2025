interface AddressData {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface AddressResponse {
  data: AddressData | null;
  error: Error | null;
}

export const executeUpdateAddress = async ({
  address,
}: {
  address: AddressData;
}): Promise<AddressResponse> => {
  console.log('executeUpdateAddress', address);

  const randomDelay = Math.floor(Math.random() * 2000) + 500;
  await new Promise((resolve) => setTimeout(resolve, randomDelay));

  // placeholder
  return { data: address, error: null };
};

export const executeGetAddress = async (): Promise<AddressResponse> => {
  const mockAddress: AddressData = {
    street: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'United States',
  };

  const randomDelay = Math.floor(Math.random() * 1500) + 300;
  await new Promise((resolve) => setTimeout(resolve, randomDelay));

  console.log('executeGetAddress', mockAddress);
  return { data: mockAddress, error: null };
};
