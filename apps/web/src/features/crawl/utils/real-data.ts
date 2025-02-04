/* eslint-disable @typescript-eslint/no-explicit-any */
export interface RealMockData {
  pages: {
    seo: {
      h1: string
      title: string
      headings: {
        h1: string[]
        h2: string[]
        h3: string[]
      }
      language: string
      metaTags: {
        name: string
        content: string
        property?: string
      }[]
      canonical: string
      description: string
    }
    url: string
    links: {
      links: {
        href: string
        text: string
        target?: string
        onClick: boolean
        isInternal: boolean
      }[]
      linkAnalysis: {
        total: number
        external: {
          ugc: number
          count: number
          social: number
          nofollow: number
          sponsored: number
        }
        internal: {
          count: number
          navigation: number
        }
      }
    }
    status: number
    timing: {
      start: number
      loaded: number
      domContentLoaded: number
    }
    content: {
      wordCount: number
      readingTime: number
      contentLength: number
      contentQuality: {
        hasLists: boolean
        hasImages: boolean
        listCount: number
        imageCount: number
        paragraphCount: number
        textToHtmlRatio: number
        averageParagraphLength: number
      }
    }
    security: {
      https: boolean
      headers: {
        hsts: boolean
      }
    }
    performance: {
      timing: {
        start: number
        loaded: number
        domContentLoaded: number
      }
      loadTime: number
      coreWebVitals: {
        cls: number
        fcp: number
        fid: number
        lcp: number
        ttfb: number
      }
      resourceSizes: {
        css: number
        html: number
        fonts: number
        other: number
        images: number
        javascript: number
      }
    }
    redirectChain: unknown[]
    searchConsole: {
      path: string
      metrics: {
        ctr: number
        clicks: number
        position: number
        impressions: number
      }
      topQueries: {
        query: string
        metrics: {
          ctr: number
          clicks: number
          position: number
          impressions: number
        }
      }[]
    }
    mobileFriendliness: {
      fontSize: {
        base: number
        readable: boolean
      }
      isResponsive: boolean
      mediaQueries: any[]
      touchTargets: {
        total: number
        tooSmall: number
      }
      viewportMeta: boolean
    }
  }[]
  config: {
    url: string
    user: {
      id: string
      email: string
    }
    scPropertyName: string
  }
  errors: {
    errorPages: any[]
    errorTypes: Record<string, any>
    totalErrors: number
  }
  summary: {
    seo: {
      titleStats: {
        missing: number
        tooLong: number
        tooShort: number
        duplicates: number
        averageLength: number
      }
      headingStats: {
        missingH1: number
        multipleH1: number
        averageH2Count: number
        averageH3Count: number
        averageH1Length: number
      }
      metaTagStats: {
        commonTags: {
          name: string
          count: number
        }[]
        averageCount: number
        missingRequired: number
      }
      languageStats: {
        languages: {
          code: string
          count: number
        }[]
        missingLanguage: number
      }
      canonicalStats: {
        missing: number
        different: number
        selfReferencing: number
      }
      descriptionStats: {
        missing: number
        tooLong: number
        tooShort: number
        duplicates: number
        averageLength: number
      }
    }
    links: {
      totalLinks: number
      uniqueLinks: number
      externalLinks: {
        ugc: number
        total: number
        social: number
        unique: number
        nofollow: number
        sponsored: number
        averagePerPage: number
      }
      internalLinks: {
        total: number
        unique: number
        navigation: number
        averagePerPage: number
      }
      topExternalDomains: {
        count: number
        domain: string
      }[]
      commonNavigationPaths: {
        path: string
        count: number
      }[]
    }
    content: {
      wordStats: {
        maxWords: number
        minWords: number
        totalWords: number
        medianWords: number
        averageWords: number
        readabilityScore: number
      }
      readingTimeStats: {
        totalReadingTime: number
        averageReadingTime: number
        readingTimeDistribution: {
          over10min: number
          under2min: number
          under5min: number
          under10min: number
        }
      }
      contentLengthStats: {
        totalLength: number
        medianLength: number
        averageLength: number
        lengthDistribution: {
          large: number
          small: number
          medium: number
          extraLarge: number
        }
      }
      contentQualityStats: {
        pagesWithLists: number
        pagesWithImages: number
        averageListsPerPage: number
        averageImagesPerPage: number
        averageParagraphLength: number
        averageTextToHtmlRatio: number
        averageParagraphsPerPage: number
      }
    }
    security: {
      httpsStats: {
        totalHttp: number
        totalHttps: number
        percentageSecure: number
      }
      headerStats: {
        cspAdoption: number
        hstsAdoption: number
        commonXFrameOptions: any[]
        averageHeadersPerPage: number
        xFrameOptionsAdoption: number
        xContentTypeOptionsAdoption: number
      }
      securityScore: {
        https: number
        headers: number
        overall: number
        breakdown: {
          cspScore: number
          hstsScore: number
          xFrameOptionsScore: number
          xContentTypeOptionsScore: number
        }
      }
    }
    performance: {
      coreWebVitals: {
        scores: {
          clsScore: number
          fcpScore: number
          fidScore: number
          lcpScore: number
          ttfbScore: number
          overallScore: number
        }
        averages: {
          cls: number
          fcp: number
          fid: number
          lcp: number
          ttfb: number
        }
        thresholds: {
          goodCls: number
          goodFcp: number
          goodFid: number
          goodLcp: number
          goodTtfb: number
        }
      }
      loadTimeStats: {
        max: number
        min: number
        p95: number
        median: number
        average: number
      }
      resourceStats: {
        totalSizes: {
          css: number
          html: number
          fonts: number
          other: number
          images: number
          javascript: number
        }
        averageSizes: {
          css: number
          html: number
          fonts: number
          other: number
          images: number
          javascript: number
        }
        totalRequests: {
          css: number
          html: number
          fonts: number
          other: number
          images: number
          javascript: number
        }
      }
      timingAverages: {
        loaded: number
        domContentLoaded: number
      }
    }
    searchConsole: {
      topPages: {
        path: string
        metrics: {
          ctr: number
          clicks: number
          position: number
          impressions: number
        }
      }[]
      pathAnalysis: {
        mostClicked: {
          path: string
          clicks: number
        }[]
        bestPosition: {
          path: string
          position: number
        }[]
        mostImpressed: {
          path: string
          impressions: number
        }[]
      }
      totalMetrics: {
        averageCtr: number
        totalClicks: number
        averagePosition: number
        totalImpressions: number
      }
      queryAnalysis: {
        topQueries: {
          query: string
          metrics: {
            ctr: number
            clicks: number
            position: number
            impressions: number
          }
        }[]
        queryCategories: {
          branded: any[]
          longTail: {
            query: string
            metrics: {
              ctr: number
              clicks: number
              position: number
              impressions: number
            }
          }[]
          nonBranded: {
            query: string
            metrics: {
              ctr: number
              clicks: number
              position: number
              impressions: number
            }
          }[]
        }
      }
    }
    mobileFriendliness: {
      fontStats: {
        readablePages: number
        averageBaseSize: number
        percentageReadable: number
        fontSizeDistribution: {
          good: number
          large: number
          tooSmall: number
        }
      }
      mobileScore: {
        overall: number
        breakdown: {
          fontScore: number
          mediaQueryScore: number
          responsiveScore: number
          touchTargetScore: number
        }
      }
      mediaQueryStats: {
        commonFeatures: any[]
        commonBreakpoints: any[]
        averageQueriesPerPage: number
      }
      responsiveStats: {
        totalResponsive: number
        totalNonResponsive: number
        percentageResponsive: number
        viewportMetaAdoption: number
      }
      touchTargetStats: {
        averageSmallTargets: number
        averageTargetsPerPage: number
        percentageSmallTargets: number
        pagesWithAccessibleTargets: number
      }
    }
  }
  progress: {
    status: string
    endTime: string
    startTime: string
    currentUrl: string
    failedUrls: number
    totalPages: number
    uniqueUrls: number
    skippedUrls: number
    currentDepth: number
    pagesAnalyzed: number
  }
}

