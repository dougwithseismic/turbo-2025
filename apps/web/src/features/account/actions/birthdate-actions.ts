'use server';

interface BirthdateResponse {
  data: { birthdate: Date } | null;
  error: Error | null;
}

export const executeUpdateBirthdate = async ({
  birthdate,
}: {
  birthdate: Date;
}): Promise<BirthdateResponse> => {
  console.log('executeUpdateBirthdate', birthdate);
  // placeholder
  return { data: { birthdate }, error: null };
};

export const executeGetBirthdate = async (): Promise<BirthdateResponse> => {
  const mockBirthdate = new Date('1990-01-01');
  console.log('executeGetBirthdate', mockBirthdate);
  return { data: { birthdate: mockBirthdate }, error: null };
};
