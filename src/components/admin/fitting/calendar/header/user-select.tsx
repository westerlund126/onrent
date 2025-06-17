import { useCalendar } from 'contexts/calendar-context';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import React from 'react';

interface AvatarGroupProps {
  children: React.ReactNode[];
  max?: number;
  className?: string;
}

function AvatarGroup({ children, max = 3, className = '' }: AvatarGroupProps) {
  const avatars = React.Children.toArray(children);
  const displayAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {displayAvatars.map((avatar, index) => (
        <div
          key={index}
          className="relative rounded-full ring-2 ring-background"
        >
          {avatar}
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="relative rounded-full ring-2 ring-background">
          <Avatar className="size-6">
            <AvatarFallback className="bg-muted text-xs">
              +{remainingCount}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
}

export function UserSelect() {
  const { users, selectedUserId, setSelectedUserId } = useCalendar();

  return (
    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
      <SelectTrigger className="flex-1 md:w-48">
        <SelectValue />
      </SelectTrigger>

      <SelectContent align="end">
        <SelectItem value="all">
          <div className="flex items-center gap-2">
            <AvatarGroup max={2}>
              {users.map((user) => (
                <Avatar key={user.id} className="size-6">
                  <AvatarImage
                    src={user.picturePath ?? undefined}
                    alt={user.name}
                  />
                  <AvatarFallback className="text-xs">
                    {user.name[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
            <span>All Users</span>
          </div>
        </SelectItem>

        {users.map((user) => (
          <SelectItem key={user.id} value={user.id} className="flex-1">
            <div className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarImage
                  src={user.picturePath ?? undefined}
                  alt={user.name}
                />
                <AvatarFallback className="text-xs">
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>

              <p className="truncate">{user.name}</p>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
