<script lang="ts">
	import { cn } from "$lib/utils";
	import { getContext } from "svelte";
	import type { Snippet } from "svelte";

	interface Props {
		align?: "start" | "center" | "end";
		side?: "top" | "right" | "bottom" | "left";
		sideOffset?: number;
		class?: string;
		children?: Snippet;
	}

	let {
		align = "center",
		side = "bottom",
		sideOffset = 4,
		class: className,
		children,
	}: Props = $props();

	// Get dropdown menu context
	const dropdownContext = getContext<{
		isOpen: boolean;
		setOpen: (value: boolean) => void;
		toggle: () => void;
	}>("dropdown-menu");

	const alignClasses = {
		start: "left-0",
		center: "left-1/2 -translate-x-1/2",
		end: "right-0",
	};

	const sideClasses = {
		top: "bottom-full mb-2",
		right: "left-full ml-2",
		bottom: "top-full mt-2",
		left: "right-full mr-2",
	};

	// Close menu when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (
			!target.closest('[role="menu"]') &&
			!target.closest('[aria-haspopup="true"]')
		) {
			dropdownContext?.setOpen(false);
		}
	}

	// Close menu on Escape key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Escape") {
			dropdownContext?.setOpen(false);
		}
	}

	// Add/remove global event listeners
	$effect(() => {
		if (dropdownContext?.isOpen) {
			document.addEventListener("click", handleClickOutside);
			document.addEventListener("keydown", handleKeydown);

			return () => {
				document.removeEventListener("click", handleClickOutside);
				document.removeEventListener("keydown", handleKeydown);
			};
		}
	});
</script>

{#if dropdownContext?.isOpen}
	<div
		role="menu"
		aria-orientation="vertical"
		class={cn(
			"absolute z-[100] min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
			"animate-in fade-in-0 zoom-in-95",
			alignClasses[align],
			sideClasses[side],
			className,
		)}
		style="margin-{side}: {sideOffset}px;"
	>
		{#if children}
			{@render children()}
		{/if}
	</div>
{/if}
