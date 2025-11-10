<script lang="ts">
  import { cn } from '$lib/utils';
  import { formatSLAStatus, getSLAStatusClasses } from '$lib/utils/sla';
  import { Clock, CheckCircle, AlertTriangle, XCircle, MinusCircle } from 'lucide-svelte';
  import type { ComponentType } from 'svelte';

  interface Props {
    status?: string | null;
    showLabel?: boolean;
    showIcon?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'solid' | 'outline' | 'badge';
    class?: string;
  }

  let {
    status,
    showLabel = true,
    showIcon = true,
    size = 'sm',
    variant = 'badge',
    class: className
  }: Props = $props();

  const label = $derived(formatSLAStatus(status));
  const statusClasses = $derived(getSLAStatusClasses(status, variant));

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const icons: Record<string, ComponentType> = {
    on_time: CheckCircle,
    warning: AlertTriangle,
    overdue: XCircle,
    no_sla: MinusCircle
  };

  const Icon = $derived(icons[status || 'no_sla'] || Clock);
</script>

{#if status}
  <span
    class={cn(
      'inline-flex items-center rounded-full font-medium',
      sizeClasses[size],
      statusClasses,
      className
    )}
  >
    {#if showIcon && Icon}
      <Icon class={iconSizes[size]} />
    {/if}

    {#if showLabel}
      <span>{label}</span>
    {/if}
  </span>
{/if}