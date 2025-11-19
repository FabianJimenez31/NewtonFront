<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import InboxLayout from "$lib/components/inbox/InboxLayout.svelte";
	import ConversationsList from "$lib/components/inbox/ConversationsList.svelte";
	import ConversationItem from "$lib/components/inbox/ConversationItem.svelte";
	import ConversationFilters from "$lib/components/inbox/ConversationFilters.svelte";
	import MessagingConsole from "$lib/components/inbox/MessagingConsole.svelte";
	import MessageHeader from "$lib/components/inbox/MessageHeader.svelte";
	import MessageHistory from "$lib/components/inbox/MessageHistory.svelte";
	import MessageBubble from "$lib/components/inbox/MessageBubble.svelte";
	import ReplyBox from "$lib/components/inbox/ReplyBox.svelte";
	import ContactDetailsPanel from "$lib/components/inbox/ContactDetailsPanel.svelte";
	import ConversationTabs from "$lib/components/inbox/ConversationTabs.svelte";
	import { ThinkingLoader } from "$lib/components/ui";
	import {
		filteredConversations,
		activeTab,
		isLoading,
		error,
		inboxActions,
		countByTab,
		filters,
	} from "$lib/stores/inbox.store";
	import {
		paginationSummary,
		isPageLoading,
	} from "$lib/stores/inbox.pagination.store";
	import { paginationActions } from "$lib/stores/inbox.pagination.actions";
	import { loadInboxWithPagination } from "$lib/stores/inbox.init";
	import { agents, agentActions } from "$lib/stores/inbox.agents.store";
	import {
		minimizedConversations,
		tabsActions,
	} from "$lib/stores/conversations-tabs.store";
	import {
		currentConversation,
		messages,
		isLoadingMessages,
		isSending,
		messagingActions,
	} from "$lib/stores/messaging.store";
	import { authStore } from "$lib/stores/auth.store";
	import { sortedStages, kanbanStore } from "$lib/stores/kanban.core.store";
	import { createConversationHandlers } from "./conversation.handlers";

	import InboxDashboard from "$lib/components/inbox/InboxDashboard.svelte";
	import InboxSidebar from "$lib/components/inbox/InboxSidebar.svelte";

	let token = $derived($authStore.token);
	let searchQuery = $state("");
	let replyMessage = $state("");
	let pagination = $derived($paginationSummary);
	let isPaginating = $derived($isPageLoading);
	let currentFilters = $derived($filters);
	let activeView = $state("all"); // 'all', 'mine', 'unassigned', or stageId

	// Initialize handlers with token getter
	const handlers = createConversationHandlers(() => token || "");

	onMount(async () => {
		if (!token) {
			console.error("[INBOX] No auth token");
			return;
		}
		// Load stages for color coding
		kanbanStore.loadConfig(token);

		await loadInboxWithPagination(token, "all");
		agentActions.loadAgents(token);
	});

	onDestroy(() => {
		messagingActions.stopPolling();
		messagingActions.clearConversation();
	});

	async function onSendMessage(msg: string) {
		try {
			await handlers.sendMessage(msg);
			replyMessage = "";
		} catch (err) {
			// Error handled in handler
		}
	}

	function handleSidebarSelect(view: string) {
		activeView = view;
		if (["all", "mine", "unassigned"].includes(view)) {
			handlers.changeTab(view as any);
			// Clear stage filters when switching to a main view
			inboxActions.updateFilters({ stage: [] });
		} else {
			// It's a stage ID
			// Switch to 'all' tab to search across everything, but apply stage filter
			handlers.changeTab("all");
			inboxActions.updateFilters({ stage: [view] });
		}
	}
</script>

<svelte:head>
	<title>Conversaciones - Newton CRM</title>
</svelte:head>

