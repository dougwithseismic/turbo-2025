import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import { ContentCardItem } from './content-card-item';
import type { ContentCardItemProps } from './content-card-item';

export interface ContentCardBodyProps {
  children: ReactNode;
  parentId?: string;
}

export const ContentCardBody = ({
  children,
  parentId,
}: ContentCardBodyProps) => {
  console.log('children', children);

  const processedChildren = Children.map(children, (child, index) => {
    if (isValidElement(child) && child.type === ContentCardItem) {
      return cloneElement(child as ReactElement<ContentCardItemProps>, {
        parentId,
        key: child.key ?? `content-card-item-${index}`,
      });
    }
    console.log('child', child);
    return isValidElement(child)
      ? cloneElement(child, { key: child.key ?? `content-card-child-${index}` })
      : child;
  });
  return <>{processedChildren}</>;
};
