<script lang="ts">
	import { cn } from '$lib/utils';
	import { ScrollArea } from '$lib/components/ui';
	import { onMount, tick } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Message {
		id: string;
		content: string;
		sender: 'customer' | 'agent' | 'system';
		timestamp: string;
		type?: 'text' | 'audio' | 'file' | 'image';
		fileUrl?: string;
		fileName?: string;
		isInternal?: boolean;
	}

	interface Props {
		messages?: Message[];
		messageBubble?: Snippet<[Message]>;
		onLoadMore?: () => void;
		hasMore?: boolean;
		isLoadingMore?: boolean;
		autoScroll?: boolean;
		class?: string;
	}

	let {
		messages = [],
		messageBubble,
		onLoadMore,
		hasMore = false,
		isLoadingMore = false,
		autoScroll = true,
		class: className
	}: Props = $props();

	let scrollContainer: HTMLDivElement;
	let previousMessageCount = 0;

	// Auto-scroll to bottom when new messages arrive
	$effect(() => {
		if (autoScroll && messages.length > previousMessageCount) {
			tick().then(() => {
				scrollToBottom();
			});
		}
		previousMessageCount = messages.length;
	});

	function scrollToBottom() {
		if (scrollContainer) {
			const scrollElement = scrollContainer.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
			if (scrollElement) {
				scrollElement.scrollTop = scrollElement.scrollHeight;
			}
		}
	}

	function handleScroll(event: Event) {
		const target = event.target as HTMLElement;
		const scrollTop = target.scrollTop;

		// Load more when scrolled near top
		if (scrollTop < 100 && hasMore && !isLoadingMore && onLoadMore) {
			onLoadMore();
		}
	}

	onMount(() => {
		scrollToBottom();
	});

	// Group messages by date
	function groupMessagesByDate(msgs: Message[]): Array<{ date: string; messages: Message[] }> {
		const groups: Record<string, Message[]> = {};

		msgs.forEach((msg) => {
			const date = new Date(msg.timestamp).toLocaleDateString('es-ES', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});

			if (!groups[date]) {
				groups[date] = [];
			}
			groups[date].push(msg);
		});

		return Object.entries(groups).map(([date, messages]) => ({ date, messages }));
	}

	const groupedMessages = $derived(groupMessagesByDate(messages));
</script>

<div bind:this={scrollContainer} class={cn('h-full', className)}>
	<ScrollArea class="h-full" orientation="vertical">
		<div class="p-4 space-y-4" onscroll={handleScroll}>
			<!-- Load more indicator -->
			{#if hasMore && isLoadingMore}
				<div class="flex justify-center py-2">
					<div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
				</div>
			{/if}

			<!-- Empty state -->
			{#if messages.length === 0}
				<div class="flex flex-col items-center justify-center py-12 text-center">
					<div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6 text-muted-foreground"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
							/>
						</svg>
					</div>
					<p class="text-sm text-muted-foreground">No hay mensajes en esta conversación</p>
					<p class="text-xs text-muted-foreground mt-1">Envía un mensaje para comenzar</p>
				</div>
			{:else}
				<!-- Grouped messages by date -->
				{#each groupedMessages as group}
					<!-- Date separator -->
					<div class="flex items-center justify-center py-2">
						<div class="bg-muted px-3 py-1 rounded-full">
							<span class="text-xs font-medium text-muted-foreground">{group.date}</span>
						</div>
					</div>

					<!-- Messages for this date -->
					<div class="space-y-3">
						{#each group.messages as message (message.id)}
							{#if messageBubble}
								{@render messageBubble(message)}
							{:else}
								<!-- Default message display -->
								<div
									class={cn(
										'flex',
										message.sender === 'customer' ? 'justify-start' : 'justify-end'
									)}
								>
									<div
										class={cn(
											'max-w-[70%] rounded-lg px-4 py-2',
											message.sender === 'customer'
												? 'bg-muted text-foreground'
												: 'bg-primary text-primary-foreground'
										)}
									>
										<p class="text-sm">{message.content}</p>
										<span class="text-xs opacity-70 mt-1 block">
											{new Date(message.timestamp).toLocaleTimeString('es-ES', {
												hour: '2-digit',
												minute: '2-digit'
											})}
										</span>
									</div>
								</div>
							{/if}
						{/each}
					</div>
				{/each}
			{/if}
		</div>
	</ScrollArea>
</div>
