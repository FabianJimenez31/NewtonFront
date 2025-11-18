<script lang="ts">
	import { cn } from '$lib/utils';
	import { getContext } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		value: string;
		disabled?: boolean;
		class?: string;
		children?: Snippet;
	}

	let { value, disabled = false, class: className, children }: Props = $props();

	// Get tabs context
	const tabsContext = getContext<{
		current: string;
		set: (value: string) => void;
	}>('tabs-value');

	// Compute if this tab is active
	const isActive = $derived(tabsContext?.current === value);

	function handleClick() {
		if (!disabled && tabsContext) {
			tabsContext.set(value);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleClick();
		}
	}
</script>

<button
	type="button"
	role="tab"
	aria-selected={isActive}
	aria-disabled={disabled}
	tabindex={isActive ? 0 : -1}
	disabled={disabled}
	class={cn(
		'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all',
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
		'disabled:pointer-events-none disabled:opacity-50',
		isActive
			? 'bg-background text-foreground shadow-sm'
			: 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
		className
	)}
	onclick={(e) => handleClick()}
	onkeydown={(e) => handleKeydown(e)}
>
	{#if children}
		{@render children()}
	{/if}
</button>
