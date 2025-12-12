import { Button } from "@heroui/button";
import { LucideIcon, Plus } from "lucide-react";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="p-4 bg-muted rounded-full mb-4">
        <Icon className="h-16 w-16 text-muted-foreground" />
      </div>

      <h3 className="text-lg font-semibold mb-2 text-foreground">
        {title}
      </h3>

      <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button
          color="primary"
          startContent={<Plus className="h-4 w-4" />}
          onPress={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
