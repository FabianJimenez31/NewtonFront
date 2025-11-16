<script lang="ts">
	import { cn } from '$lib/utils';
	import { Search, Loader2 } from 'lucide-svelte';
	import {
		Tabs,
		TabsList,
		TabsTrigger,
		TabsContent,
		Input,
		ScrollArea,
		Badge
	} from '$lib/components/ui';
	import type { Snippet } from 'svelte';

	interface Conversation {
		id: string;
		contactName: string;
		lastMessage: string;
		timestamp: string;
		unreadCount?: number;
		assigned?: boolean;
		priority?: 'high' | 'medium' | 'low';
		channel?: string;
		stage?: string;
	}

	interface Props {
		conversations?: Conversation[];
		selectedConversationId?: string;
		activeTab?: 'all' | 'mine' | 'unassigned';
		searchQuery?: string;
		isLoadingMore?: boolean;
		isInitializing?: boolean;
		hasMore?: boolean;
		onConversationSelect?: (id: string) => void;
		onTabChange?: (tab: 'all' | 'mine' | 'unassigned') => void;
		onSearchChange?: (query: string) => void;
		onLoadMore?: () => void;
		conversationItem?: Snippet<[Conversation]>;
		filters?: Snippet;
		class?: string;
	}

	let {
		conversations = [],
		selectedConversationId = $bindable(''),
		activeTab = $bindable('all'),
		searchQuery = $bindable(''),
		isLoadingMore = false,
		isInitializing = false,
		hasMore = true,
		onConversationSelect,
		onTabChange,
		onSearchChange,
		onLoadMore,
		conversationItem,
		filters,
		class: className
	}: Props = $props();

let scrollContainer: HTMLDivElement | undefined = $state();
let sentinel: HTMLDivElement | undefined = $state();
let observer: IntersectionObserver | null = null;

	// Handle scroll event for infinite scroll
	function handleScroll(event: Event) {
		// Block during initialization, loading, or when no more data
		if (!onLoadMore || !hasMore || isLoadingMore || isInitializing) return;

		console.log('[SCROLL] Checking scroll position', { hasMore, isLoadingMore, isInitializing, conversationsCount: conversations.length });

		// Don't trigger if we don't have initial conversations yet
		if (conversations.length === 0) return;

		const target = event.target as HTMLDivElement;
		const { scrollTop, scrollHeight, clientHeight } = target;

		// Load more when user is 100px from bottom
		const threshold = 100;
		if (scrollHeight - scrollTop - clientHeight < threshold) {
			onLoadMore();
		}
	}

	// Computed: Filter conversations based on active tab
	const filteredConversations = $derived(() => {
		let result = conversations;

		// Filter by tab
		if (activeTab === 'mine') {
			result = result.filter((c) => c.assigned);
		} else if (activeTab === 'unassigned') {
			result = result.filter((c) => !c.assigned);
		}

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(c) =>
					c.contactName.toLowerCase().includes(query) ||
					c.lastMessage.toLowerCase().includes(query)
			);
		}

		return result;
	});

	// Count conversations per tab
	const tabCounts = $derived({
		all: conversations.length,
		mine: conversations.filter((c) => c.assigned).length,
		unassigned: conversations.filter((c) => !c.assigned).length
	});

	// Total unread count
	const totalUnread = $derived(
		conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
	);

	function handleTabChange(newTab: string) {
		activeTab = newTab as 'all' | 'mine' | 'unassigned';
		onTabChange?.(activeTab);
	}

	function handleSearchInput(event: Event) {
		const target = event.target as HTMLInputElement;
		searchQuery = target.value;
		onSearchChange?.(searchQuery);
	}

function handleConversationClick(id: string) {
	selectedConversationId = id;
	onConversationSelect?.(id);
}

// Intersection observer to ensure loadMore triggers even if scroll events miss
$effect(() => {
	if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
		observer?.disconnect();
		observer = null;
		return;
	}

	if (!scrollContainer || !sentinel || !onLoadMore) {
		observer?.disconnect();
		observer = null;
		return;
	}

	// Force effect to re-run when these values change (reactive dependencies)
	const _isInitializing = isInitializing;
	const _hasMore = hasMore;
	const _isLoadingMore = isLoadingMore;

	observer?.disconnect();
	observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				// Don't trigger during initialization, while loading, or if no more data
				// Also check that we have conversations loaded already
				if (
					entry.isIntersecting &&
					!_isInitializing &&
					_hasMore &&
					!_isLoadingMore &&
					conversations.length > 0
				) {
					console.log('[OBSERVER] Triggering loadMore from IntersectionObserver');
					onLoadMore();
				} else if (entry.isIntersecting && _isInitializing) {
					console.log('[OBSERVER] Blocked - initialization in progress');
				}
			}
		},
		{
			root: scrollContainer,
			rootMargin: '0px 0px 150px 0px',
			threshold: 0
		}
	);
	observer.observe(sentinel);

	return () => {
		observer?.disconnect();
		observer = null;
	};
});

