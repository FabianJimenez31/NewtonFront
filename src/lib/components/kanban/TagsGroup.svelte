<script lang="ts">
  import { cn } from '$lib/utils';
  import { formatTags } from '$lib/utils/formatters';
  import { Tag } from 'lucide-svelte';

  interface Props {
    tags?: string[] | null;
    maxVisible?: number;
    size?: 'sm' | 'md';
    variant?: 'default' | 'outline';
    class?: string;
  }

  let {
    tags,
    maxVisible = 3,
    size = 'sm',
    variant = 'default',
    class: className
  }: Props = $props();

  const formattedTags = $derived(formatTags(tags, maxVisible));

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm'
  };

  const variantClasses = {
    default: 'bg-secondary/20 text-secondary-foreground',
    outline: 'border border-border text-muted-foreground'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4'
  };
</script>

{#if formattedTags.visible.length > 0}
  <div class={cn('inline-flex items-center gap-1 flex-wrap', className)}>
    {#each formattedTags.visible as tag}
      <span
        class={cn(
          'inline-flex items-center gap-1 rounded-md font-medium',
          sizeClasses[size],
          variantClasses[variant]
        )}
      >
        <Tag class={cn(iconSizes[size], 'opacity-60')} />
        {tag}
      </span>
    {/each}

    {#if formattedTags.remaining > 0}
      <span
        class={cn(
          'inline-flex items-center rounded-md font-medium',
          sizeClasses[size],
          'bg-muted text-muted-foreground'
        )}
        title={`${formattedTags.remaining} more tags`}
      >
        +{formattedTags.remaining}
      </span>
    {/if}
  </div>
{/if}