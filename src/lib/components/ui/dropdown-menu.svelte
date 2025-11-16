<script lang="ts">
	import { cn } from '$lib/utils';
	import { setContext } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		open?: boolean;
		class?: string;
		children?: Snippet;
	}

	let { open = $bindable(false), class: className, children }: Props = $props();

	// Provide context for child components
	setContext('dropdown-menu', {
		get isOpen() {
			return open;
		},
		setOpen: (value: boolean) => {
			open = value;
		},
		toggle: () => {
			open = !open;
		}
	});
</script>

<div class={cn('relative inline-block text-left', className)}>
	{#if children}
		{@render children()}
	{/if}
</div>
