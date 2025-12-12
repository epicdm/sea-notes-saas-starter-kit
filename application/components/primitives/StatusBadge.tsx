import { Chip } from "@heroui/chip";

export type StatusVariant =
  | 'active'
  | 'inactive'
  | 'draft'
  | 'completed'
  | 'failed'
  | 'pending'
  | 'running'
  | 'in_progress'
  | 'no_answer'
  | 'busy'
  | 'new'
  | 'queued'
  | 'calling'
  | 'dnc';

const statusConfig: Record<StatusVariant, { color: 'success' | 'danger' | 'warning' | 'default' | 'primary', label: string }> = {
  active: { color: 'success', label: 'Active' },
  inactive: { color: 'default', label: 'Inactive' },
  draft: { color: 'warning', label: 'Draft' },
  completed: { color: 'success', label: 'Completed' },
  failed: { color: 'danger', label: 'Failed' },
  pending: { color: 'warning', label: 'Pending' },
  running: { color: 'primary', label: 'Running' },
  in_progress: { color: 'warning', label: 'In Progress' },
  no_answer: { color: 'default', label: 'No Answer' },
  busy: { color: 'default', label: 'Busy' },
  new: { color: 'primary', label: 'New' },
  queued: { color: 'default', label: 'Queued' },
  calling: { color: 'warning', label: 'Calling' },
  dnc: { color: 'default', label: 'Do Not Call' },
};

export interface StatusBadgeProps {
  status: StatusVariant;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <Chip
      color={config.color}
      variant="flat"
      size="sm"
      className={className}
    >
      {config.label}
    </Chip>
  );
}
