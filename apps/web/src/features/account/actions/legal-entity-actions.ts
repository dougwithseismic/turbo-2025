'use server';

type LegalEntityType = 'individual' | 'company' | 'non-profit';

interface LegalEntityResponse {
  data: { type: LegalEntityType } | null;
  error: Error | null;
}

export const executeUpdateLegalEntity = async ({
  type,
}: {
  type: LegalEntityType;
}): Promise<LegalEntityResponse> => {
  console.log('executeUpdateLegalEntity', type);
  // placeholder
  return { data: { type }, error: null };
};

export const executeGetLegalEntity = async (): Promise<LegalEntityResponse> => {
  const mockType: LegalEntityType = 'individual';
  console.log('executeGetLegalEntity', mockType);
  return { data: { type: mockType }, error: null };
};
