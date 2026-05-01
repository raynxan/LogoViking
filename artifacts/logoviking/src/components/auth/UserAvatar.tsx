import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  className?: string;
  "data-testid"?: string;
}

function getInitial(name?: string | null, email?: string | null): string {
  const source = (name && name.trim()) || (email && email.trim()) || "";
  return source ? source.charAt(0).toUpperCase() : "?";
}

export function UserAvatar({
  name,
  email,
  avatarUrl,
  className,
  ...rest
}: UserAvatarProps) {
  const initial = getInitial(name, email);
  const alt = name || email || "User avatar";
  return (
    <Avatar className={cn("h-8 w-8", className)} {...rest}>
      {avatarUrl ? (
        <AvatarImage src={avatarUrl} alt={alt} referrerPolicy="no-referrer" />
      ) : null}
      <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}
