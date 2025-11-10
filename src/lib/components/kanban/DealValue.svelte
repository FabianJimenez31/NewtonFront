<script lang="ts">
  import { cn } from '$lib/utils';
  import { formatCurrency, formatCompactCurrency } from '$lib/utils/currency';
  import { DollarSign } from 'lucide-svelte';

  interface Props {
    value?: number | null;
    currency?: string | null;
    compact?: boolean;
    showIcon?: boolean;
    variant?: 'default' | 'primary' | 'success' | 'muted';
    size?: 'sm' | 'md' | 'lg';
    class?: string;
  }

  let {
    value,
    currency = 'USD',
    compact = false,
    showIcon = true,
    variant = 'default',
    size = 'sm',
    class: className
  }: Props = $props();

  const formattedValue = $derived(
    compact
      ? formatCompactCurrency(value, currency || 'USD')
      : formatCurrency(value, currency || 'USD', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        })
  );

  const variantClasses = {
    default: 'text-foreground',
    primary: 'text-primary font-semibold',
    success: 'text-green-600 font-semibold',
    muted: 'text-muted-foreground'
  };

  const sizeClasses = {
    sm: 'text-sm gap-1',
    md: 'text-base gap-1.5',
    lg: 'text-lg gap-2 font-semibold'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
</script>

{#if value !== null && value !== undefined}
  <span
    class={cn(
      'inline-flex items-center',
      variantClasses[variant],
      sizeClasses[size],
      className
    )}
  >
    {#if showIcon}
      <DollarSign class={cn(iconSizes[size], 'opacity-60')} />
    {/if}
    <span>{formattedValue}</span>
  </span>
{/if}