<script lang="ts">
	import { cn } from '$lib/utils';
	import { getContext } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children }: Props = $props();

	// Get avatar context
	const avatarContext = getContext<{
		loadState: 'loading' | 'loaded' | 'error';
		setLoadState: (state: 'loading' | 'loaded' | 'error') => void;
	}>('avatar-state');

	// Show fallback only if image failed to load or is still loading
	const shouldShow = $derived(
		!avatarContext || avatarContext.loadState === 'loading' || avatarContext.loadState === 'error'
	);
</script>

{#if shouldShow}
	<span
		class={cn(
			'flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium uppercase text-muted-foreground',
			className
		)}
	>
		{#if children}
			{@render children()}
		{/if}
	</span>
{/if}
