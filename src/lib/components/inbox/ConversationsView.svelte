<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import InboxLayout from "./InboxLayout.svelte";
	import ConversationsList from "./ConversationsList.svelte";
	import ConversationItem from "./ConversationItem.svelte";
	import ConversationFilters from "./ConversationFilters.svelte";
	import MessagingConsole from "./MessagingConsole.svelte";
	import MessageHeader from "./MessageHeader.svelte";
	import MessageHistory from "./MessageHistory.svelte";
	import MessageBubble from "./MessageBubble.svelte";
	import ReplyBox from "./ReplyBox.svelte";
	import ContactDetailsPanel from "./ContactDetailsPanel.svelte";
	import ConversationTabs from "./ConversationTabs.svelte";
	import InboxDashboard from "./InboxDashboard.svelte";
	import InboxSidebar from "./InboxSidebar.svelte";
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
	import { loadInboxWithPagination } from "$lib/stores/inbox.init";
	import { agents, agentActions } from "$lib/stores/inbox.agents.store";
	import { minimizedConversations } from "$lib/stores/conversations-tabs.store";
	import {
		currentConversation,
		messages,
		isLoadingMessages,
		isSending,
		messagingActions,
	} from "$lib/stores/messaging.store";
	import { authStore } from "$lib/stores/auth.store";
	import { kanbanStore, sortedStages } from "$lib/stores/kanban.core.store";
	import { createConversationHandlers } from "$lib/handlers/conversation.handlers";
	import {
		stageStatsStore,
		type DateFilter,
	} from "$lib/stores/stage-stats.store";
	import { webSocketService } from "$lib/services/websocket.service";
	import { notificationsWS } from "$lib/services/notifications.websocket.service";
	import { createSearchHandler } from "$lib/handlers/inbox.search.wrapper";
	import * as mediaHandlers from "$lib/handlers/conversation.media.handlers";

	let token = $derived($authStore.token);
	let tenantId = $derived($authStore.user?.tenant_id);
	let searchQuery = $state("");
	let replyMessage = $state("");
	let pagination = $derived($paginationSummary);
	let isPaginating = $derived($isPageLoading);
	let currentFilters = $derived($filters);
	let activeView = $state("all");

	const handlers = createConversationHandlers(
		() => token || "",
		() => tenantId,
	);

	onMount(async () => {
		if (!token || !tenantId) return;
		kanbanStore.loadConfig(token);
		await loadInboxWithPagination(token, "all");
		agentActions.loadAgents(token);
		stageStatsStore.loadStats(token, "all");

		// Setup notifications WebSocket callbacks
		notificationsWS.setCallbacks({
			onNewMessage: (data) => {
				console.log("[Inbox] New message notification:", data);
				if (data.lead_id) {
					inboxActions.updateConversation(data.lead_id, {
						last_message: data.message_preview || "Nuevo mensaje",
						last_message_time:
							data.timestamp || new Date().toISOString(),
						last_message_sender: "contact",
					});
				}
			},
			onNewConversation: (data) => {
				console.log("[Inbox] New conversation notification:", data);
				if (token) loadInboxWithPagination(token, $activeTab);
			},
			onConversationUpdated: (data) => {
				console.log("[Inbox] Conversation updated:", data);
				if (data.lead_id && data.changes) {
					inboxActions.updateConversation(data.lead_id, data.changes);
				}
			},
		});

		// Connect to global notifications
		notificationsWS.connect(tenantId, token);
	});

	onDestroy(() => {
		notificationsWS.disconnect();
		webSocketService.disconnect();
		messagingActions.stopPolling();
		messagingActions.clearConversation();
	});

	async function onSendMessage(content: string) {
		await handlers.sendMessage(content);
		replyMessage = "";
	}

	// Media handlers
	function handleSendAudio(audioBase64: string, duration: number) {
		mediaHandlers.sendAudioMessage(audioBase64, duration);
	}

	function handleSendImage(
		base64: string,
		mimetype: string,
		filename: string,
		caption?: string,
	) {
		mediaHandlers.sendImageMessage(base64, mimetype, filename, caption);
	}

	function handleSendPdf(base64: string, filename: string, caption?: string) {
		mediaHandlers.sendPdfMessage(base64, filename, caption);
	}

	function handleSendVideo(
		base64: string,
		mimetype: string,
		filename: string,
		caption?: string,
	) {
		mediaHandlers.sendVideoMessage(base64, mimetype, filename, caption);
	}

	async function handleDateFilterChange(
		filter: DateFilter,
		customRange?: { start: Date | null; end: Date | null },
	) {
		if (!token) return;
		stageStatsStore.loadStats(token, filter, customRange);
	}

	function handleSidebarSelect(view: string) {
		activeView = view;
		if (["all", "mine", "unassigned"].includes(view)) {
			handlers.changeTab(view as any);
			inboxActions.updateFilters({ stage: [] });
		} else {
			handlers.changeTab("all");
			inboxActions.updateFilters({ stage: [view] });
		}
	}
</script>

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
			onSelect={handleSidebarSelect}
			onDateFilterChange={handleDateFilterChange}
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
					onSearchChange={createSearchHandler(token || "", $activeTab)}
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
							onFilterChange={(f) =>
								inboxActions.updateFilters(f)}
						/>
					{/snippet}
				</ConversationsList>
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
						if (filter === "priority")
							inboxActions.updateFilters({ priority: "high" });
						else if (filter === "all") inboxActions.clearFilters();
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
						messages={$messages.map((m) => {
							const mapped = {
								id: m.id,
								content: m.content,
								sender:
									m.sender === "contact"
										? "customer"
										: m.sender,
								timestamp: m.timestamp,
								type: m.type,
								fileUrl: m.metadata?.file_url,
								fileName: m.metadata?.file_name,
								isInternal: m.internal,
								sender_name: m.sender_name,
							};
							console.log(
								"[ConversationsView] Original message:",
								m,
							);
							console.log(
								"[ConversationsView] Mapped for MessagingConsole:",
								mapped,
							);
							return mapped;
						}) as any}
						isLoading={$isLoadingMessages}
						isSending={$isSending}
						agents={$agents}
						onAssign={handlers.handleAssignAgent}
						{onSendMessage}
						onSendAudio={handleSendAudio}
						onSendImage={handleSendImage}
						onSendPdf={handleSendPdf}
						onSendVideo={handleSendVideo}
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
								stageId={contact.stage}
								stages={$sortedStages}
								onStageChange={(stageId: string) =>
									handlers.handleStageChange(stageId)}
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
					agents={$agents}
					onAssignAgent={handlers.handleAssignAgent}
					onStageChange={handlers.handleStageChange}
					onAIToggle={handlers.handleAIToggle}
					onAIPause={handlers.handleAIPause}
					onAIResume={handlers.handleAIResume}
				/>
			{/snippet}
		</InboxLayout>
	</div>
</div>
