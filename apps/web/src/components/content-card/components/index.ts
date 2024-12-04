import { ContentCard as ContentCardRoot } from './content-card';
import { ContentCardBody } from './content-card-body';
import { ContentCardEmptyState } from './content-card-empty-state';
import { ContentCardFooter } from './content-card-footer';
import { ContentCardHeader } from './content-card-header';
import { ContentCardItem } from './content-card-item';
import { ContentCardProvider } from '../context/content-card-context';

export const ContentCard = Object.assign(ContentCardRoot, {
  Provider: ContentCardProvider,
  Header: ContentCardHeader,
  Body: ContentCardBody,
  Footer: ContentCardFooter,
  Item: ContentCardItem,
  EmptyState: ContentCardEmptyState,
});

export type { ContentCardProps } from './content-card';
export type { ContentCardItemProps } from './content-card-item';
export type { ContentCardEmptyStateProps } from './content-card-empty-state';
export type { ContentCardFooterProps } from './content-card-footer';
export type { ContentCardHeaderProps } from './content-card-header';
export type { ContentCardProviderProps } from '../context/content-card-context';
export type { ContentCardSearchProps } from './content-card-search';
