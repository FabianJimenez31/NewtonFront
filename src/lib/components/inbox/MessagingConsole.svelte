<script lang="ts">
	import { cn } from '$lib/utils';
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

	interface Contact {
		id: string;
		name: string;
		avatarUrl?: string;
		status?: 'online' | 'offline';
	}

	interface Props {
		contact?: Contact;
		messages?: Message[];
		isLoading?: boolean;
		isSending?: boolean;
		messageHeader?: Snippet<[Contact]>;
		messageHistory?: Snippet<[Message[]]>;
		replyBox?: Snippet;
		quickActions?: Snippet;
		onSendMessage?: (content: string) => void;
		onSendAudio?: (file: File) => void;
		onSendFile?: (file: File) => void;
		class?: string;
	}

	let {
		contact,
		messages = [],
		isLoading = false,
		isSending = false,
		messageHeader,
		messageHistory,
		replyBox,
		quickActions,
		onSendMessage,
		onSendAudio,
		onSendFile,
		class: className
	}: Props = $props();
</script>

<div class={cn('flex flex-col h-full bg-background', className)}>
	{#if !contact}
		<!-- Empty State: No conversation selected -->
		<div class="flex flex-col items-center justify-center h-full text-center px-6">
			<div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-8 w-8 text-muted-foreground"
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
			<h3 class="text-lg font-semibold text-foreground mb-2">
				Selecciona una conversación
			</h3>
			<p class="text-sm text-muted-foreground max-w-sm">
				Elige una conversación de la lista para ver el historial de mensajes y comenzar a
				chatear.
			</p>
		</div>
	{:else}
		<!-- Message Header -->
		<div class="border-b border-border flex-shrink-0">
			{#if messageHeader}
				{@render messageHeader(contact)}
			{/if}
		</div>

		<!-- Message History -->
		<div class="flex-1 overflow-hidden">
			{#if isLoading}
				<div class="flex items-center justify-center h-full">
					<div class="flex flex-col items-center gap-3">
						<div
							class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"
						></div>
						<p class="text-sm text-muted-foreground">Cargando mensajes...</p>
					</div>
				</div>
			{:else if messageHistory}
				{@render messageHistory(messages)}
			{/if}
		</div>

		<!-- Quick Actions (optional) -->
		{#if quickActions}
			<div class="border-t border-border px-4 py-2 bg-muted/30">
				{@render quickActions()}
			</div>
		{/if}

		<!-- Reply Box -->
		<div class="border-t border-border flex-shrink-0">
			{#if replyBox}
				{@render replyBox()}
			{/if}
		</div>
	{/if}
</div>
