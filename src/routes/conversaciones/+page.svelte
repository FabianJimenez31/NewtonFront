<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import InboxLayout from '$lib/components/inbox/InboxLayout.svelte';
	import ConversationsList from '$lib/components/inbox/ConversationsList.svelte';
	import ConversationItem from '$lib/components/inbox/ConversationItem.svelte';
	import ConversationFilters from '$lib/components/inbox/ConversationFilters.svelte';
	import MessagingConsole from '$lib/components/inbox/MessagingConsole.svelte';
	import MessageHeader from '$lib/components/inbox/MessageHeader.svelte';
	import MessageHistory from '$lib/components/inbox/MessageHistory.svelte';
	import MessageBubble from '$lib/components/inbox/MessageBubble.svelte';
	import ReplyBox from '$lib/components/inbox/ReplyBox.svelte';
	import ContactDetailsPanel from '$lib/components/inbox/ContactDetailsPanel.svelte';
	import { ThinkingLoader } from '$lib/components/ui';
	import {
		filteredConversations,
		activeTab,
		isLoading,
		error,
		inboxActions
	} from '$lib/stores/inbox.store';
	import {
		currentConversation,
		messages,
		isLoadingMessages,
		isSending,
		messagingActions
	} from '$lib/stores/messaging.store';
	import { authStore } from '$lib/stores/auth.store';
	import { sortedStages } from '$lib/stores/kanban.core.store';
	import { toggleAI, pauseAI, resumeAI } from '$lib/services/ai.service';

	let token = $derived($authStore.token);
	let searchQuery = $state('');
	let replyMessage = $state('');

	onMount(async () => {
		if (!token) {
			console.error('[INBOX] No auth token');
			return;
		}
		await inboxActions.loadInbox(token, 'all');
		// TODO: Enable polling when endpoint is ready
		// messagingActions.startPolling(token, 5000);
	});

	onDestroy(() => {
		messagingActions.stopPolling();
		messagingActions.clearConversation();
	});

	async function selectConversation(id: string) {
		if (!token) return;
		inboxActions.selectConversation(id);
		await messagingActions.loadConversation(token, id);
		inboxActions.markAsRead(id);
	}

	async function changeTab(tab: 'all' | 'mine' | 'unassigned') {
		if (!token) return;
		await inboxActions.loadInbox(token, tab);
	}

	async function sendMessage(msg: string) {
		if (!token || !msg.trim()) return;
		try {
			await messagingActions.sendTextMessage(token, msg);
			replyMessage = '';
		} catch (err) {
			console.error('Send failed:', err);
		}
	}

	async function sendFile(file: File) {
		if (!token) return;
		try {
			await messagingActions.sendFileMessage(token, file);
		} catch (err) {
			console.error('File send failed:', err);
		}
	}

	async function sendAudio(file: File) {
		if (!token) return;
		try {
			await messagingActions.sendAudioMessage(token, file);
		} catch (err) {
			console.error('Audio send failed:', err);
		}
	}

	async function handleAIToggle(enabled: boolean, reason?: string) {
		if (!token || !$currentConversation?.lead) return;
		try {
			await toggleAI(token, $currentConversation.lead.id, enabled, reason);
			// Reload conversation to get updated AI status
			await messagingActions.loadConversation(token, $currentConversation.id);
		} catch (err) {
			console.error('AI toggle failed:', err);
		}
	}

	async function handleAIPause(reason: string) {
		if (!token || !$currentConversation?.lead) return;
		try {
			await pauseAI(token, $currentConversation.lead.id, reason);
			await messagingActions.loadConversation(token, $currentConversation.id);
		} catch (err) {
			console.error('AI pause failed:', err);
		}
	}

	async function handleAIResume() {
		if (!token || !$currentConversation?.lead) return;
		try {
			await resumeAI(token, $currentConversation.lead.id);
			await messagingActions.loadConversation(token, $currentConversation.id);
		} catch (err) {
			console.error('AI resume failed:', err);
		}
	}

	function formatTime(timestamp: string): string {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'Ahora';
		if (diffMins < 60) return `Hace ${diffMins} min`;
		if (diffHours < 24) return `Hace ${diffHours}h`;
		if (diffDays < 7) return `Hace ${diffDays}d`;
		return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
	}
</script>

<svelte:head>
	<title>Conversaciones - Newton CRM</title>
</svelte:head>

{#if $error}
	<div class="bg-destructive text-destructive-foreground p-4 text-center">
		<p class="text-sm font-medium">{$error}</p>
	</div>
{/if}

<InboxLayout>
	{#snippet conversationsList()}
		<ConversationsList
			conversations={$filteredConversations.map((c) => ({
				id: c.id,
				contactName: c.contact_name,
				lastMessage: c.last_message,
				timestamp: formatTime(c.last_message_time),
				unreadCount: c.unread_count,
				assigned: !!c.assigned_agent,
				priority: c.priority,
				channel: c.channel,
				stage: c.stage
			}))}
			bind:activeTab={$activeTab}
			bind:searchQuery
			onConversationSelect={selectConversation}
			onTabChange={changeTab}
			onSearchChange={(q) => inboxActions.updateFilters({ search: q })}
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
					onclick={() => selectConversation(conv.id)}
				/>
			{/snippet}

			{#snippet filters()}
				<ConversationFilters
					availableStages={$sortedStages.map((s: any) => ({
						id: s.id,
						name: s.name,
						color: s.color
					}))}
					onClearFilters={() => inboxActions.clearFilters()}
				/>
			{/snippet}
		</ConversationsList>
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
					status: 'offline'
				}}
				messages={$messages.map((m) => ({
					id: m.id,
					content: m.content,
					sender: m.sender === 'contact' ? 'customer' : m.sender === 'agent' ? 'agent' : 'system',
					timestamp: m.timestamp,
					type: m.type,
					fileUrl: m.metadata?.file_url,
					fileName: m.metadata?.file_name,
					isInternal: m.internal
				})) as any}
				isLoading={$isLoadingMessages}
				isSending={$isSending}
			>
				{#snippet messageHeader(contact)}
					<MessageHeader
						contactName={contact.name}
						avatarUrl={contact.avatarUrl}
						channel={$currentConversation?.channel}
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
						onSend={sendMessage}
						onSendFile={sendFile}
						onSendAudio={sendAudio}
					/>
				{/snippet}
			</MessagingConsole>
		{:else}
			<div class="flex flex-col items-center justify-center h-full text-muted-foreground">
				<div class="text-6xl mb-4">💬</div>
				<p class="text-lg font-medium">Selecciona una conversación</p>
				<p class="text-sm mt-2">Elige una conversación para empezar a chatear</p>
			</div>
		{/if}
	{/snippet}

	{#snippet contactDetails()}
		<ContactDetailsPanel
			conversation={$currentConversation}
			availableStages={$sortedStages}
			onAIToggle={handleAIToggle}
			onAIPause={handleAIPause}
			onAIResume={handleAIResume}
		/>
	{/snippet}
</InboxLayout>