</script>

<div class={cn('flex flex-col h-full', className)}>
	<!-- Header -->
	<div class="p-4 border-b border-border">
		<div class="flex items-center justify-between mb-3">
			<h2 class="text-lg font-semibold text-foreground">Conversaciones</h2>
			{#if totalUnread > 0}
				<Badge variant="default">{totalUnread}</Badge>
			{/if}
		</div>

		<!-- Search Bar -->
		<div class="relative">
			<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
			<Input
				type="text"
				placeholder="Buscar conversaciones..."
				value={searchQuery}
				oninput={handleSearchInput}
				class="pl-9"
			/>
		</div>
	</div>

	<!-- Tabs -->
	<Tabs value={activeTab} onValueChange={handleTabChange} class="flex-1 flex flex-col">
		<div class="px-4 pt-3">
			<TabsList class="w-full">
				<TabsTrigger value="all" class="flex-1">
					Todas
					{#if tabCounts.all > 0}
						<Badge variant="secondary" class="ml-2">{tabCounts.all}</Badge>
					{/if}
				</TabsTrigger>
				<TabsTrigger value="mine" class="flex-1">
					Mías
					{#if tabCounts.mine > 0}
						<Badge variant="secondary" class="ml-2">{tabCounts.mine}</Badge>
					{/if}
				</TabsTrigger>
				<TabsTrigger value="unassigned" class="flex-1">
					Sin asignar
					{#if tabCounts.unassigned > 0}
						<Badge variant="secondary" class="ml-2">{tabCounts.unassigned}</Badge>
					{/if}
				</TabsTrigger>
			</TabsList>
		</div>

		<!-- Filters (optional) -->
		{#if filters}
			<div class="px-4 py-2 border-b border-border">
				{@render filters()}
			</div>
		{/if}

		<!-- Conversations List -->
		<div class="flex-1 overflow-hidden min-h-0">
			<TabsContent value={activeTab} class="h-full m-0 flex flex-col">
				<div class="flex-1 overflow-y-auto min-h-0" bind:this={scrollContainer} onscroll={handleScroll}>
					<div class="p-2 space-y-1">
						{#if filteredConversations().length === 0}
							<div class="text-center py-8 text-muted-foreground text-sm">
								{#if searchQuery.trim()}
									No se encontraron conversaciones
								{:else}
									No hay conversaciones en esta vista
								{/if}
							</div>
						{:else}
							{#each filteredConversations() as conversation (conversation.id)}
								{#if conversationItem}
									{@render conversationItem(conversation)}
								{:else}
									<!-- Default conversation item -->
									<button
										class={cn(
											'w-full text-left p-3 rounded-lg transition-colors',
											'hover:bg-accent',
											selectedConversationId === conversation.id
												? 'bg-accent border-l-2 border-primary'
												: ''
										)}
										onclick={() => handleConversationClick(conversation.id)}
									>
										<div class="flex items-start justify-between mb-1">
											<span class="font-semibold text-sm">{conversation.contactName}</span>
											{#if conversation.unreadCount && conversation.unreadCount > 0}
												<Badge variant="default" class="ml-2">{conversation.unreadCount}</Badge>
											{/if}
										</div>
										<p class="text-sm text-muted-foreground truncate mb-1">
											{conversation.lastMessage}
										</p>
										<span class="text-xs text-muted-foreground">{conversation.timestamp}</span>
									</button>
								{/if}
							{/each}

							<!-- Loading more indicator -->
							{#if isLoadingMore}
								<div class="flex items-center justify-center py-4 text-muted-foreground">
									<Loader2 class="h-5 w-5 animate-spin mr-2" />
									<span class="text-sm">Cargando más conversaciones...</span>
								</div>
							{:else if !hasMore && filteredConversations().length > 0}
								<div class="text-center py-4 text-muted-foreground text-xs">
									No hay más conversaciones
								</div>
							{/if}
							{/if}
						</div>
						<div bind:this={sentinel} aria-hidden="true"></div>
					</div>
				</TabsContent>
			</div>
		</Tabs>
	</div>
