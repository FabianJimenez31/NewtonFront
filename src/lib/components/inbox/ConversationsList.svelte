<script lang="ts">
	import { cn } from "$lib/utils";
	import type { Snippet } from "svelte";
	import ConversationsListHeader from "./ConversationsListHeader.svelte";
	import ConversationsListPagination from "./ConversationsListPagination.svelte";
	import ConversationsListEmpty from "./ConversationsListEmpty.svelte";

	// Types
	interface Conversation {
		id: string;
		contactName: string;
		lastMessage: string;
		timestamp: string;
		unreadCount?: number;
		assigned?: boolean;
		priority?: "high" | "medium" | "low";
		channel?: string;
		stage?: string;
		stageColor?: string;
	}

	interface PaginationSummary {
		page: number;
		pageSize: number;
		pages: number;
		total: number;
		from: number;
		to: number;
		hasPrevious: boolean;
		hasNext: boolean;
	}

	interface Props {
		conversations?: Conversation[];
		selectedConversationId?: string;
		activeTab?: "all" | "mine" | "unassigned";
		searchQuery?: string;
		pagination?: PaginationSummary;
		isPaginating?: boolean;
		counts?: { all: number; mine: number; unassigned: number };
		onConversationSelect?: (id: string) => void;
		onTabChange?: (tab: "all" | "mine" | "unassigned") => void;
		onSearchChange?: (query: string) => void;
		onPageChange?: (page: number) => void;
		conversationItem?: Snippet<[Conversation]>;
		filters?: Snippet;
		class?: string;
	}

	let {
		conversations = [],
		selectedConversationId = $bindable(""),
		activeTab = $bindable("all"),
		searchQuery = $bindable(""),
		pagination,
		isPaginating = false,
		counts = { all: 0, mine: 0, unassigned: 0 },
		onConversationSelect,
		onTabChange,
		onSearchChange,
		onPageChange,
		conversationItem,
		filters,
		class: className,
	}: Props = $props();

	// Derived state
	const totalUnread = $derived(
		conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
	);

	// Handlers
	function handleTabChange(tab: "all" | "mine" | "unassigned") {
		activeTab = tab;
		onTabChange?.(tab);
	}

	function handleSearchChange(query: string) {
		searchQuery = query;
		onSearchChange?.(query);
	}

	function handlePageChange(page: number) {
		onPageChange?.(page);
	}

	function handleSelect(id: string) {
		selectedConversationId = id;
		onConversationSelect?.(id);
	}
</script>

<div class={cn("flex flex-col h-full min-h-0 bg-background", className)}>
	<ConversationsListHeader
		{searchQuery}
		{filters}
		onSearchChange={handleSearchChange}
	/>

	<div class="flex-1 overflow-y-auto min-h-0">
		{#if conversations.length === 0}
			<ConversationsListEmpty hasSearch={!!searchQuery.trim()} />
		{:else}
			<div class="p-2 space-y-1">
				{#each conversations as conversation (conversation.id)}
					{#if conversationItem}
						{@render conversationItem(conversation)}
					{:else}
						<!-- Fallback item if no snippet provided -->
						<button
							class={cn(
								"w-full text-left p-3 rounded-lg transition-colors",
								"hover:bg-accent",
								selectedConversationId === conversation.id
									? "bg-accent border-l-2 border-primary"
									: "",
							)}
							onclick={() => handleSelect(conversation.id)}
						>
							<div class="font-medium text-sm">
								{conversation.contactName}
							</div>
							<div class="text-xs text-muted-foreground truncate">
								{conversation.lastMessage}
							</div>
						</button>
					{/if}
				{/each}
			</div>
		{/if}
	</div>

	{#if pagination}
		<ConversationsListPagination
			{pagination}
			{isPaginating}
			onPageChange={handlePageChange}
		/>
	{/if}
</div>
