<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		conversationsList?: Snippet;
		messagingConsole?: Snippet;
		contactDetails?: Snippet;
		showContactDetails?: boolean;
		class?: string;
	}

	let {
		conversationsList,
		messagingConsole,
		contactDetails,
		showContactDetails = $bindable(true),
		class: className
	}: Props = $props();

	// Responsive panel widths
	const panelWidths = {
		conversationsList: showContactDetails ? 'w-80' : 'w-96',
		messagingConsole: showContactDetails ? 'flex-1' : 'flex-1',
		contactDetails: 'w-80'
	};
</script>

<div class={cn('flex h-full overflow-hidden bg-background', className)}>
	<!-- Left Panel: Conversations List -->
	<div
		class={cn(
			'border-r border-border flex-shrink-0 flex flex-col',
			panelWidths.conversationsList
		)}
	>
		{#if conversationsList}
			{@render conversationsList()}
		{:else}
			<div class="flex items-center justify-center h-full text-muted-foreground">
				No conversations list provided
			</div>
		{/if}
	</div>

	<!-- Middle Panel: Messaging Console -->
	<div class={cn('flex flex-col', panelWidths.messagingConsole)}>
		{#if messagingConsole}
			{@render messagingConsole()}
		{:else}
			<div class="flex items-center justify-center h-full text-muted-foreground">
				Select a conversation to view messages
			</div>
		{/if}
	</div>

	<!-- Right Panel: Contact Details (collapsible) -->
	{#if showContactDetails}
		<div
			class={cn(
				'border-l border-border flex-shrink-0 flex flex-col',
				panelWidths.contactDetails
			)}
		>
			{#if contactDetails}
				{@render contactDetails()}
			{:else}
				<div class="flex items-center justify-center h-full text-muted-foreground text-sm">
					No contact selected
				</div>
			{/if}
		</div>
	{/if}
</div>
