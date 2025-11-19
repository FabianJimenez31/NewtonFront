<script lang="ts">
	import { getContext } from "svelte";
	import type { Snippet } from "svelte";

	interface Props {
		class?: string;
		asChild?: boolean;
		children?: Snippet;
	}

	let { class: className, asChild = false, children }: Props = $props();

	// Get dropdown menu context
	const dropdownContext = getContext<{
		isOpen: boolean;
		setOpen: (value: boolean) => void;
		toggle: () => void;
	}>("dropdown-menu");

	function handleClick() {
		console.log("[DROPDOWN TRIGGER] Clicked");
		dropdownContext?.toggle();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			handleClick();
		} else if (event.key === "ArrowDown") {
			event.preventDefault();
			dropdownContext?.setOpen(true);
		}
	}
</script>

{#if asChild}
	<!-- When asChild is true, render children directly with event handlers -->
	<div
		onclick={handleClick}
		onkeydown={handleKeydown}
		role="button"
		tabindex="0"
		aria-haspopup="true"
		aria-expanded={dropdownContext?.isOpen}
	>
		{#if children}
			{@render children()}
		{/if}
	</div>
{:else}
	<!-- Default button trigger -->
	<button
		type="button"
		aria-haspopup="true"
		aria-expanded={dropdownContext?.isOpen}
		class={className}
		onclick={handleClick}
		onkeydown={handleKeydown}
	>
		{#if children}
			{@render children()}
		{/if}
	</button>
{/if}
