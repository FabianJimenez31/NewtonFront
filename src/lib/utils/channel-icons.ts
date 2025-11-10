/**
 * Channel icon mapping and utilities
 * Maps communication channels to their display properties
 */

import type { ComponentType } from "svelte";
import { MessageSquare, Globe, Mail, Phone, Send } from "lucide-svelte";

/**
 * Channel configuration with icons, colors, and display names
 */
export const CHANNEL_CONFIG = {
  whatsapp: {
    name: "WhatsApp",
    color: "#25D366",
    bgColor: "bg-green-500",
    textColor: "text-green-600",
    borderColor: "border-green-500",
    icon: null, // Will use custom SVG component
    lucideIcon: MessageSquare,
  },
  web: {
    name: "Web",
    color: "#4B5563",
    bgColor: "bg-gray-600",
    textColor: "text-gray-600",
    borderColor: "border-gray-600",
    icon: Globe,
    lucideIcon: Globe,
  },
  telegram: {
    name: "Telegram",
    color: "#0088CC",
    bgColor: "bg-blue-500",
    textColor: "text-blue-600",
    borderColor: "border-blue-500",
    icon: null, // Will use custom SVG component
    lucideIcon: Send,
  },
  instagram: {
    name: "Instagram",
    color: "#E4405F",
    bgColor: "bg-pink-500",
    textColor: "text-pink-600",
    borderColor: "border-pink-500",
    icon: null, // Will use custom SVG component
    lucideIcon: MessageSquare,
  },
  facebook: {
    name: "Facebook",
    color: "#1877F2",
    bgColor: "bg-blue-600",
    textColor: "text-blue-700",
    borderColor: "border-blue-600",
    icon: null, // Will use custom SVG component
    lucideIcon: MessageSquare,
  },
  email: {
    name: "Email",
    color: "#EA4335",
    bgColor: "bg-red-500",
    textColor: "text-red-600",
    borderColor: "border-red-500",
    icon: Mail,
    lucideIcon: Mail,
  },
  sms: {
    name: "SMS",
    color: "#6B7280",
    bgColor: "bg-gray-500",
    textColor: "text-gray-600",
    borderColor: "border-gray-500",
    icon: Phone,
    lucideIcon: Phone,
  },
} as const;

export type SupportedChannel = keyof typeof CHANNEL_CONFIG;

/**
 * Get channel display name
 * @param channel - Channel identifier
 * @returns Display name or the channel itself if not found
 */
export function getChannelName(channel: string | undefined | null): string {
  if (!channel) return "Unknown";

  const config = CHANNEL_CONFIG[channel as SupportedChannel];
  return config?.name || channel;
}

/**
 * Get channel color (hex value)
 * @param channel - Channel identifier
 * @returns Hex color value
 */
export function getChannelColor(channel: string | undefined | null): string {
  if (!channel) return "#6B7280"; // Default gray

  const config = CHANNEL_CONFIG[channel as SupportedChannel];
  return config?.color || "#6B7280";
}

/**
 * Get Tailwind CSS classes for channel styling
 * @param channel - Channel identifier
 * @param variant - Style variant
 * @returns Tailwind CSS classes
 */
export function getChannelClasses(
  channel: string | undefined | null,
  variant: "solid" | "outline" | "ghost" = "solid",
): string {
  if (!channel) {
    return variant === "solid"
      ? "bg-gray-500 text-white"
      : variant === "outline"
        ? "border border-gray-500 text-gray-600"
        : "text-gray-600";
  }

  const config = CHANNEL_CONFIG[channel as SupportedChannel];
  if (!config) {
    return variant === "solid"
      ? "bg-gray-500 text-white"
      : variant === "outline"
        ? "border border-gray-500 text-gray-600"
        : "text-gray-600";
  }

  switch (variant) {
    case "solid":
      return `${config.bgColor} text-white`;
    case "outline":
      return `border ${config.borderColor} ${config.textColor}`;
    case "ghost":
      return config.textColor;
    default:
      return "";
  }
}

/**
 * Get the appropriate icon component for a channel
 * @param channel - Channel identifier
 * @returns Lucide icon component or null
 */
export function getChannelIcon(
  channel: string | undefined | null,
): ComponentType | null {
  if (!channel) return MessageSquare;

  const config = CHANNEL_CONFIG[channel as SupportedChannel];
  return config?.icon || config?.lucideIcon || MessageSquare;
}

/**
 * Format channel for display with optional icon placeholder
 * @param channel - Channel identifier
 * @param options - Display options
 * @returns Formatted channel string
 */
export function formatChannel(
  channel: string | undefined | null,
  options: {
    showIcon?: boolean;
    uppercase?: boolean;
  } = {},
): string {
  if (!channel) return "-";

  const { showIcon = false, uppercase = false } = options;

  const name = getChannelName(channel);
  const formatted = uppercase ? name.toUpperCase() : name;

  // Icon will be rendered as component, not emoji
  // This returns just the name for text display
  return formatted;
}

/**
 * Validate if a channel is supported
 * @param channel - Channel to validate
 * @returns True if the channel is supported
 */
export function isSupportedChannel(
  channel: string,
): channel is SupportedChannel {
  return channel in CHANNEL_CONFIG;
}

/**
 * Get all supported channels
 * @returns Array of supported channel identifiers
 */
export function getSupportedChannels(): SupportedChannel[] {
  return Object.keys(CHANNEL_CONFIG) as SupportedChannel[];
}

/**
 * Get channel statistics color scheme for charts
 * @returns Object mapping channels to chart colors
 */
export function getChannelChartColors(): Record<SupportedChannel, string> {
  const colors: Record<string, string> = {};

  Object.entries(CHANNEL_CONFIG).forEach(([channel, config]) => {
    colors[channel] = config.color;
  });

  return colors as Record<SupportedChannel, string>;
}

/**
 * Group channels by type (messaging, social, traditional)
 * @returns Channels grouped by type
 */
export function getChannelsByType(): Record<string, SupportedChannel[]> {
  return {
    messaging: ["whatsapp", "telegram"],
    social: ["instagram", "facebook"],
    traditional: ["email", "sms"],
    direct: ["web"],
  };
}

/**
 * Get channel priority order for sorting
 * @param channel - Channel identifier
 * @returns Priority number (lower = higher priority)
 */
export function getChannelPriority(channel: string | undefined | null): number {
  const priorities: Record<SupportedChannel, number> = {
    whatsapp: 1,
    web: 2,
    telegram: 3,
    instagram: 4,
    facebook: 5,
    email: 6,
    sms: 7,
  };

  if (!channel) return 999;
  return priorities[channel as SupportedChannel] || 999;
}

/**
 * Sort channels by priority
 * @param channels - Array of channel identifiers
 * @returns Sorted array
 */
export function sortChannelsByPriority(channels: string[]): string[] {
  return [...channels].sort((a, b) => {
    return getChannelPriority(a) - getChannelPriority(b);
  });
}
