<script lang="ts">
	import { cn } from "$lib/utils";
	import type { Snippet } from "svelte";

	interface Props {
		conversationsList?: Snippet;
		messagingConsole?: Snippet;
		contactDetails?: Snippet;
		dashboard?: Snippet;
		showContactDetails?: boolean;
		hasSelection?: boolean;
		class?: string;
	}

	let {
		conversationsList,
		messagingConsole,
		contactDetails,
		dashboard,
		showContactDetails = $bindable(true),
		hasSelection = false,
		class: className,
	}: Props = $props();
</script>

<div class={cn("flex h-full bg-muted/20 p-4 gap-4 overflow-hidden", className)}>
	<!-- Left Panel: Conversations List (Floating Sidebar) -->
	<div
		class={cn(
			"flex-shrink-0 flex flex-col h-full bg-background rounded-2xl border border-border/60 shadow-sm transition-all duration-300 ease-in-out",
			hasSelection
				? "w-0 opacity-0 border-0 p-0 overflow-hidden"
				: "w-[380px] opacity-100 overflow-visible",
		)}
	>
		{#if conversationsList}
			<div class="w-[380px] h-full flex flex-col">
				{@render conversationsList()}
			</div>
		{:else}
			<div
				class="flex items-center justify-center h-full text-muted-foreground"
			>
				No conversations list provided
			</div>
		{/if}
	</div>

	<!-- Middle Panel: Messaging Console OR Dashboard (Floating Main) -->
	<div
		class="flex-1 flex flex-col h-full bg-background rounded-2xl border border-border/60 shadow-sm overflow-hidden relative"
	>
		{#if hasSelection}
			{#if messagingConsole}
				{@render messagingConsole()}
			{/if}
		{:else if dashboard}
			{@render dashboard()}
		{:else}
			<div
				class="flex items-center justify-center h-full text-muted-foreground"
			>
				Select a conversation
			</div>
		{/if}
	</div>

	<!-- Right Panel: Contact Details (Floating Sidebar) -->
	{#if showContactDetails && hasSelection}
		<div
			class="w-80 flex-shrink-0 flex flex-col h-full bg-background rounded-2xl border border-border/60 shadow-sm overflow-hidden"
		>
			{#if contactDetails}
				{@render contactDetails()}
			{:else}
				<div
					class="flex items-center justify-center h-full text-muted-foreground text-sm"
				>
					No contact selected
				</div>
			{/if}
		</div>
	{/if}
</div>
