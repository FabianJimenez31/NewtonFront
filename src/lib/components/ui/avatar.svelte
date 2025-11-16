<script lang="ts">
	import { cn } from '$lib/utils';
	import { setContext } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children }: Props = $props();

	// State to track if image failed to load
	let imageLoadState = $state<'loading' | 'loaded' | 'error'>('loading');

	// Provide context for child components
	setContext('avatar-state', {
		get loadState() {
			return imageLoadState;
		},
		setLoadState: (state: 'loading' | 'loaded' | 'error') => {
			imageLoadState = state;
		}
	});
</script>

<span
	class={cn(
		'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
		className
	)}
>
	{#if children}
		{@render children()}
	{/if}
</span>
