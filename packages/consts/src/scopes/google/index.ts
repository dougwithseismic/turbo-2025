// https://developers.google.com/identity/protocols/oauth2/scopes

export const GOOGLE_SCOPES = {
  // Search Console
  WEBMASTERS: 'https://www.googleapis.com/auth/webmasters',
  WEBMASTERS_READONLY: 'https://www.googleapis.com/auth/webmasters.readonly',

  // Cloud Platform
  CLOUD_PLATFORM: 'https://www.googleapis.com/auth/cloud-platform',
  CLOUD_PLATFORM_READONLY:
    'https://www.googleapis.com/auth/cloud-platform.read-only',

  // Analytics
  ANALYTICS: 'https://www.googleapis.com/auth/analytics',
  ANALYTICS_READONLY: 'https://www.googleapis.com/auth/analytics.readonly',

  // Site Verification
  SITEVERIFICATION: 'https://www.googleapis.com/auth/siteverification',
  SITEVERIFICATION_VERIFY_ONLY:
    'https://www.googleapis.com/auth/siteverification.verify_only',

  // Sheets
  SPREADSHEETS: 'https://www.googleapis.com/auth/spreadsheets',
  SPREADSHEETS_READONLY:
    'https://www.googleapis.com/auth/spreadsheets.readonly',

  // Drive
  DRIVE: 'https://www.googleapis.com/auth/drive',
  DRIVE_APPDATA: 'https://www.googleapis.com/auth/drive.appdata',
  DRIVE_FILE: 'https://www.googleapis.com/auth/drive.file',
  DRIVE_METADATA: 'https://www.googleapis.com/auth/drive.metadata',
  DRIVE_METADATA_READONLY:
    'https://www.googleapis.com/auth/drive.metadata.readonly',
  DRIVE_PHOTOS_READONLY:
    'https://www.googleapis.com/auth/drive.photos.readonly',
  DRIVE_READONLY: 'https://www.googleapis.com/auth/drive.readonly',
  DRIVE_SCRIPTS: 'https://www.googleapis.com/auth/drive.scripts',

  // Gmail
  GMAIL_COMPOSE: 'https://www.googleapis.com/auth/gmail.compose',
  GMAIL_MODIFY: 'https://www.googleapis.com/auth/gmail.modify',
  GMAIL_READONLY: 'https://www.googleapis.com/auth/gmail.readonly',
  GMAIL_SEND: 'https://www.googleapis.com/auth/gmail.send',

  // Calendar
  CALENDAR: 'https://www.googleapis.com/auth/calendar',
  CALENDAR_EVENTS: 'https://www.googleapis.com/auth/calendar.events',
  CALENDAR_EVENTS_READONLY:
    'https://www.googleapis.com/auth/calendar.events.readonly',
  CALENDAR_READONLY: 'https://www.googleapis.com/auth/calendar.readonly',
  CALENDAR_SETTINGS_READONLY:
    'https://www.googleapis.com/auth/calendar.settings.readonly',

  // OpenID Connect
  EMAIL: 'email',
  OPENID: 'openid',
  PROFILE: 'profile',

  // People
  CONTACTS: 'https://www.googleapis.com/auth/contacts',
  CONTACTS_OTHER_READONLY:
    'https://www.googleapis.com/auth/contacts.other.readonly',
  CONTACTS_READONLY: 'https://www.googleapis.com/auth/contacts.readonly',
  DIRECTORY_READONLY: 'https://www.googleapis.com/auth/directory.readonly',
  USER_ADDRESSES_READ: 'https://www.googleapis.com/auth/user.addresses.read',
  USER_BIRTHDAY_READ: 'https://www.googleapis.com/auth/user.birthday.read',
  USER_EMAILS_READ: 'https://www.googleapis.com/auth/user.emails.read',
  USER_GENDER_READ: 'https://www.googleapis.com/auth/user.gender.read',
  USER_ORGANIZATION_READ:
    'https://www.googleapis.com/auth/user.organization.read',
  USER_PHONENUMBERS_READ:
    'https://www.googleapis.com/auth/user.phonenumbers.read',

  // Photos Library
  PHOTOS_LIBRARY: 'https://www.googleapis.com/auth/photoslibrary',
  PHOTOS_LIBRARY_APPEND:
    'https://www.googleapis.com/auth/photoslibrary.appendonly',
  PHOTOS_LIBRARY_EDIT_APPCREATED:
    'https://www.googleapis.com/auth/photoslibrary.edit.appcreateddata',
  PHOTOS_LIBRARY_READONLY:
    'https://www.googleapis.com/auth/photoslibrary.readonly',
  PHOTOS_LIBRARY_READONLY_APPCREATED:
    'https://www.googleapis.com/auth/photoslibrary.readonly.appcreateddata',
  PHOTOS_LIBRARY_SHARING:
    'https://www.googleapis.com/auth/photoslibrary.sharing',

  // YouTube
  YOUTUBE: 'https://www.googleapis.com/auth/youtube',
  YOUTUBE_CHANNEL_MEMBERSHIPS:
    'https://www.googleapis.com/auth/youtube.channel-memberships.creator',
  YOUTUBE_FORCE_SSL: 'https://www.googleapis.com/auth/youtube.force-ssl',
  YOUTUBE_READONLY: 'https://www.googleapis.com/auth/youtube.readonly',
  YOUTUBE_UPLOAD: 'https://www.googleapis.com/auth/youtube.upload',
  YOUTUBE_PARTNER: 'https://www.googleapis.com/auth/youtubepartner',
  YOUTUBE_PARTNER_CHANNEL_AUDIT:
    'https://www.googleapis.com/auth/youtubepartner-channel-audit',
  YOUTUBE_ANALYTICS_MONETARY_READONLY:
    'https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
  YOUTUBE_ANALYTICS_READONLY:
    'https://www.googleapis.com/auth/yt-analytics.readonly',
} as const

export type GoogleScope = keyof typeof GOOGLE_SCOPES
