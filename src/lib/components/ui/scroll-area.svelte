<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		orientation?: 'vertical' | 'horizontal' | 'both';
		type?: 'auto' | 'always' | 'scroll' | 'hover';
		children?: Snippet;
	}

	let {
		class: className,
		orientation = 'vertical',
		type = 'hover',
		children
	}: Props = $props();

	// Generate scroll classes based on orientation
	const scrollClasses = $derived(
		orientation === 'vertical'
			? 'overflow-y-auto overflow-x-hidden'
			: orientation === 'horizontal'
				? 'overflow-x-auto overflow-y-hidden'
				: 'overflow-auto'
	);

	// Scrollbar visibility classes based on type
	const scrollbarClasses = $derived(
		type === 'hover'
			? '[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-border/60'
			: type === 'always'
				? '[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-muted'
				: '[&::-webkit-scrollbar]:hidden'
	);
</script>

<div
	class={cn('relative overflow-hidden', className)}
	data-orientation={orientation}
>
	<div class={cn('h-full w-full rounded-[inherit]', scrollClasses, scrollbarClasses)}>
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>
