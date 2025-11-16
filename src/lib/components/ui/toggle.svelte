<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		pressed?: boolean;
		disabled?: boolean;
		variant?: 'default' | 'outline';
		size?: 'default' | 'sm' | 'lg';
		class?: string;
		onPressedChange?: (pressed: boolean) => void;
		children?: Snippet;
	}

	let {
		pressed = $bindable(false),
		disabled = false,
		variant = 'default',
		size = 'default',
		class: className,
		onPressedChange,
		children
	}: Props = $props();

	const variantClasses = {
		default: 'bg-transparent hover:bg-muted hover:text-muted-foreground',
		outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground'
	};

	const sizeClasses = {
		default: 'h-10 px-3',
		sm: 'h-9 px-2.5',
		lg: 'h-11 px-5'
	};

	function handleClick() {
		if (!disabled) {
			pressed = !pressed;
			onPressedChange?.(pressed);
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
	aria-pressed={pressed}
	aria-disabled={disabled}
	{disabled}
	class={cn(
		'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors',
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
		'disabled:pointer-events-none disabled:opacity-50',
		variantClasses[variant],
		sizeClasses[size],
		pressed && 'bg-accent text-accent-foreground',
		className
	)}
	onclick={handleClick}
	onkeydown={handleKeydown}
>
	{#if children}
		{@render children()}
	{/if}
</button>
