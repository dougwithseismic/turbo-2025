export type ActivityType =
  | 'created'
  | 'edited'
  | 'sent'
  | 'commented'
  | 'viewed'
  | 'paid';

export type ActivityItem = {
  id: number;
  type: ActivityType;
  person: {
    name: string;
    imageUrl?: string;
  };
  comment?: string;
  date: string;
  dateTime: string;
};

export type ActivityItemProps = {
  item: ActivityItem;
  onDelete: (id: number) => void;
};
