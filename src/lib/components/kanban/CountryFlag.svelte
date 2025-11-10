<script lang="ts">
  import { cn } from '$lib/utils';
  import { getCountryFlag, getCountryName, formatCountry } from '$lib/utils/countries';

  interface Props {
    countryCode?: string | null;
    showName?: boolean;
    showCode?: boolean;
    size?: 'sm' | 'md' | 'lg';
    class?: string;
  }

  let {
    countryCode,
    showName = false,
    showCode = true,
    size = 'sm',
    class: className
  }: Props = $props();

  const flag = $derived(getCountryFlag(countryCode));
  const name = $derived(getCountryName(countryCode));
  const display = $derived(formatCountry(countryCode, {
    showFlag: true,
    showName,
    showCode
  }));

  const sizeClasses = {
    sm: 'text-sm gap-1',
    md: 'text-base gap-1.5',
    lg: 'text-lg gap-2'
  };

  const flagSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl'
  };
</script>

{#if countryCode}
  <span
    class={cn(
      'inline-flex items-center',
      sizeClasses[size],
      className
    )}
    title={name}
  >
    <span class={flagSizes[size]}>{flag}</span>
    {#if showName}
      <span class="text-muted-foreground">{name}</span>
    {:else if showCode}
      <span class="text-muted-foreground">{countryCode.toUpperCase()}</span>
    {/if}
  </span>
{/if}