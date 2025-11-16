<script lang="ts">
	import { cn } from '$lib/utils';
	import { getContext } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		value: string;
		class?: string;
		children?: Snippet;
	}

	let { value, class: className, children }: Props = $props();

	// Get tabs context
	const tabsContext = getContext<{
		current: string;
		set: (value: string) => void;
	}>('tabs-value');

	// Compute if this content should be shown
	const isActive = $derived(tabsContext?.current === value);
</script>

{#if isActive}
	<div
		role="tabpanel"
		tabindex={0}
		class={cn(
			'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
			className
		)}
	>
		{#if children}
			{@render children()}
		{/if}
	</div>
{/if}
