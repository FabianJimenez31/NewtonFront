<script lang="ts">
  import { cn } from '$lib/utils';
  import { getChannelName, getChannelClasses, getChannelIcon } from '$lib/utils/channel-icons';
  import type { ComponentType } from 'svelte';

  interface Props {
    channel?: string | null;
    variant?: 'solid' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    showName?: boolean;
    class?: string;
  }

  let {
    channel,
    variant = 'solid',
    size = 'sm',
    showName = true,
    class: className
  }: Props = $props();

  const iconComponent = $derived(getChannelIcon(channel));
  const channelName = $derived(getChannelName(channel));
  const channelClasses = $derived(getChannelClasses(channel, variant));

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
</script>

{#if channel}
  <div
    class={cn(
      'inline-flex items-center rounded-full font-medium',
      sizeClasses[size],
      channelClasses,
      className
    )}
  >
    {#if iconComponent}
      {@const Icon = iconComponent as ComponentType}
      <Icon class={iconSizes[size]} />
    {/if}

    {#if showName}
      <span>{channelName}</span>
    {/if}
  </div>
{/if}