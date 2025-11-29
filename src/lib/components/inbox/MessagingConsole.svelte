<script lang="ts">
	import { cn } from "$lib/utils";
	import { onMount, tick } from "svelte";
	import ConsoleHeader from "./ConsoleHeader.svelte";
	import MessageBubble from "./MessageBubble.svelte";
	import MessageSystem from "./message-bubble/MessageSystem.svelte";
	import ComposerNew from "./ComposerNew.svelte";
	import type { Agent } from "$lib/types/inbox.types";

	interface Message {
		id: string;
		content: string;
		sender: "customer" | "agent" | "system" | "ai";
		timestamp: string;
		type?: "text" | "audio" | "file" | "image" | "video";
		fileUrl?: string;
		fileName?: string;
		isInternal?: boolean;
		status?: "sending" | "sent" | "delivered" | "read" | "failed";
		sender_name?: string;
	}

	interface Contact {
		id: string;
		name: string;
		avatarUrl?: string;
		status?: "online" | "offline";
		stage?: string;
		assignedAgent?: Agent;
	}

	interface Stage {
		id: string;
		name: string;
		color?: string;
	}

	import type { Snippet } from "svelte";

	interface Props {
		contact?: Contact;
		messages?: Message[];
		agents?: Agent[];
		stages?: Stage[];
		isLoading?: boolean;
		isSending?: boolean;
		onSendMessage?: (
			content: string,
			type: "text" | "audio" | "file",
			isInternal: boolean,
		) => void;
		onSendAudio?: (audioBase64: string, duration: number) => void;
		onSendImage?: (base64: string, mimetype: string, filename: string, caption?: string) => void;
		onSendPdf?: (base64: string, filename: string, caption?: string) => void;
		onSendVideo?: (base64: string, mimetype: string, filename: string, caption?: string) => void;
		onAssign?: (agentId: string) => void;
		onStageChange?: (stageId: string) => void;
		class?: string;
		messageHeader?: Snippet<[any]>;
		messageHistory?: Snippet<[any]>;
		replyBox?: Snippet<[]>;
	}

	let {
		contact,
		messages = [],
		agents = [],
		stages = [],
		isLoading = false,
		isSending = false,
		onSendMessage,
		onSendAudio,
		onSendImage,
		onSendPdf,
		onSendVideo,
		onAssign,
		onStageChange,
		messageHeader,
		messageHistory,
		replyBox,
		class: className,
	}: Props = $props();

	let scrollContainer: HTMLDivElement | undefined = $state();

	function scrollToBottom() {
		if (scrollContainer) {
			scrollContainer.scrollTop = scrollContainer.scrollHeight;
		}
	}

	$effect(() => {
		if (messages.length) {
			tick().then(scrollToBottom);
		}
	});
</script>

<div class={cn("flex flex-col h-full bg-background", className)}>
	{#if !contact}
		<!-- Empty State: No conversation selected -->
		<div
			class="flex flex-col items-center justify-center h-full text-center px-6"
		>
			<div
				class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4"
			>
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
				Elige una conversación de la lista para ver el historial de
				mensajes y comenzar a chatear.
			</p>
		</div>
	{:else}
		<!-- Header -->
		{#if messageHeader}
			{@render messageHeader(contact)}
		{:else}
			<ConsoleHeader
				{contact}
				{agents}
				{stages}
				{onAssign}
				{onStageChange}
			/>
		{/if}

		<!-- Message History -->
		<div
			bind:this={scrollContainer}
			class="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
		>
			{#if isLoading}
				<div class="flex items-center justify-center h-full">
					<div class="flex flex-col items-center gap-3">
						<div
							class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"
						></div>
						<p class="text-sm text-muted-foreground">
							Cargando mensajes...
						</p>
					</div>
				</div>
			{:else}
				{#each messages as message (message.id)}
					{#if message.sender === "system"}
						<MessageSystem
							content={message.content}
							timestamp={message.timestamp}
						/>
					{:else}
						<MessageBubble
							id={message.id}
							content={message.content}
							sender={message.sender}
							timestamp={message.timestamp}
							type={message.type}
							fileUrl={message.fileUrl}
							fileName={message.fileName}
							isInternal={message.isInternal}
							status={message.status}
							senderName={message.sender_name}
						/>
					{/if}
				{/each}
			{/if}
		</div>

		<!-- Composer -->
		<ComposerNew
			onSend={(content, type, isInternal) =>
				onSendMessage?.(content, type, isInternal)}
			onSendAudio={(audioBase64, duration) => onSendAudio?.(audioBase64, duration)}
			onSendImage={(base64, mimetype, filename, caption) => onSendImage?.(base64, mimetype, filename, caption)}
			onSendPdf={(base64, filename, caption) => onSendPdf?.(base64, filename, caption)}
			onSendVideo={(base64, mimetype, filename, caption) => onSendVideo?.(base64, mimetype, filename, caption)}
			isAiEnabled={true}
		/>
	{/if}
</div>
