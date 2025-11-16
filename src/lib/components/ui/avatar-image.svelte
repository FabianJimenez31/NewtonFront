<script lang="ts">
	import { cn } from '$lib/utils';
	import { getContext } from 'svelte';

	interface Props {
		src: string;
		alt?: string;
		class?: string;
	}

	let { src, alt = '', class: className }: Props = $props();

	// Get avatar context
	const avatarContext = getContext<{
		loadState: 'loading' | 'loaded' | 'error';
		setLoadState: (state: 'loading' | 'loaded' | 'error') => void;
	}>('avatar-state');

	function handleLoad() {
		avatarContext?.setLoadState('loaded');
	}

	function handleError() {
		avatarContext?.setLoadState('error');
	}

	// Only show image if not in error state
	const shouldShow = $derived(avatarContext?.loadState !== 'error');
</script>

{#if shouldShow}
	<img
		{src}
		{alt}
		class={cn('aspect-square h-full w-full object-cover', className)}
		onload={handleLoad}
		onerror={handleError}
	/>
{/if}
