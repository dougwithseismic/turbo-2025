interface CalendarLinkResponse {
  data: { link: string } | null;
  error: Error | null;
}

export const executeUpdateCalendarLink = async ({
  link,
}: {
  link: string;
}): Promise<CalendarLinkResponse> => {
  console.log('executeUpdateCalendarLink', link);
  // placeholder
  return { data: { link }, error: null };
};

export const executeGetCalendarLink =
  async (): Promise<CalendarLinkResponse> => {
    const mockLink = 'https://cal.com/username/vip';
    console.log('executeGetCalendarLink', mockLink);
    return { data: { link: mockLink }, error: null };
  };
