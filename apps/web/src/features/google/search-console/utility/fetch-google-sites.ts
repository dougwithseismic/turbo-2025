interface GoogleSite {
  siteUrl: string;
  permissionLevel: string;
}

interface GoogleSitesResponse {
  data: {
    siteEntry?: GoogleSite[];
  };
}

export const fetchGoogleSites = async ({
  accessToken,
}: {
  accessToken: string;
}): Promise<GoogleSitesResponse> => {
  const response = await fetch(
    `http://localhost:666/api/v1/google-search-console/sites`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 }, // Cache for 5 minutes
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch sites');
  }

  return response.json();
};