<div class="h-full flex flex-col">
	{#if $error}
		<div class="bg-destructive text-destructive-foreground p-4 text-center">
			<p class="text-sm font-medium">{$error}</p>
		</div>
	{/if}

	<div class="flex-1 flex overflow-hidden">
		<InboxSidebar
			{activeView}
			counts={$countByTab}
			stages={$sortedStages}
			onSelect={handleSidebarSelect}
			collapsed={!!$currentConversation}
		/>

		<InboxLayout class="flex-1" hasSelection={!!$currentConversation}>
			{#snippet conversationsList()}
				<ConversationsList
					conversations={$filteredConversations.map((c) => {
						const stage = $sortedStages.find(
							(s) =>
								s.id === c.stage_id ||
								s.id === c.stage ||
								s.name.toLowerCase() ===
									c.stage?.toLowerCase() ||
								s.name.toLowerCase() ===
									c.stage_id?.toLowerCase(),
						);
						return {
							id: c.id,
							contactName: c.contact_name,
							lastMessage: c.last_message,
							timestamp: handlers.formatTime(c.last_message_time),
							unreadCount: c.unread_count,
							assigned: !!c.assigned_agent,
							priority: c.priority,
							channel: c.channel,
							stage: c.stage,
							stageColor: stage?.color,
						};
					})}
					bind:searchQuery
					{pagination}
					{isPaginating}
					onConversationSelect={handlers.selectConversation}
					onSearchChange={(q) =>
						inboxActions.updateFilters({ search: q })}
					onPageChange={handlers.goToPage}
				>
					{#snippet conversationItem(conv)}
						<ConversationItem
							id={conv.id}
							contactName={conv.contactName}
							lastMessage={conv.lastMessage}
							timestamp={conv.timestamp}
							unreadCount={conv.unreadCount}
							priority={conv.priority}
							channel={conv.channel as any}
							stage={conv.stage}
							stageColor={conv.stageColor}
							onclick={() => handlers.selectConversation(conv.id)}
						/>
					{/snippet}

					{#snippet filters()}
						<ConversationFilters
							activeFilters={currentFilters as any}
							availableStages={$sortedStages.map((s: any) => ({
								id: s.id,
								name: s.name,
								color: s.color,
							}))}
							onClearFilters={() => inboxActions.clearFilters()}
							onFilterChange={(filters) => {
								console.log("[PAGE] Filter change:", filters);
								inboxActions.updateFilters(filters);
							}}
						/>
					{/snippet}
				</ConversationsList>

				<!-- Conversation Tabs (Bottom of List) -->
				<ConversationTabs
					conversations={$minimizedConversations}
					onTabClick={(id) => handlers.selectConversation(id)}
					onTabClose={(id) => handlers.closeConversationTab(id)}
				/>
			{/snippet}

			{#snippet dashboard()}
				{@const dashboardStats = {
					unread: $filteredConversations.reduce(
						(sum, c) => sum + (c.unread_count || 0),
						0,
					),
					highPriority: $filteredConversations.filter(
						(c) => c.priority === "high",
					).length,
					open:
						$paginationSummary.total ||
						$filteredConversations.length,
				}}
				<InboxDashboard
					userName={$authStore.user?.name || "Usuario"}
					stats={dashboardStats}
					onQuickFilter={(filter) => {
						console.log("Quick filter:", filter);
						if (filter === "unread") {
							// Filter for unread (this might need a new filter type in store)
							// For now, just log
						} else if (filter === "priority") {
							inboxActions.updateFilters({ priority: "high" });
						} else if (filter === "all") {
							inboxActions.clearFilters();
						}
					}}
				/>
			{/snippet}

			{#snippet messagingConsole()}
				{#if $isLoading}
					<div class="flex items-center justify-center h-full">
						<ThinkingLoader message="Cargando conversaciones..." />
					</div>
				{:else if $currentConversation}
					<MessagingConsole
						contact={{
							id: $currentConversation.lead_id,
							name: $currentConversation.contact_name,
							avatarUrl: $currentConversation.contact_avatar,
							status: "offline",
							assignedAgent: $currentConversation.assigned_agent,
						}}
						messages={$messages.map((m) => ({
							id: m.id,
							content: m.content,
							sender:
								m.sender === "contact" ? "customer" : m.sender,
							timestamp: m.timestamp,
							type: m.type,
							fileUrl: m.metadata?.file_url,
							fileName: m.metadata?.file_name,
							isInternal: m.internal,
						})) as any}
						isLoading={$isLoadingMessages}
						isSending={$isSending}
						agents={$agents}
						onAssign={handlers.handleAssignAgent}
					>
						{#snippet messageHeader(contact)}
							<MessageHeader
								contactName={contact.name}
								avatarUrl={contact.avatarUrl}
								channel={$currentConversation?.channel}
								onBack={() => handlers.selectConversation(null)}
								onMinimize={() =>
									handlers.minimizeConversation()}
								onClose={() =>
									handlers.closeConversationTab(
										$currentConversation?.id || "",
									)}
							/>
						{/snippet}

						{#snippet messageHistory(msgs)}
							<MessageHistory messages={msgs} autoScroll={true}>
								{#snippet messageBubble(msg)}
									<MessageBubble {...msg} />
								{/snippet}
							</MessageHistory>
						{/snippet}

						{#snippet replyBox()}
							<ReplyBox
								bind:value={replyMessage}
								isSending={$isSending}
								onSend={onSendMessage}
								onSendFile={handlers.sendFile}
								onSendAudio={handlers.sendAudio}
							/>
						{/snippet}
					</MessagingConsole>
				{:else}
					<div
						class="flex flex-col items-center justify-center h-full text-muted-foreground"
					>
						<div class="text-6xl mb-4">💬</div>
						<p class="text-lg font-medium">
							Selecciona una conversación
						</p>
						<p class="text-sm mt-2">
							Elige una conversación para empezar a chatear
						</p>
					</div>
				{/if}
			{/snippet}

			{#snippet contactDetails()}
				<ContactDetailsPanel
					conversation={$currentConversation}
					availableStages={$sortedStages}
					onAIToggle={handlers.handleAIToggle}
					onAIPause={handlers.handleAIPause}
					onAIResume={handlers.handleAIResume}
				/>
			{/snippet}
		</InboxLayout>
	</div>
</div>
