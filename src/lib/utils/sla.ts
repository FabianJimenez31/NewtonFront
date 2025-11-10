/**
 * SLA Status utilities
 */

export const SLA_STATUS_CONFIG = {
  on_time: {
    label: "On Time",
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    borderColor: "border-green-500",
    icon: "✓",
  },
  warning: {
    label: "Warning",
    color: "yellow",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-500",
    icon: "⚠",
  },
  overdue: {
    label: "Overdue",
    color: "red",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
    borderColor: "border-red-500",
    icon: "✗",
  },
  no_sla: {
    label: "No SLA",
    color: "gray",
    bgColor: "bg-gray-100",
    textColor: "text-gray-600",
    borderColor: "border-gray-400",
    icon: "-",
  },
} as const;

export type SLAStatus = keyof typeof SLA_STATUS_CONFIG;

export function formatSLAStatus(
  status: string | undefined | null,
  options: {
    showIcon?: boolean;
    uppercase?: boolean;
  } = {},
): string {
  if (!status) return "-";

  const config = SLA_STATUS_CONFIG[status as SLAStatus];
  if (!config) return status;

  const { showIcon = false, uppercase = false } = options;

  let label: string = config.label;
  if (uppercase) label = label.toUpperCase();
  if (showIcon) label = `${config.icon} ${label}`;

  return label;
}

export function getSLAStatusClasses(
  status: string | undefined | null,
  variant: "solid" | "outline" | "badge" = "badge",
): string {
  if (!status) {
    return "bg-gray-100 text-gray-600";
  }

  const config = SLA_STATUS_CONFIG[status as SLAStatus];
  if (!config) {
    return "bg-gray-100 text-gray-600";
  }

  switch (variant) {
    case "solid":
      return `${config.bgColor} ${config.textColor}`;
    case "outline":
      return `border ${config.borderColor} ${config.textColor}`;
    case "badge":
      return `${config.bgColor} ${config.textColor} border ${config.borderColor}`;
    default:
      return "";
  }
}

export function calculateSLAStatus(
  createdAt: string | undefined | null,
  slaHours: number = 24,
): SLAStatus {
  if (!createdAt) return "no_sla";

  try {
    const created = new Date(createdAt);
    const now = new Date();
    const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

    if (diffHours <= slaHours * 0.75) return "on_time";
    if (diffHours <= slaHours) return "warning";
    return "overdue";
  } catch {
    return "no_sla";
  }
}