export const realMockData: RealMockData = {
  pages: [
    {
      seo: {
        h1: 'Connect over dinner with like-minded people.',
        title:
          'Dinners With Friends | Where like-minded strangers become friends over dinner.',
        headings: {
          h1: [
            'Connect over dinner with like-minded people.',
            'How does it work?',
          ],
          h2: [
            'Join Dinners With Friends in Exeter',
            'Join Dinners With Friends in Torquay',
            'Join Dinners With Friends in Plymouth',
            'Frequently Asked Questions',
          ],
          h3: [],
        },
        language: 'en',
        metaTags: [
          { name: '', content: '' },
          {
            name: 'description',
            content:
              'Join us for an unforgettable evening where eight strangers come together, matched by a unique personality test. Discover new friendships and enjoy delightful conversations over a shared meal.',
          },
          {
            name: 'og:title',
            content:
              'Dinners With Friends | Where like-minded strangers become friends over dinner.',
            property: 'og:title',
          },
          {
            name: 'og:description',
            content:
              'Join us for an unforgettable evening where eight strangers come together, matched by a unique personality test. Discover new friendships and enjoy delightful conversations over a shared meal.',
            property: 'og:description',
          },
          {
            name: 'og:image',
            content: '.webflow.io_.avif',
            property: 'og:image',
          },
          {
            name: 'twitter:title',
            content:
              'Dinners With Friends | Where like-minded strangers become friends over dinner.',
            property: 'twitter:title',
          },
          {
            name: 'twitter:description',
            content:
              'Join us for an unforgettable evening where eight strangers come together, matched by a unique personality test. Discover new friendships and enjoy delightful conversations over a shared meal.',
            property: 'twitter:description',
          },
          {
            name: 'twitter:image',
            content: '.webflow.io_.avif',
            property: 'twitter:image',
          },
          { name: 'og:type', content: 'website', property: 'og:type' },
          { name: 'twitter:card', content: 'summary_large_image' },
          { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        ],
        canonical: 'https://www.dinnerswithfriends.co.uk/',
        description:
          'Join us for an unforgettable evening where eight strangers come together, matched by a unique personality test. Discover new friendships and enjoy delightful conversations over a shared meal.',
      },
      url: 'https://www.dinnerswithfriends.co.uk/',
      links: {
        links: [
          {
            href: 'https://www.dinnerswithfriends.co.uk/',
            text: '',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'What to Expect',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/about',
            text: 'Who Is Dinner With Friends?',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'News & Articles',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/contact',
            text: 'Contact',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/#events',
            text: 'Book Your Seat',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/#events',
            text: 'Book Your Seat For Wednesday',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.eventbrite.co.uk/e/dinners-with-friends-in-exeter-dine-connect-with-like-minded-people-tickets-1107835779639?aff=oddtdtcreator',
            text: 'Book Your Seat For Wednesday',
            onClick: false,
            isInternal: false,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/#',
            text: 'Upcoming Events',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/#',
            text: 'Book your seat',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'Learn More',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/#',
            text: 'Upcoming Events',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/#',
            text: 'BOOK YOUR SEAT',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'Learn More',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/#',
            text: 'Upcoming Events',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/#',
            text: 'BOOK YOUR SEAT',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'Learn More',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.facebook.com/profile.php?id=61568944958520',
            text: '',
            target: '_blank',
            onClick: false,
            isInternal: false,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'News & Articles',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'What to Expect',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/terms-and-conditions',
            text: 'Terms & Conditions',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/privacy-policy',
            text: 'Privacy Policy',
            onClick: false,
            isInternal: true,
          },
        ],
        linkAnalysis: {
          total: 22,
          external: { ugc: 0, count: 2, social: 1, nofollow: 0, sponsored: 0 },
          internal: { count: 20, navigation: 4 },
        },
      },
      status: 200,
      timing: {
        start: 1738423706874,
        loaded: 1738423706983,
        domContentLoaded: 1738423706983,
      },
      content: {
        wordCount: 524,
        readingTime: 3,
        contentLength: 27570,
        contentQuality: {
          hasLists: false,
          hasImages: true,
          listCount: 0,
          imageCount: 28,
          paragraphCount: 32,
          textToHtmlRatio: 0.1271309394269133,
          averageParagraphLength: 86.8125,
        },
      },
      security: { https: true, headers: { hsts: false } },
      performance: {
        timing: {
          start: 1738423706874,
          loaded: 1738423706983,
          domContentLoaded: 1738423706983,
        },
        loadTime: 625,
        coreWebVitals: {
          cls: 0,
          fcp: 119.5,
          fid: 0,
          lcp: 0,
          ttfb: 61.09999990463257,
        },
        resourceSizes: {
          css: 0,
          html: 27570,
          fonts: 0,
          other: 0,
          images: 0,
          javascript: 0,
        },
      },
      redirectChain: [],
      searchConsole: {
        path: '/',
        metrics: {
          ctr: 0,
          clicks: 0,
          position: 27.400000000000002,
          impressions: 12,
        },
        topQueries: [
          {
            query: 'dine with friends',
            metrics: { ctr: 0, clicks: 0, position: 9, impressions: 1 },
          },
          {
            query: 'dining with friends',
            metrics: { ctr: 0, clicks: 0, position: 12, impressions: 2 },
          },
          {
            query: 'dinner with friends',
            metrics: { ctr: 0, clicks: 0, position: 39.8, impressions: 5 },
          },
          {
            query: 'dinner with new friends',
            metrics: { ctr: 0, clicks: 0, position: 11, impressions: 1 },
          },
          {
            query: 'dinners with friends',
            metrics: {
              ctr: 0,
              clicks: 0,
              position: 73.99725341796875,
              impressions: 15,
            },
          },
          {
            query: 'friends for dinner',
            metrics: { ctr: 0, clicks: 0, position: 25, impressions: 1 },
          },
          {
            query: 'where like',
            metrics: { ctr: 0, clicks: 0, position: 66, impressions: 1 },
          },
        ],
      },
      mobileFriendliness: {
        fontSize: { base: 16, readable: true },
        isResponsive: true,
        mediaQueries: [],
        touchTargets: { total: 22, tooSmall: 7 },
        viewportMeta: true,
      },
    },
    {
      seo: {
        h1: 'What to expect at your first dinner with friends',
        title: 'Dinners With Friends | What To Expect',
        headings: {
          h1: ['What to expect at your first dinner with friends'],
          h2: [
            'Frequently Asked Questions',
            'Connect, Relax, and Enjoy',
            'What makes Dinners With Friends a memorable experience?',
            'Frequently Asked Questions',
          ],
          h3: [
            'What is Dinners with Friends? Where people become friends over food and fun.',
            'The Dinners with Friends Promise',
            'How does it work?',
            'Choose Your Date and Location',
            'Secure Your Seat',
            'Show Up and Connect',
            'Enjoy the Evening',
            'Join in again and bring new friends',
            'Carefully Curated Groups',
            'Quality Venues',
            'No Pressure, Just Fun',
            'A Community of Friendship',
          ],
        },
        language: 'en',
        metaTags: [
          { name: '', content: '' },
          {
            name: 'description',
            content:
              "We're a social dining experience that brings together people who love good food and great conversation. It's a way to meet new people, expand your social circle, and enjoy a delicious meal in a welcoming atmosphere – all without the hassle of trying to organise it yourself.",
          },
          {
            name: 'og:title',
            content: 'Dinners With Friends | What To Expect',
            property: 'og:title',
          },
          {
            name: 'og:description',
            content:
              "We're a social dining experience that brings together people who love good food and great conversation. It's a way to meet new people, expand your social circle, and enjoy a delicious meal in a welcoming atmosphere – all without the hassle of trying to organise it yourself.",
            property: 'og:description',
          },
          {
            name: 'twitter:title',
            content: 'Dinners With Friends | What To Expect',
            property: 'twitter:title',
          },
          {
            name: 'twitter:description',
            content:
              "We're a social dining experience that brings together people who love good food and great conversation. It's a way to meet new people, expand your social circle, and enjoy a delicious meal in a welcoming atmosphere – all without the hassle of trying to organise it yourself.",
            property: 'twitter:description',
          },
          { name: 'og:type', content: 'website', property: 'og:type' },
          { name: 'twitter:card', content: 'summary_large_image' },
          { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        ],
        canonical: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
        description:
          "We're a social dining experience that brings together people who love good food and great conversation. It's a way to meet new people, expand your social circle, and enjoy a delicious meal in a welcoming atmosphere – all without the hassle of trying to organise it yourself.",
      },
      url: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
      links: {
        links: [
          {
            href: 'https://www.dinnerswithfriends.co.uk/',
            text: '',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'What to Expect',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/about',
            text: 'Who Is Dinner With Friends?',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'News & Articles',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/contact',
            text: 'Contact',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/#events',
            text: 'Book Your Seat',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/contact',
            text: 'Contact Us',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.facebook.com/profile.php?id=61568944958520',
            text: '',
            target: '_blank',
            onClick: false,
            isInternal: false,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'News & Articles',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'What to Expect',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/terms-and-conditions',
            text: 'Terms & Conditions',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/privacy-policy',
            text: 'Privacy Policy',
            onClick: false,
            isInternal: true,
          },
        ],
        linkAnalysis: {
          total: 12,
          external: { ugc: 0, count: 1, social: 1, nofollow: 0, sponsored: 0 },
          internal: { count: 11, navigation: 5 },
        },
      },
      status: 200,
      timing: {
        start: 1738423708082,
        loaded: 1738423708178,
        domContentLoaded: 1738423708178,
      },
      content: {
        wordCount: 707,
        readingTime: 4,
        contentLength: 20409,
        contentQuality: {
          hasLists: true,
          hasImages: true,
          listCount: 6,
          imageCount: 9,
          paragraphCount: 17,
          textToHtmlRatio: 0.2276446665686707,
          averageParagraphLength: 107.47058823529412,
        },
      },
      security: { https: true, headers: { hsts: false } },
      performance: {
        timing: {
          start: 1738423708082,
          loaded: 1738423708178,
          domContentLoaded: 1738423708178,
        },
        loadTime: 610,
        coreWebVitals: {
          cls: 0,
          fcp: 140.59999990463257,
          fid: 0,
          lcp: 0,
          ttfb: 0.2999999523162842,
        },
        resourceSizes: {
          css: 0,
          html: 20409,
          fonts: 0,
          other: 0,
          images: 0,
          javascript: 0,
        },
      },
      redirectChain: [],
      searchConsole: {
        path: '/what-to-expect',
        metrics: { ctr: 0, clicks: 0, position: 0, impressions: 0 },
        topQueries: [],
      },
      mobileFriendliness: {
        fontSize: { base: 16, readable: true },
        isResponsive: true,
        mediaQueries: [],
        touchTargets: { total: 12, tooSmall: 4 },
        viewportMeta: true,
      },
    },
    {
      seo: {
        h1: '',
        title: 'About',
        headings: {
          h1: [],
          h2: [],
          h3: ['Social dining for twenty years and counting.'],
        },
        language: 'en',
        metaTags: [
          { name: '', content: '' },
          { name: 'og:title', content: 'About', property: 'og:title' },
          {
            name: 'twitter:title',
            content: 'About',
            property: 'twitter:title',
          },
          { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        ],
        canonical: 'https://www.dinnerswithfriends.co.uk/about',
        description: '',
      },
      url: 'https://www.dinnerswithfriends.co.uk/about',
      links: {
        links: [
          {
            href: 'https://www.dinnerswithfriends.co.uk/',
            text: '',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'What to Expect',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/about',
            text: 'Who Is Dinner With Friends?',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'News & Articles',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/contact',
            text: 'Contact',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/#events',
            text: 'Book Your Seat',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'Learn More About Dinners With Friends',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.facebook.com/profile.php?id=61568944958520',
            text: '',
            target: '_blank',
            onClick: false,
            isInternal: false,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'News & Articles',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'What to Expect',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/terms-and-conditions',
            text: 'Terms & Conditions',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/privacy-policy',
            text: 'Privacy Policy',
            onClick: false,
            isInternal: true,
          },
        ],
        linkAnalysis: {
          total: 12,
          external: { ugc: 0, count: 1, social: 1, nofollow: 0, sponsored: 0 },
          internal: { count: 11, navigation: 4 },
        },
      },
      status: 200,
      timing: {
        start: 1738423708606,
        loaded: 1738423708686,
        domContentLoaded: 1738423708686,
      },
      content: {
        wordCount: 198,
        readingTime: 1,
        contentLength: 8601,
        contentQuality: {
          hasLists: false,
          hasImages: true,
          listCount: 0,
          imageCount: 5,
          paragraphCount: 2,
          textToHtmlRatio: 0.15986513196139984,
          averageParagraphLength: 10.5,
        },
      },
      security: { https: true, headers: { hsts: false } },
      performance: {
        timing: {
          start: 1738423708606,
          loaded: 1738423708686,
          domContentLoaded: 1738423708686,
        },
        loadTime: 591,
        coreWebVitals: {
          cls: 0,
          fcp: 84.90000009536743,
          fid: 0,
          lcp: 0,
          ttfb: 37.40000009536743,
        },
        resourceSizes: {
          css: 0,
          html: 8601,
          fonts: 0,
          other: 0,
          images: 0,
          javascript: 0,
        },
      },
      redirectChain: [],
      searchConsole: {
        path: '/about',
        metrics: { ctr: 0, clicks: 0, position: 74, impressions: 1 },
        topQueries: [
          {
            query: 'dinners with friends',
            metrics: { ctr: 0, clicks: 0, position: 74, impressions: 1 },
          },
        ],
      },
      mobileFriendliness: {
        fontSize: { base: 16, readable: true },
        isResponsive: true,
        mediaQueries: [],
        touchTargets: { total: 12, tooSmall: 5 },
        viewportMeta: true,
      },
    },
    {
      seo: {
        h1: 'Read More From Dinners With Friends.',
        title: 'Blog',
        headings: {
          h1: ['Read More From Dinners With Friends.'],
          h2: [],
          h3: [],
        },
        language: 'en',
        metaTags: [
          { name: '', content: '' },
          { name: 'og:title', content: 'Blog', property: 'og:title' },
          { name: 'twitter:title', content: 'Blog', property: 'twitter:title' },
          { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        ],
        canonical: 'https://www.dinnerswithfriends.co.uk/blog',
        description: '',
      },
      url: 'https://www.dinnerswithfriends.co.uk/blog',
      links: {
        links: [
          {
            href: 'https://www.dinnerswithfriends.co.uk/',
            text: '',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'What to Expect',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/about',
            text: 'Who Is Dinner With Friends?',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'News & Articles',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/contact',
            text: 'Contact',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/#events',
            text: 'Book Your Seat',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news-types/updates',
            text: 'Updates',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news/is-living-alone-too-much-of-a-good-thing',
            text: 'Read Post',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news-types/press',
            text: 'Press',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news/another-year-put-to-bed',
            text: 'Read Post',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news-types/tutorial',
            text: 'Tutorial',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news/the-waiters-table-11-rant',
            text: 'Read Post',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news-types/product',
            text: 'Product',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news/to-like-or-not-to-like',
            text: 'Read Post',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.facebook.com/profile.php?id=61568944958520',
            text: '',
            target: '_blank',
            onClick: false,
            isInternal: false,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'News & Articles',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'What to Expect',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/terms-and-conditions',
            text: 'Terms & Conditions',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/privacy-policy',
            text: 'Privacy Policy',
            onClick: false,
            isInternal: true,
          },
        ],
        linkAnalysis: {
          total: 19,
          external: { ugc: 0, count: 1, social: 1, nofollow: 0, sponsored: 0 },
          internal: { count: 18, navigation: 4 },
        },
      },
      status: 200,
      timing: {
        start: 1738423709068,
        loaded: 1738423709097,
        domContentLoaded: 1738423709097,
      },
      content: {
        wordCount: 163,
        readingTime: 1,
        contentLength: 16477,
        contentQuality: {
          hasLists: false,
          hasImages: true,
          listCount: 0,
          imageCount: 12,
          paragraphCount: 7,
          textToHtmlRatio: 0.0691266614068095,
          averageParagraphLength: 107.28571428571429,
        },
      },
      security: { https: true, headers: { hsts: false } },
      performance: {
        timing: {
          start: 1738423709068,
          loaded: 1738423709097,
          domContentLoaded: 1738423709097,
        },
        loadTime: 594,
        coreWebVitals: {
          cls: 0,
          fcp: 34.200000047683716,
          fid: 0,
          lcp: 0,
          ttfb: 0.20000004768371582,
        },
        resourceSizes: {
          css: 0,
          html: 16477,
          fonts: 0,
          other: 0,
          images: 0,
          javascript: 0,
        },
      },
      redirectChain: [],
      searchConsole: {
        path: '/blog',
        metrics: { ctr: 0, clicks: 0, position: 0, impressions: 0 },
        topQueries: [],
      },
      mobileFriendliness: {
        fontSize: { base: 16, readable: true },
        isResponsive: true,
        mediaQueries: [],
        touchTargets: { total: 19, tooSmall: 12 },
        viewportMeta: true,
      },
    },
    {
      seo: {
        h1: 'Contact us',
        title: 'Contact',
        headings: { h1: ['Contact us'], h2: [], h3: [] },
        language: 'en',
        metaTags: [
          { name: '', content: '' },
          { name: 'og:title', content: 'Contact', property: 'og:title' },
          {
            name: 'twitter:title',
            content: 'Contact',
            property: 'twitter:title',
          },
          { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        ],
        canonical: 'https://www.dinnerswithfriends.co.uk/contact',
        description: '',
      },
      url: 'https://www.dinnerswithfriends.co.uk/contact',
      links: {
        links: [
          {
            href: 'https://www.dinnerswithfriends.co.uk/',
            text: '',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'What to Expect',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/about',
            text: 'Who Is Dinner With Friends?',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'News & Articles',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/contact',
            text: 'Contact',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/#events',
            text: 'Book Your Seat',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'mailto:aaron.rudyk@gmail.com',
            text: 'hello@dinnerswithfriends.co.uk',
            onClick: false,
            isInternal: false,
          },
          {
            href: 'https://www.facebook.com/profile.php?id=61568944958520',
            text: '',
            target: '_blank',
            onClick: false,
            isInternal: false,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'News & Articles',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'What to Expect',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/terms-and-conditions',
            text: 'Terms & Conditions',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/privacy-policy',
            text: 'Privacy Policy',
            onClick: false,
            isInternal: true,
          },
        ],
        linkAnalysis: {
          total: 12,
          external: { ugc: 0, count: 2, social: 1, nofollow: 0, sponsored: 0 },
          internal: { count: 10, navigation: 4 },
        },
      },
      status: 200,
      timing: {
        start: 1738423709569,
        loaded: 1738423709642,
        domContentLoaded: 1738423709641,
      },
      content: {
        wordCount: 59,
        readingTime: 1,
        contentLength: 10083,
        contentQuality: {
          hasLists: false,
          hasImages: true,
          listCount: 0,
          imageCount: 4,
          paragraphCount: 3,
          textToHtmlRatio: 0.04542298918972528,
          averageParagraphLength: 29,
        },
      },
      security: { https: true, headers: { hsts: false } },
      performance: {
        timing: {
          start: 1738423709569,
          loaded: 1738423709642,
          domContentLoaded: 1738423709641,
        },
        loadTime: 576,
        coreWebVitals: {
          cls: 0,
          fcp: 76.5,
          fid: 0,
          lcp: 0,
          ttfb: 47.69999980926514,
        },
        resourceSizes: {
          css: 0,
          html: 10083,
          fonts: 0,
          other: 0,
          images: 0,
          javascript: 0,
        },
      },
      redirectChain: [],
      searchConsole: {
        path: '/contact',
        metrics: { ctr: 0, clicks: 0, position: 0, impressions: 0 },
        topQueries: [],
      },
      mobileFriendliness: {
        fontSize: { base: 16, readable: true },
        isResponsive: true,
        mediaQueries: [],
        touchTargets: { total: 18, tooSmall: 5 },
        viewportMeta: true,
      },
    },
    {
      seo: {
        h1: 'Terms & Conditions',
        title: 'License',
        headings: { h1: ['Terms & Conditions'], h2: [], h3: [] },
        language: 'en',
        metaTags: [
          { name: '', content: '' },
          { name: 'og:title', content: 'License', property: 'og:title' },
          {
            name: 'twitter:title',
            content: 'License',
            property: 'twitter:title',
          },
          { name: 'viewport', content: 'width=device-width, initial-scale=1' },
          { name: 'robots', content: 'noindex' },
        ],
        canonical: 'https://www.dinnerswithfriends.co.uk/terms-and-conditions',
        description: '',
      },
      url: 'https://www.dinnerswithfriends.co.uk/terms-and-conditions',
      links: {
        links: [
          {
            href: 'https://www.dinnerswithfriends.co.uk/',
            text: '',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'What to Expect',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/about',
            text: 'Who Is Dinner With Friends?',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'News & Articles',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/contact',
            text: 'Contact',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/#events',
            text: 'Book Your Seat',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/terms-and-conditions#',
            text: 'hello@dinnerswithfriends.co.uk‍',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.facebook.com/profile.php?id=61568944958520',
            text: '',
            target: '_blank',
            onClick: false,
            isInternal: false,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'News & Articles',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'What to Expect',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/terms-and-conditions',
            text: 'Terms & Conditions',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/privacy-policy',
            text: 'Privacy Policy',
            onClick: false,
            isInternal: true,
          },
        ],
        linkAnalysis: {
          total: 12,
          external: { ugc: 0, count: 1, social: 1, nofollow: 0, sponsored: 0 },
          internal: { count: 11, navigation: 4 },
        },
      },
      status: 200,
      timing: {
        start: 1738423710106,
        loaded: 1738423710173,
        domContentLoaded: 1738423710173,
      },
      content: {
        wordCount: 702,
        readingTime: 4,
        contentLength: 11546,
        contentQuality: {
          hasLists: false,
          hasImages: true,
          listCount: 0,
          imageCount: 4,
          paragraphCount: 3,
          textToHtmlRatio: 0.4086263641087823,
          averageParagraphLength: 1520.6666666666667,
        },
      },
      security: { https: true, headers: { hsts: false } },
      performance: {
        timing: {
          start: 1738423710106,
          loaded: 1738423710173,
          domContentLoaded: 1738423710173,
        },
        loadTime: 573,
        coreWebVitals: {
          cls: 0,
          fcp: 72,
          fid: 0,
          lcp: 0,
          ttfb: 39.89999985694885,
        },
        resourceSizes: {
          css: 0,
          html: 11546,
          fonts: 0,
          other: 0,
          images: 0,
          javascript: 0,
        },
      },
      redirectChain: [],
      searchConsole: {
        path: '/terms-and-conditions',
        metrics: { ctr: 0, clicks: 0, position: 0, impressions: 0 },
        topQueries: [],
      },
      mobileFriendliness: {
        fontSize: { base: 16, readable: true },
        isResponsive: true,
        mediaQueries: [],
        touchTargets: { total: 12, tooSmall: 5 },
        viewportMeta: true,
      },
    },
    {
      seo: {
        h1: 'Privacy Policy',
        title: 'Privacy Policy',
        headings: {
          h1: ['Privacy Policy'],
          h2: [],
          h3: [
            '1. Who We Are',
            '2. What Data We Collect',
            '3. How We Collect Your Data',
            '4. How We Use Your Data',
            '5. Lawful Basis for Processing',
            '6. Sharing Your Data',
            '7. Data Retention',
            '8. Your Rights Under UK GDPR',
            '9. Data Security',
            '10. Cookie Policy',
            '11. Third-Party Links',
            '12. Changes to This Privacy Policy',
          ],
        },
        language: 'en',
        metaTags: [
          { name: '', content: '' },
          { name: 'og:title', content: 'Privacy Policy', property: 'og:title' },
          {
            name: 'twitter:title',
            content: 'Privacy Policy',
            property: 'twitter:title',
          },
          { name: 'viewport', content: 'width=device-width, initial-scale=1' },
          { name: 'robots', content: 'noindex' },
        ],
        canonical: 'https://www.dinnerswithfriends.co.uk/privacy-policy',
        description: '',
      },
      url: 'https://www.dinnerswithfriends.co.uk/privacy-policy',
      links: {
        links: [
          {
            href: 'https://www.dinnerswithfriends.co.uk/',
            text: '',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'What to Expect',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/about',
            text: 'Who Is Dinner With Friends?',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'News & Articles',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/contact',
            text: 'Contact',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/#events',
            text: 'Book Your Seat',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.facebook.com/profile.php?id=61568944958520',
            text: '',
            target: '_blank',
            onClick: false,
            isInternal: false,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'News & Articles',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'What to Expect',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/terms-and-conditions',
            text: 'Terms & Conditions',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/privacy-policy',
            text: 'Privacy Policy',
            onClick: false,
            isInternal: true,
          },
        ],
        linkAnalysis: {
          total: 11,
          external: { ugc: 0, count: 1, social: 1, nofollow: 0, sponsored: 0 },
          internal: { count: 10, navigation: 4 },
        },
      },
      status: 200,
      timing: {
        start: 1738423710639,
        loaded: 1738423710702,
        domContentLoaded: 1738423710702,
      },
      content: {
        wordCount: 553,
        readingTime: 3,
        contentLength: 11776,
        contentQuality: {
          hasLists: true,
          hasImages: true,
          listCount: 8,
          imageCount: 4,
          paragraphCount: 19,
          textToHtmlRatio: 0.35470448369565216,
          averageParagraphLength: 88.47368421052632,
        },
      },
      security: { https: true, headers: { hsts: false } },
      performance: {
        timing: {
          start: 1738423710639,
          loaded: 1738423710702,
          domContentLoaded: 1738423710702,
        },
        loadTime: 574,
        coreWebVitals: {
          cls: 0,
          fcp: 67.39999985694885,
          fid: 0,
          lcp: 0,
          ttfb: 35.39999985694885,
        },
        resourceSizes: {
          css: 0,
          html: 11776,
          fonts: 0,
          other: 0,
          images: 0,
          javascript: 0,
        },
      },
      redirectChain: [],
      searchConsole: {
        path: '/privacy-policy',
        metrics: { ctr: 0, clicks: 0, position: 0, impressions: 0 },
        topQueries: [],
      },
      mobileFriendliness: {
        fontSize: { base: 16, readable: true },
        isResponsive: true,
        mediaQueries: [],
        touchTargets: { total: 11, tooSmall: 4 },
        viewportMeta: true,
      },
    },
    {
      seo: {
        h1: 'Updates',
        title: 'DinnersWithFriends.co.uk',
        headings: { h1: ['Updates'], h2: [], h3: [] },
        language: 'en',
        metaTags: [
          { name: '', content: '' },
          { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        ],
        canonical: 'https://www.dinnerswithfriends.co.uk/news-types/updates',
        description: '',
      },
      url: 'https://www.dinnerswithfriends.co.uk/news-types/updates',
      links: {
        links: [
          {
            href: 'https://www.dinnerswithfriends.co.uk/',
            text: '',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'What to Expect',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/about',
            text: 'Who Is Dinner With Friends?',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'News & Articles',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/contact',
            text: 'Contact',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/#events',
            text: 'Book Your Seat',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news-types/updates',
            text: 'Updates',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news/is-living-alone-too-much-of-a-good-thing',
            text: 'Read Post',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.facebook.com/profile.php?id=61568944958520',
            text: '',
            target: '_blank',
            onClick: false,
            isInternal: false,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'News & Articles',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'What to Expect',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/terms-and-conditions',
            text: 'Terms & Conditions',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/privacy-policy',
            text: 'Privacy Policy',
            onClick: false,
            isInternal: true,
          },
        ],
        linkAnalysis: {
          total: 13,
          external: { ugc: 0, count: 1, social: 1, nofollow: 0, sponsored: 0 },
          internal: { count: 12, navigation: 4 },
        },
      },
      status: 200,
      timing: {
        start: 1738423711100,
        loaded: 1738423711162,
        domContentLoaded: 1738423711162,
      },
      content: {
        wordCount: 37,
        readingTime: 1,
        contentLength: 9000,
        contentQuality: {
          hasLists: false,
          hasImages: true,
          listCount: 0,
          imageCount: 6,
          paragraphCount: 4,
          textToHtmlRatio: 0.029777777777777778,
          averageParagraphLength: 15.25,
        },
      },
      security: { https: true, headers: { hsts: false } },
      performance: {
        timing: {
          start: 1738423711100,
          loaded: 1738423711162,
          domContentLoaded: 1738423711162,
        },
        loadTime: 578,
        coreWebVitals: {
          cls: 0,
          fcp: 65.59999990463257,
          fid: 0,
          lcp: 0,
          ttfb: 37.299999952316284,
        },
        resourceSizes: {
          css: 0,
          html: 9000,
          fonts: 0,
          other: 0,
          images: 0,
          javascript: 0,
        },
      },
      redirectChain: [],
      searchConsole: {
        path: '/news-types/updates',
        metrics: { ctr: 0, clicks: 0, position: 0, impressions: 0 },
        topQueries: [],
      },
      mobileFriendliness: {
        fontSize: { base: 16, readable: true },
        isResponsive: true,
        mediaQueries: [],
        touchTargets: { total: 13, tooSmall: 6 },
        viewportMeta: true,
      },
    },
    {
      seo: {
        h1: 'Living alone - too much of a good thing?',
        title: 'DinnersWithFriends.co.uk',
        headings: {
          h1: ['Living alone - too much of a good thing?'],
          h2: [
            'It’s funny, isn’t it? People act like being alone is some tragic state, but honestly, it’s mostly very agreeable. No one stealing the duvet, no debates about what’s for dinner (spoiler alert: it’s whatever I want and whenever I feel like it).',
            'More News',
          ],
          h3: [],
        },
        language: 'en',
        metaTags: [
          { name: '', content: '' },
          { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        ],
        canonical:
          'https://www.dinnerswithfriends.co.uk/news/is-living-alone-too-much-of-a-good-thing',
        description: '',
      },
      url: 'https://www.dinnerswithfriends.co.uk/news/is-living-alone-too-much-of-a-good-thing',
      links: {
        links: [
          {
            href: 'https://www.dinnerswithfriends.co.uk/',
            text: '',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'What to Expect',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/about',
            text: 'Who Is Dinner With Friends?',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'News & Articles',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/contact',
            text: 'Contact',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/#events',
            text: 'Book Your Seat',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news-types/updates',
            text: 'Updates',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'All News Types',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://unsplash.com/@hannahbusing?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash',
            text: 'Hannah Busing',
            onClick: false,
            isInternal: false,
          },
          {
            href: 'https://unsplash.com/photos/woman-jumping-in-front-of-brown-wall-0wgFmW8mUXE?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash',
            text: 'Unsplash',
            onClick: false,
            isInternal: false,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news-types/tutorial',
            text: 'Tutorial',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news/the-waiters-table-11-rant',
            text: 'Read Post',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news-types/product',
            text: 'Product',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news/to-like-or-not-to-like',
            text: 'Read Post',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news-types/press',
            text: 'Press',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news/another-year-put-to-bed',
            text: 'Read Post',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.facebook.com/profile.php?id=61568944958520',
            text: '',
            target: '_blank',
            onClick: false,
            isInternal: false,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'News & Articles',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'What to Expect',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/terms-and-conditions',
            text: 'Terms & Conditions',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/privacy-policy',
            text: 'Privacy Policy',
            onClick: false,
            isInternal: true,
          },
        ],
        linkAnalysis: {
          total: 21,
          external: { ugc: 0, count: 3, social: 1, nofollow: 0, sponsored: 0 },
          internal: { count: 18, navigation: 5 },
        },
      },
      status: 200,
      timing: {
        start: 1738423711594,
        loaded: 1738423711622,
        domContentLoaded: 1738423711622,
      },
      content: {
        wordCount: 388,
        readingTime: 2,
        contentLength: 17502,
        contentQuality: {
          hasLists: false,
          hasImages: true,
          listCount: 0,
          imageCount: 11,
          paragraphCount: 9,
          textToHtmlRatio: 0.13501314135527367,
          averageParagraphLength: 29.88888888888889,
        },
      },
      security: { https: true, headers: { hsts: false } },
      performance: {
        timing: {
          start: 1738423711594,
          loaded: 1738423711622,
          domContentLoaded: 1738423711622,
        },
        loadTime: 546,
        coreWebVitals: {
          cls: 0,
          fcp: 36.200000047683716,
          fid: 0,
          lcp: 0,
          ttfb: 0.19999980926513672,
        },
        resourceSizes: {
          css: 0,
          html: 17502,
          fonts: 0,
          other: 0,
          images: 0,
          javascript: 0,
        },
      },
      redirectChain: [],
      searchConsole: {
        path: '/news/is-living-alone-too-much-of-a-good-thing',
        metrics: { ctr: 0, clicks: 0, position: 0, impressions: 0 },
        topQueries: [],
      },
      mobileFriendliness: {
        fontSize: { base: 16, readable: true },
        isResponsive: true,
        mediaQueries: [],
        touchTargets: { total: 21, tooSmall: 14 },
        viewportMeta: true,
      },
    },
    {
      seo: {
        h1: 'Press',
        title: 'DinnersWithFriends.co.uk',
        headings: { h1: ['Press'], h2: [], h3: [] },
        language: 'en',
        metaTags: [
          { name: '', content: '' },
          { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        ],
        canonical: 'https://www.dinnerswithfriends.co.uk/news-types/press',
        description: '',
      },
      url: 'https://www.dinnerswithfriends.co.uk/news-types/press',
      links: {
        links: [
          {
            href: 'https://www.dinnerswithfriends.co.uk/',
            text: '',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'What to Expect',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/about',
            text: 'Who Is Dinner With Friends?',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'News & Articles',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/contact',
            text: 'Contact',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/#events',
            text: 'Book Your Seat',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news-types/press',
            text: 'Press',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news/another-year-put-to-bed',
            text: 'Read Post',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.facebook.com/profile.php?id=61568944958520',
            text: '',
            target: '_blank',
            onClick: false,
            isInternal: false,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'News & Articles',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'What to Expect',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/terms-and-conditions',
            text: 'Terms & Conditions',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/privacy-policy',
            text: 'Privacy Policy',
            onClick: false,
            isInternal: true,
          },
        ],
        linkAnalysis: {
          total: 13,
          external: { ugc: 0, count: 1, social: 1, nofollow: 0, sponsored: 0 },
          internal: { count: 12, navigation: 4 },
        },
      },
      status: 200,
      timing: {
        start: 1738423712167,
        loaded: 1738423712233,
        domContentLoaded: 1738423712233,
      },
      content: {
        wordCount: 36,
        readingTime: 1,
        contentLength: 8994,
        contentQuality: {
          hasLists: false,
          hasImages: true,
          listCount: 0,
          imageCount: 6,
          paragraphCount: 4,
          textToHtmlRatio: 0.029464087169223926,
          averageParagraphLength: 19.25,
        },
      },
      security: { https: true, headers: { hsts: false } },
      performance: {
        timing: {
          start: 1738423712167,
          loaded: 1738423712233,
          domContentLoaded: 1738423712233,
        },
        loadTime: 579,
        coreWebVitals: {
          cls: 0,
          fcp: 68.89999985694885,
          fid: 0,
          lcp: 0,
          ttfb: 38.80000019073486,
        },
        resourceSizes: {
          css: 0,
          html: 8994,
          fonts: 0,
          other: 0,
          images: 0,
          javascript: 0,
        },
      },
      redirectChain: [],
      searchConsole: {
        path: '/news-types/press',
        metrics: { ctr: 0, clicks: 0, position: 0, impressions: 0 },
        topQueries: [],
      },
      mobileFriendliness: {
        fontSize: { base: 16, readable: true },
        isResponsive: true,
        mediaQueries: [],
        touchTargets: { total: 13, tooSmall: 6 },
        viewportMeta: true,
      },
    },
    {
      seo: {
        h1: 'Another year put to bed',
        title: 'DinnersWithFriends.co.uk',
        headings: {
          h1: ['Another year put to bed'],
          h2: ['More News'],
          h3: [],
        },
        language: 'en',
        metaTags: [
          { name: '', content: '' },
          { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        ],
        canonical:
          'https://www.dinnerswithfriends.co.uk/news/another-year-put-to-bed',
        description: '',
      },
      url: 'https://www.dinnerswithfriends.co.uk/news/another-year-put-to-bed',
      links: {
        links: [
          {
            href: 'https://www.dinnerswithfriends.co.uk/',
            text: '',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'What to Expect',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/about',
            text: 'Who Is Dinner With Friends?',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'News & Articles',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/contact',
            text: 'Contact',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/#events',
            text: 'Book Your Seat',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news-types/updates',
            text: 'Updates',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'All News Types',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://unsplash.com/@joannakosinska?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash',
            text: 'Joanna Kosinska',
            onClick: false,
            isInternal: false,
          },
          {
            href: 'https://unsplash.com/photos/green-plant-on-white-surface-vCPnxqNcsKw?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash',
            text: 'Unsplash',
            onClick: false,
            isInternal: false,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news-types/updates',
            text: 'Updates',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news/is-living-alone-too-much-of-a-good-thing',
            text: 'Read Post',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news-types/tutorial',
            text: 'Tutorial',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news/the-waiters-table-11-rant',
            text: 'Read Post',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news-types/product',
            text: 'Product',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news/to-like-or-not-to-like',
            text: 'Read Post',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.facebook.com/profile.php?id=61568944958520',
            text: '',
            target: '_blank',
            onClick: false,
            isInternal: false,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'News & Articles',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'What to Expect',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/terms-and-conditions',
            text: 'Terms & Conditions',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/privacy-policy',
            text: 'Privacy Policy',
            onClick: false,
            isInternal: true,
          },
        ],
        linkAnalysis: {
          total: 21,
          external: { ugc: 0, count: 3, social: 1, nofollow: 0, sponsored: 0 },
          internal: { count: 18, navigation: 5 },
        },
      },
      status: 200,
      timing: {
        start: 1738423712520,
        loaded: 1738423712551,
        domContentLoaded: 1738423712551,
      },
      content: {
        wordCount: 197,
        readingTime: 1,
        contentLength: 16276,
        contentQuality: {
          hasLists: false,
          hasImages: true,
          listCount: 0,
          imageCount: 11,
          paragraphCount: 15,
          textToHtmlRatio: 0.07680019660850332,
          averageParagraphLength: 59.86666666666667,
        },
      },
      security: { https: true, headers: { hsts: false } },
      performance: {
        timing: {
          start: 1738423712520,
          loaded: 1738423712551,
          domContentLoaded: 1738423712551,
        },
        loadTime: 536,
        coreWebVitals: {
          cls: 0,
          fcp: 39.299999952316284,
          fid: 0,
          lcp: 0,
          ttfb: 0.10000014305114746,
        },
        resourceSizes: {
          css: 0,
          html: 16276,
          fonts: 0,
          other: 0,
          images: 0,
          javascript: 0,
        },
      },
      redirectChain: [],
      searchConsole: {
        path: '/news/another-year-put-to-bed',
        metrics: { ctr: 0, clicks: 0, position: 0, impressions: 0 },
        topQueries: [],
      },
      mobileFriendliness: {
        fontSize: { base: 16, readable: true },
        isResponsive: true,
        mediaQueries: [],
        touchTargets: { total: 21, tooSmall: 14 },
        viewportMeta: true,
      },
    },
    {
      seo: {
        h1: 'Tutorial',
        title: 'DinnersWithFriends.co.uk',
        headings: { h1: ['Tutorial'], h2: [], h3: [] },
        language: 'en',
        metaTags: [
          { name: '', content: '' },
          { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        ],
        canonical: 'https://www.dinnerswithfriends.co.uk/news-types/tutorial',
        description: '',
      },
      url: 'https://www.dinnerswithfriends.co.uk/news-types/tutorial',
      links: {
        links: [
          {
            href: 'https://www.dinnerswithfriends.co.uk/',
            text: '',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'What to Expect',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/about',
            text: 'Who Is Dinner With Friends?',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'News & Articles',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/contact',
            text: 'Contact',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/#events',
            text: 'Book Your Seat',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news-types/tutorial',
            text: 'Tutorial',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news/the-waiters-table-11-rant',
            text: 'Read Post',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.facebook.com/profile.php?id=61568944958520',
            text: '',
            target: '_blank',
            onClick: false,
            isInternal: false,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'News & Articles',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'What to Expect',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/terms-and-conditions',
            text: 'Terms & Conditions',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/privacy-policy',
            text: 'Privacy Policy',
            onClick: false,
            isInternal: true,
          },
        ],
        linkAnalysis: {
          total: 13,
          external: { ugc: 0, count: 1, social: 1, nofollow: 0, sponsored: 0 },
          internal: { count: 12, navigation: 4 },
        },
      },
      status: 200,
      timing: {
        start: 1738423713182,
        loaded: 1738423713247,
        domContentLoaded: 1738423713247,
      },
      content: {
        wordCount: 34,
        readingTime: 1,
        contentLength: 8977,
        contentQuality: {
          hasLists: false,
          hasImages: true,
          listCount: 0,
          imageCount: 6,
          paragraphCount: 4,
          textToHtmlRatio: 0.028740113623705023,
          averageParagraphLength: 14.75,
        },
      },
      security: { https: true, headers: { hsts: false } },
      performance: {
        timing: {
          start: 1738423713182,
          loaded: 1738423713247,
          domContentLoaded: 1738423713247,
        },
        loadTime: 571,
        coreWebVitals: {
          cls: 0,
          fcp: 68,
          fid: 0,
          lcp: 0,
          ttfb: 38.200000047683716,
        },
        resourceSizes: {
          css: 0,
          html: 8977,
          fonts: 0,
          other: 0,
          images: 0,
          javascript: 0,
        },
      },
      redirectChain: [],
      searchConsole: {
        path: '/news-types/tutorial',
        metrics: { ctr: 0, clicks: 0, position: 0, impressions: 0 },
        topQueries: [],
      },
      mobileFriendliness: {
        fontSize: { base: 16, readable: true },
        isResponsive: true,
        mediaQueries: [],
        touchTargets: { total: 13, tooSmall: 6 },
        viewportMeta: true,
      },
    },
    {
      seo: {
        h1: 'The Waiter’s Table 11 Rant',
        title: 'DinnersWithFriends.co.uk',
        headings: {
          h1: ['The Waiter’s Table 11 Rant'],
          h2: [
            'From butter knives doubling as fencing sabres to open-mouthed chewing that could rival a barnyard chorus, they’ve truly made an impression.',
            'More News',
          ],
          h3: [],
        },
        language: 'en',
        metaTags: [
          { name: '', content: '' },
          { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        ],
        canonical:
          'https://www.dinnerswithfriends.co.uk/news/the-waiters-table-11-rant',
        description: '',
      },
      url: 'https://www.dinnerswithfriends.co.uk/news/the-waiters-table-11-rant',
      links: {
        links: [
          {
            href: 'https://www.dinnerswithfriends.co.uk/',
            text: '',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'What to Expect',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/about',
            text: 'Who Is Dinner With Friends?',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'News & Articles',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/contact',
            text: 'Contact',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/#events',
            text: 'Book Your Seat',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news-types/updates',
            text: 'Updates',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'All News Types',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://unsplash.com/@littlegreeneyes?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash',
            text: 'Jessie McCall',
            onClick: false,
            isInternal: false,
          },
          {
            href: 'https://unsplash.com/photos/man-in-white-button-up-shirt-holding-black-and-white-box-guXX_Wm-wnY?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash',
            text: 'Unsplash',
            onClick: false,
            isInternal: false,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news-types/updates',
            text: 'Updates',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news/is-living-alone-too-much-of-a-good-thing',
            text: 'Read Post',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news-types/product',
            text: 'Product',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news/to-like-or-not-to-like',
            text: 'Read Post',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news-types/press',
            text: 'Press',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news/another-year-put-to-bed',
            text: 'Read Post',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.facebook.com/profile.php?id=61568944958520',
            text: '',
            target: '_blank',
            onClick: false,
            isInternal: false,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'News & Articles',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'What to Expect',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/terms-and-conditions',
            text: 'Terms & Conditions',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/privacy-policy',
            text: 'Privacy Policy',
            onClick: false,
            isInternal: true,
          },
        ],
        linkAnalysis: {
          total: 21,
          external: { ugc: 0, count: 3, social: 1, nofollow: 0, sponsored: 0 },
          internal: { count: 18, navigation: 5 },
        },
      },
      status: 200,
      timing: {
        start: 1738423713421,
        loaded: 1738423713485,
        domContentLoaded: 1738423713485,
      },
      content: {
        wordCount: 547,
        readingTime: 3,
        contentLength: 18510,
        contentQuality: {
          hasLists: true,
          hasImages: true,
          listCount: 1,
          imageCount: 11,
          paragraphCount: 21,
          textToHtmlRatio: 0.17774176121015667,
          averageParagraphLength: 117.38095238095238,
        },
      },
      security: { https: true, headers: { hsts: false } },
      performance: {
        timing: {
          start: 1738423713421,
          loaded: 1738423713485,
          domContentLoaded: 1738423713485,
        },
        loadTime: 575,
        coreWebVitals: {
          cls: 0,
          fcp: 71.40000009536743,
          fid: 0,
          lcp: 0,
          ttfb: 38.09999990463257,
        },
        resourceSizes: {
          css: 0,
          html: 18510,
          fonts: 0,
          other: 0,
          images: 0,
          javascript: 0,
        },
      },
      redirectChain: [],
      searchConsole: {
        path: '/news/the-waiters-table-11-rant',
        metrics: { ctr: 0, clicks: 0, position: 56.25, impressions: 4 },
        topQueries: [
          {
            query: 'barnyard cow tipping',
            metrics: { ctr: 0, clicks: 0, position: 72, impressions: 1 },
          },
          {
            query: 'fencing spoons',
            metrics: { ctr: 0, clicks: 0, position: 46, impressions: 1 },
          },
          {
            query: 'soundtrack collateral',
            metrics: { ctr: 0, clicks: 0, position: 99, impressions: 1 },
          },
          {
            query: 'waiters rant',
            metrics: { ctr: 0, clicks: 0, position: 8, impressions: 1 },
          },
        ],
      },
      mobileFriendliness: {
        fontSize: { base: 16, readable: true },
        isResponsive: true,
        mediaQueries: [],
        touchTargets: { total: 21, tooSmall: 14 },
        viewportMeta: true,
      },
    },
    {
      seo: {
        h1: 'Product',
        title: 'DinnersWithFriends.co.uk',
        headings: { h1: ['Product'], h2: [], h3: [] },
        language: 'en',
        metaTags: [
          { name: '', content: '' },
          { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        ],
        canonical: 'https://www.dinnerswithfriends.co.uk/news-types/product',
        description: '',
      },
      url: 'https://www.dinnerswithfriends.co.uk/news-types/product',
      links: {
        links: [
          {
            href: 'https://www.dinnerswithfriends.co.uk/',
            text: '',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'What to Expect',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/about',
            text: 'Who Is Dinner With Friends?',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'News & Articles',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/contact',
            text: 'Contact',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/#events',
            text: 'Book Your Seat',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news-types/product',
            text: 'Product',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news/to-like-or-not-to-like',
            text: 'Read Post',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.facebook.com/profile.php?id=61568944958520',
            text: '',
            target: '_blank',
            onClick: false,
            isInternal: false,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'News & Articles',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'What to Expect',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/terms-and-conditions',
            text: 'Terms & Conditions',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/privacy-policy',
            text: 'Privacy Policy',
            onClick: false,
            isInternal: true,
          },
        ],
        linkAnalysis: {
          total: 13,
          external: { ugc: 0, count: 1, social: 1, nofollow: 0, sponsored: 0 },
          internal: { count: 12, navigation: 4 },
        },
      },
      status: 200,
      timing: {
        start: 1738423714249,
        loaded: 1738423714314,
        domContentLoaded: 1738423714314,
      },
      content: {
        wordCount: 34,
        readingTime: 1,
        contentLength: 9058,
        contentQuality: {
          hasLists: false,
          hasImages: true,
          listCount: 0,
          imageCount: 6,
          paragraphCount: 4,
          textToHtmlRatio: 0.02903510708765732,
          averageParagraphLength: 17.75,
        },
      },
      security: { https: true, headers: { hsts: false } },
      performance: {
        timing: {
          start: 1738423714249,
          loaded: 1738423714314,
          domContentLoaded: 1738423714314,
        },
        loadTime: 578,
        coreWebVitals: {
          cls: 0,
          fcp: 68,
          fid: 0,
          lcp: 0,
          ttfb: 37.39999985694885,
        },
        resourceSizes: {
          css: 0,
          html: 9058,
          fonts: 0,
          other: 0,
          images: 0,
          javascript: 0,
        },
      },
      redirectChain: [],
      searchConsole: {
        path: '/news-types/product',
        metrics: { ctr: 0, clicks: 0, position: 0, impressions: 0 },
        topQueries: [],
      },
      mobileFriendliness: {
        fontSize: { base: 16, readable: true },
        isResponsive: true,
        mediaQueries: [],
        touchTargets: { total: 13, tooSmall: 6 },
        viewportMeta: true,
      },
    },
    {
      seo: {
        h1: 'To like, or not to like?',
        title: 'DinnersWithFriends.co.uk',
        headings: {
          h1: ['To like, or not to like?'],
          h2: [
            'Have emoticons become a replacement for real-life connections over tone, body language, and shared moments? Are we losing the art of real-life communication?',
            'More News',
          ],
          h3: [],
        },
        language: 'en',
        metaTags: [
          { name: '', content: '' },
          { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        ],
        canonical:
          'https://www.dinnerswithfriends.co.uk/news/to-like-or-not-to-like',
        description: '',
      },
      url: 'https://www.dinnerswithfriends.co.uk/news/to-like-or-not-to-like',
      links: {
        links: [
          {
            href: 'https://www.dinnerswithfriends.co.uk/',
            text: '',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'What to Expect',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/about',
            text: 'Who Is Dinner With Friends?',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'News & Articles',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/contact',
            text: 'Contact',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/#events',
            text: 'Book Your Seat',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news-types/updates',
            text: 'Updates',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'All News Types',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://unsplash.com/@ricdeoliveira?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash',
            text: 'Ruan Richard Rodrigues',
            onClick: false,
            isInternal: false,
          },
          {
            href: 'https://unsplash.com/photos/a-woman-holding-a-cell-phone-in-her-hands-3rF8_cdXkbo?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash',
            text: 'Unsplash',
            onClick: false,
            isInternal: false,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news-types/updates',
            text: 'Updates',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news/is-living-alone-too-much-of-a-good-thing',
            text: 'Read Post',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news-types/tutorial',
            text: 'Tutorial',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news/the-waiters-table-11-rant',
            text: 'Read Post',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news-types/press',
            text: 'Press',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/news/another-year-put-to-bed',
            text: 'Read Post',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.facebook.com/profile.php?id=61568944958520',
            text: '',
            target: '_blank',
            onClick: false,
            isInternal: false,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/blog',
            text: 'News & Articles',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/what-to-expect',
            text: 'What to Expect',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/terms-and-conditions',
            text: 'Terms & Conditions',
            onClick: false,
            isInternal: true,
          },
          {
            href: 'https://www.dinnerswithfriends.co.uk/privacy-policy',
            text: 'Privacy Policy',
            onClick: false,
            isInternal: true,
          },
        ],
        linkAnalysis: {
          total: 21,
          external: { ugc: 0, count: 3, social: 1, nofollow: 0, sponsored: 0 },
          internal: { count: 18, navigation: 5 },
        },
      },
      status: 200,
      timing: {
        start: 1738423714522,
        loaded: 1738423714589,
        domContentLoaded: 1738423714589,
      },
      content: {
        wordCount: 324,
        readingTime: 2,
        contentLength: 17056,
        contentQuality: {
          hasLists: false,
          hasImages: true,
          listCount: 0,
          imageCount: 11,
          paragraphCount: 13,
          textToHtmlRatio: 0.1187265478424015,
          averageParagraphLength: 116.53846153846153,
        },
      },
      security: { https: true, headers: { hsts: false } },
      performance: {
        timing: {
          start: 1738423714522,
          loaded: 1738423714589,
          domContentLoaded: 1738423714589,
        },
        loadTime: 575,
        coreWebVitals: {
          cls: 0,
          fcp: 72.90000009536743,
          fid: 0,
          lcp: 0,
          ttfb: 40.700000047683716,
        },
        resourceSizes: {
          css: 0,
          html: 17056,
          fonts: 0,
          other: 0,
          images: 0,
          javascript: 0,
        },
      },
      redirectChain: [],
      searchConsole: {
        path: '/news/to-like-or-not-to-like',
        metrics: { ctr: 0, clicks: 0, position: 0, impressions: 0 },
        topQueries: [],
      },
      mobileFriendliness: {
        fontSize: { base: 16, readable: true },
        isResponsive: true,
        mediaQueries: [],
        touchTargets: { total: 21, tooSmall: 14 },
        viewportMeta: true,
      },
    },
  ],
  config: {
    url: 'https://www.dinnerswithfriends.co.uk',
    user: {
      id: '7356fed1-b88c-4eb1-a5b9-292e962ca0b7',
      email: 'doug@withseismic.com',
    },
    scPropertyName: 'sc-domain:dinnerswithfriends.co.uk',
  },
  errors: { errorPages: [], errorTypes: {}, totalErrors: 0 },
  summary: {
    seo: {
      titleStats: {
        missing: 0,
        tooLong: 1,
        tooShort: 13,
        duplicates: 7,
        averageLength: 22.933333333333334,
      },
      headingStats: {
        missingH1: 1,
        multipleH1: 1,
        averageH2Count: 1,
        averageH3Count: 1.6666666666666667,
        averageH1Length: 21.8,
      },
      metaTagStats: {
        commonTags: [
          { name: '', count: 15 },
          { name: 'viewport', count: 15 },
          { name: 'og:title', count: 7 },
          { name: 'twitter:title', count: 7 },
          { name: 'description', count: 2 },
          { name: 'og:description', count: 2 },
          { name: 'twitter:description', count: 2 },
          { name: 'og:type', count: 2 },
          { name: 'twitter:card', count: 2 },
          { name: 'robots', count: 2 },
        ],
        averageCount: 3.8666666666666667,
        missingRequired: 15,
      },
      languageStats: {
        languages: [{ code: 'en', count: 15 }],
        missingLanguage: 0,
      },
      canonicalStats: { missing: 0, different: 0, selfReferencing: 15 },
      descriptionStats: {
        missing: 13,
        tooLong: 2,
        tooShort: 13,
        duplicates: 12,
        averageLength: 31,
      },
    },
    links: {
      totalLinks: 236,
      uniqueLinks: 29,
      externalLinks: {
        ugc: 0,
        total: 25,
        social: 15,
        unique: 11,
        nofollow: 0,
        sponsored: 0,
        averagePerPage: 1.6666666666666667,
      },
      internalLinks: {
        total: 211,
        unique: 18,
        navigation: 65,
        averagePerPage: 14.066666666666666,
      },
      topExternalDomains: [
        { count: 15, domain: 'www.facebook.com' },
        { count: 8, domain: 'unsplash.com' },
        { count: 1, domain: 'www.eventbrite.co.uk' },
        { count: 1, domain: '' },
      ],
      commonNavigationPaths: [
        { path: '/', count: 37 },
        { path: '/what-to-expect', count: 34 },
        { path: '/blog', count: 34 },
        { path: '/contact', count: 16 },
        { path: '/terms-and-conditions', count: 16 },
        { path: '/about', count: 15 },
        { path: '/privacy-policy', count: 15 },
        { path: '/news-types/updates', count: 9 },
        { path: '/news/is-living-alone-too-much-of-a-good-thing', count: 5 },
        { path: '/news-types/press', count: 5 },
      ],
    },
    content: {
      wordStats: {
        maxWords: 707,
        minWords: 34,
        totalWords: 4503,
        medianWords: 198,
        averageWords: 300.2,
        readabilityScore: 52.46316154695121,
      },
      readingTimeStats: {
        totalReadingTime: 29,
        averageReadingTime: 1.9333333333333333,
        readingTimeDistribution: {
          over10min: 0,
          under2min: 10,
          under5min: 5,
          under10min: 0,
        },
      },
      contentLengthStats: {
        totalLength: 211835,
        medianLength: 11776,
        averageLength: 14122.333333333334,
        lengthDistribution: { large: 5, small: 0, medium: 0, extraLarge: 10 },
      },
      contentQualityStats: {
        pagesWithLists: 3,
        pagesWithImages: 15,
        averageListsPerPage: 1,
        averageImagesPerPage: 8.933333333333334,
        averageParagraphLength: 156.05894152487807,
        averageTextToHtmlRatio: 0.13452133126884347,
        averageParagraphsPerPage: 10.466666666666667,
      },
    },
    security: {
      httpsStats: { totalHttp: 0, totalHttps: 15, percentageSecure: 100 },
      headerStats: {
        cspAdoption: 0,
        hstsAdoption: 0,
        commonXFrameOptions: [],
        averageHeadersPerPage: 1,
        xFrameOptionsAdoption: 0,
        xContentTypeOptionsAdoption: 0,
      },
      securityScore: {
        https: 100,
        headers: 0,
        overall: 50,
        breakdown: {
          cspScore: 0,
          hstsScore: 0,
          xFrameOptionsScore: 0,
          xContentTypeOptionsScore: 0,
        },
      },
    },
    performance: {
      coreWebVitals: {
        scores: {
          clsScore: 100,
          fcpScore: 95.98000000052981,
          fidScore: 100,
          lcpScore: 100,
          ttfbScore: 96.22666667103768,
          overallScore: 98.4413333343135,
        },
        averages: {
          cls: 0,
          fcp: 72.35999999046325,
          fid: 0,
          lcp: 0,
          ttfb: 30.186666631698607,
        },
        thresholds: {
          goodCls: 100,
          goodFcp: 100,
          goodFid: 100,
          goodLcp: 100,
          goodTtfb: 100,
        },
      },
      loadTimeStats: {
        max: 625,
        min: 536,
        p95: 625,
        median: 576,
        average: 578.7333333333333,
      },
      resourceStats: {
        totalSizes: {
          css: 0,
          html: 211835,
          fonts: 0,
          other: 0,
          images: 0,
          javascript: 0,
        },
        averageSizes: {
          css: 0,
          html: 14122.333333333334,
          fonts: 0,
          other: 0,
          images: 0,
          javascript: 0,
        },
        totalRequests: {
          css: 15,
          html: 15,
          fonts: 15,
          other: 15,
          images: 15,
          javascript: 15,
        },
      },
      timingAverages: {
        loaded: 1738423711110.9333,
        domContentLoaded: 1738423711110.8667,
      },
    },
    searchConsole: {
      topPages: [
        {
          path: '/',
          metrics: {
            ctr: 0,
            clicks: 0,
            position: 27.400000000000002,
            impressions: 12,
          },
        },
        {
          path: '/what-to-expect',
          metrics: { ctr: 0, clicks: 0, position: 0, impressions: 0 },
        },
        {
          path: '/about',
          metrics: { ctr: 0, clicks: 0, position: 74, impressions: 1 },
        },
        {
          path: '/blog',
          metrics: { ctr: 0, clicks: 0, position: 0, impressions: 0 },
        },
        {
          path: '/contact',
          metrics: { ctr: 0, clicks: 0, position: 0, impressions: 0 },
        },
        {
          path: '/terms-and-conditions',
          metrics: { ctr: 0, clicks: 0, position: 0, impressions: 0 },
        },
        {
          path: '/privacy-policy',
          metrics: { ctr: 0, clicks: 0, position: 0, impressions: 0 },
        },
        {
          path: '/news-types/updates',
          metrics: { ctr: 0, clicks: 0, position: 0, impressions: 0 },
        },
        {
          path: '/news/is-living-alone-too-much-of-a-good-thing',
          metrics: { ctr: 0, clicks: 0, position: 0, impressions: 0 },
        },
        {
          path: '/news-types/press',
          metrics: { ctr: 0, clicks: 0, position: 0, impressions: 0 },
        },
      ],
      pathAnalysis: {
        mostClicked: [
          { path: '/', clicks: 0 },
          { path: '/what-to-expect', clicks: 0 },
          { path: '/about', clicks: 0 },
          { path: '/blog', clicks: 0 },
          { path: '/contact', clicks: 0 },
          { path: '/terms-and-conditions', clicks: 0 },
          { path: '/privacy-policy', clicks: 0 },
          { path: '/news-types/updates', clicks: 0 },
          { path: '/news/is-living-alone-too-much-of-a-good-thing', clicks: 0 },
          { path: '/news-types/press', clicks: 0 },
        ],
        bestPosition: [
          { path: '/what-to-expect', position: 0 },
          { path: '/blog', position: 0 },
          { path: '/contact', position: 0 },
          { path: '/terms-and-conditions', position: 0 },
          { path: '/privacy-policy', position: 0 },
          { path: '/news-types/updates', position: 0 },
          {
            path: '/news/is-living-alone-too-much-of-a-good-thing',
            position: 0,
          },
          { path: '/news-types/press', position: 0 },
          { path: '/news/another-year-put-to-bed', position: 0 },
          { path: '/news-types/tutorial', position: 0 },
        ],
        mostImpressed: [
          { path: '/', impressions: 12 },
          { path: '/news/the-waiters-table-11-rant', impressions: 4 },
          { path: '/about', impressions: 1 },
          { path: '/what-to-expect', impressions: 0 },
          { path: '/blog', impressions: 0 },
          { path: '/contact', impressions: 0 },
          { path: '/terms-and-conditions', impressions: 0 },
          { path: '/privacy-policy', impressions: 0 },
          { path: '/news-types/updates', impressions: 0 },
          {
            path: '/news/is-living-alone-too-much-of-a-good-thing',
            impressions: 0,
          },
        ],
      },
      totalMetrics: {
        averageCtr: 0,
        totalClicks: 0,
        averagePosition: 10.51,
        totalImpressions: 17,
      },
      queryAnalysis: {
        topQueries: [
          {
            query: 'dine with friends',
            metrics: { ctr: 0, clicks: 0, position: 9, impressions: 1 },
          },
          {
            query: 'dining with friends',
            metrics: { ctr: 0, clicks: 0, position: 12, impressions: 2 },
          },
          {
            query: 'dinner with friends',
            metrics: { ctr: 0, clicks: 0, position: 39.8, impressions: 5 },
          },
          {
            query: 'dinner with new friends',
            metrics: { ctr: 0, clicks: 0, position: 11, impressions: 1 },
          },
          {
            query: 'dinners with friends',
            metrics: {
              ctr: 0,
              clicks: 0,
              position: 73.99725341796875,
              impressions: 15,
            },
          },
          {
            query: 'friends for dinner',
            metrics: { ctr: 0, clicks: 0, position: 25, impressions: 1 },
          },
          {
            query: 'where like',
            metrics: { ctr: 0, clicks: 0, position: 66, impressions: 1 },
          },
          {
            query: 'barnyard cow tipping',
            metrics: { ctr: 0, clicks: 0, position: 72, impressions: 1 },
          },
          {
            query: 'fencing spoons',
            metrics: { ctr: 0, clicks: 0, position: 46, impressions: 1 },
          },
          {
            query: 'soundtrack collateral',
            metrics: { ctr: 0, clicks: 0, position: 99, impressions: 1 },
          },
          {
            query: 'waiters rant',
            metrics: { ctr: 0, clicks: 0, position: 8, impressions: 1 },
          },
        ],
        queryCategories: {
          branded: [],
          longTail: [
            {
              query: 'dine with friends',
              metrics: { ctr: 0, clicks: 0, position: 9, impressions: 1 },
            },
            {
              query: 'dining with friends',
              metrics: { ctr: 0, clicks: 0, position: 12, impressions: 2 },
            },
            {
              query: 'dinner with friends',
              metrics: { ctr: 0, clicks: 0, position: 39.8, impressions: 5 },
            },
            {
              query: 'dinner with new friends',
              metrics: { ctr: 0, clicks: 0, position: 11, impressions: 1 },
            },
            {
              query: 'dinners with friends',
              metrics: {
                ctr: 0,
                clicks: 0,
                position: 73.99725341796875,
                impressions: 15,
              },
            },
            {
              query: 'friends for dinner',
              metrics: { ctr: 0, clicks: 0, position: 25, impressions: 1 },
            },
            {
              query: 'barnyard cow tipping',
              metrics: { ctr: 0, clicks: 0, position: 72, impressions: 1 },
            },
          ],
          nonBranded: [
            {
              query: 'dine with friends',
              metrics: { ctr: 0, clicks: 0, position: 9, impressions: 1 },
            },
            {
              query: 'dining with friends',
              metrics: { ctr: 0, clicks: 0, position: 12, impressions: 2 },
            },
            {
              query: 'dinner with friends',
              metrics: { ctr: 0, clicks: 0, position: 39.8, impressions: 5 },
            },
            {
              query: 'dinner with new friends',
              metrics: { ctr: 0, clicks: 0, position: 11, impressions: 1 },
            },
            {
              query: 'dinners with friends',
              metrics: {
                ctr: 0,
                clicks: 0,
                position: 73.99725341796875,
                impressions: 15,
              },
            },
            {
              query: 'friends for dinner',
              metrics: { ctr: 0, clicks: 0, position: 25, impressions: 1 },
            },
            {
              query: 'where like',
              metrics: { ctr: 0, clicks: 0, position: 66, impressions: 1 },
            },
            {
              query: 'barnyard cow tipping',
              metrics: { ctr: 0, clicks: 0, position: 72, impressions: 1 },
            },
            {
              query: 'fencing spoons',
              metrics: { ctr: 0, clicks: 0, position: 46, impressions: 1 },
            },
            {
              query: 'soundtrack collateral',
              metrics: { ctr: 0, clicks: 0, position: 99, impressions: 1 },
            },
            {
              query: 'waiters rant',
              metrics: { ctr: 0, clicks: 0, position: 8, impressions: 1 },
            },
          ],
        },
      },
    },
    mobileFriendliness: {
      fontStats: {
        readablePages: 15,
        averageBaseSize: 16,
        percentageReadable: 100,
        fontSizeDistribution: { good: 15, large: 0, tooSmall: 0 },
      },
      mobileScore: {
        overall: 62.396694214876035,
        breakdown: {
          fontScore: 100,
          mediaQueryScore: 0,
          responsiveScore: 100,
          touchTargetScore: 49.586776859504134,
        },
      },
      mediaQueryStats: {
        commonFeatures: [],
        commonBreakpoints: [],
        averageQueriesPerPage: 0,
      },
      responsiveStats: {
        totalResponsive: 15,
        totalNonResponsive: 0,
        percentageResponsive: 100,
        viewportMetaAdoption: 100,
      },
      touchTargetStats: {
        averageSmallTargets: 8.133333333333333,
        averageTargetsPerPage: 16.133333333333333,
        percentageSmallTargets: 50.413223140495866,
        pagesWithAccessibleTargets: 0,
      },
    },
  },
  progress: {
    status: 'completed',
    endTime: '2025-02-01T15:28:35.436Z',
    startTime: '2025-02-01T15:28:24.884Z',
    currentUrl:
      'https://www.dinnerswithfriends.co.uk/news/to-like-or-not-to-like',
    failedUrls: 0,
    totalPages: 15,
    uniqueUrls: 15,
    skippedUrls: 0,
    currentDepth: 0,
    pagesAnalyzed: 15,
  },
}
