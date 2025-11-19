<script lang="ts">
	import { cn } from "$lib/utils";
	import { getContext } from "svelte";
	import type { Snippet } from "svelte";

	interface Props {
		disabled?: boolean;
		class?: string;
		onclick?: (event: MouseEvent) => void;
		children?: Snippet;
		closeOnSelect?: boolean;
	}

	let {
		disabled = false,
		class: className,
		onclick,
		children,
		closeOnSelect = true,
	}: Props = $props();

	// Get dropdown menu context
	const dropdownContext = getContext<{
		isOpen: boolean;
		setOpen: (value: boolean) => void;
		toggle: () => void;
	}>("dropdown-menu");

	function handleClick(event: MouseEvent) {
		if (!disabled) {
			onclick?.(event);
			// Close dropdown after clicking an item only if closeOnSelect is true
			if (closeOnSelect) {
				dropdownContext?.setOpen(false);
			}
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			if (!disabled) {
				onclick?.(event as any);
				if (closeOnSelect) {
					dropdownContext?.setOpen(false);
				}
			}
		}
	}
</script>

<div
	role="menuitem"
	tabindex={disabled ? -1 : 0}
	aria-disabled={disabled}
	class={cn(
		"relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
		"focus:bg-accent focus:text-accent-foreground",
		"hover:bg-accent hover:text-accent-foreground",
		disabled && "pointer-events-none opacity-50",
		className,
	)}
	onclick={handleClick}
	onkeydown={handleKeydown}
>
	{#if children}
		{@render children()}
	{/if}
</div>
