import { Card, CardBody } from "@heroui/card";
import { LucideIcon } from "lucide-react";

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  onClick?: () => void;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-blue-600 dark:text-blue-400",
  trend,
  onClick
}: MetricCardProps) {
  return (
    <Card
      isPressable={!!onClick}
      onPress={onClick}
      className="hover:shadow-lg transition-shadow"
    >
      <CardBody className="p-6">
        <div className="flex items-center justify-between pb-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            {title}
          </h3>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>

        <div className="space-y-1">
          <div className="text-2xl font-bold text-foreground">
            {value}
          </div>

          {trend && (
            <p className="text-xs text-muted-foreground">
              <span className={
                trend.direction === 'up' ? 'text-success' :
                trend.direction === 'down' ? 'text-error' :
                'text-muted-foreground'
              }>
                {trend.value}
              </span>
              {' from last month'}
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
