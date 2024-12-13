import { fetchGoogleSites } from '@/features/google/search-console/utility/fetch-google-sites';
import { auth } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PageHeader } from '@/features/page-layout/components/page-header';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Google Search Console',
  description: 'View your Google Search Console sites.',
  robots: {
    index: false,
    follow: false,
  },
};

const TestPage = async () => {
  const user = await auth();

  if (!user) {
    return (
      <>
        <PageHeader
          items={[
            {
              label: 'Google Search Console',
              current: true,
            },
          ]}
        />
        <div className="p-4">
          <h1 className="text-xl font-bold mb-4">Not authenticated</h1>
          <p>Please sign in to access this page.</p>
        </div>
      </>
    );
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: session } = await supabase.auth.getSession();

    if (!session?.session?.access_token) {
      throw new Error('No access token found');
    }

    const { data: sites } = await fetchGoogleSites({
      accessToken: session.session.access_token,
    });

    return (
      <>
        <PageHeader
          items={[
            {
              label: 'Google Search Console',
              current: true,
            },
          ]}
        />
        <div className="p-4 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">
            Google Search Console Sites
          </h1>
          <div className="space-y-4">
            {sites.siteEntry && sites.siteEntry.length > 0 ? (
              sites.siteEntry.map((site) => (
                <div
                  key={site.siteUrl}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <h2 className="font-semibold text-lg break-all">
                    {site.siteUrl}
                  </h2>
                  <p className="text-sm text-gray-600 mt-2">
                    Permission Level: {site.permissionLevel}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">
                  No sites found in your Google Search Console
                </p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  } catch (error) {
    return (
      <>
        <PageHeader
          items={[
            {
              label: 'Google Search Console',
              current: true,
            },
          ]}
        />
        <div className="p-4 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Error</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">
              {error instanceof Error ? error.message : 'Failed to load sites'}
            </p>
          </div>
        </div>
      </>
    );
  }
};

export default TestPage;
