<script lang="ts">
	import { cn } from '$lib/utils';
	import { setContext } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		value?: string;
		defaultValue?: string;
		class?: string;
		onValueChange?: (value: string) => void;
		children?: Snippet;
	}

	let { value = $bindable(), defaultValue = '', class: className, onValueChange, children }: Props = $props();

	// Initialize value from defaultValue
	let internalValue = $state(value || defaultValue);

	// Sync internal value with external value prop
	$effect(() => {
		if (value !== undefined && value !== internalValue) {
			internalValue = value;
		}
	});

	// Sync external value with internal value
	$effect(() => {
		if (value !== internalValue) {
			value = internalValue;
			onValueChange?.(internalValue);
		}
	});

	// Provide context for child components
	setContext('tabs-value', {
		get current() {
			return internalValue;
		},
		set: (newValue: string) => {
			internalValue = newValue;
		}
	});
</script>

<div class={cn('w-full', className)} data-orientation="horizontal">
	{#if children}
		{@render children()}
	{/if}
</div>
