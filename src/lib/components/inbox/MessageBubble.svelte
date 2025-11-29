<script lang="ts">
	import { cn } from "$lib/utils";
	import { Badge } from "$lib/components/ui";
	import MessageText from "./message-bubble/MessageText.svelte";
	import MessageImage from "./message-bubble/MessageImage.svelte";
	import MessageAudio from "./message-bubble/MessageAudio.svelte";
	import MessageFile from "./message-bubble/MessageFile.svelte";
	import MessageVideo from "./message-bubble/MessageVideo.svelte";

	interface Props {
		id: string;
		content: string;
		sender: "customer" | "agent" | "ai" | "system";
		timestamp: string;
		type?: "text" | "audio" | "file" | "image" | "video";
		fileUrl?: string;
		fileName?: string;
		isInternal?: boolean;
		status?: "sending" | "sent" | "delivered" | "read" | "failed";
		class?: string;
		senderName?: string;
	}

	let {
		id,
		content,
		sender,
		timestamp,
		type = "text",
		fileUrl,
		fileName,
		isInternal = false,
		status = "sent",
		class: className,
		senderName,
	}: Props = $props();

	// Format time for internal/system messages
	const formattedTime = $derived.by(() => {
		try {
			if (!timestamp) return "";
			const date = new Date(timestamp);
			if (isNaN(date.getTime())) return "";
			return date.toLocaleTimeString("es-ES", {
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch (e) {
			return "";
		}
	});

	// Message alignment and styling
	const isFromCustomer = $derived(sender === "customer");
	const isFromAgent = $derived(sender === "agent");
	const isFromAI = $derived(sender === "ai");
	const isSystem = $derived(sender === "system");
</script>

{#if isSystem}
	<!-- System message -->
	<div class="flex justify-center py-2">
		<div class="bg-muted/50 px-3 py-1.5 rounded-lg max-w-[80%]">
			<p class="text-xs text-center text-muted-foreground">{content}</p>
		</div>
	</div>
{:else if isInternal}
	<!-- Internal note -->
	<div class="flex justify-start">
		<div
			class="max-w-[70%] rounded-lg px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
		>
			<div class="flex items-center gap-2 mb-1">
				<Badge variant="outline" class="text-xs">Nota interna</Badge>
			</div>
			<p class="text-sm text-foreground">{content}</p>
			<span class="text-xs text-muted-foreground mt-1 block"
				>{formattedTime}</span
			>
		</div>
	</div>
{:else}
	<!-- Regular message -->
	<div
		class={cn(
			"flex gap-2",
			isFromCustomer ? "justify-start" : "justify-end",
			className,
		)}
	>
		<div
			class={cn(
				"max-w-[70%] rounded-2xl overflow-hidden shadow-sm transition-all duration-200",
				isFromCustomer && "bg-gray-100 text-gray-900 hover:shadow-md",
				isFromAgent &&
					"bg-gradient-to-br from-primary to-primary/90 text-primary-foreground hover:shadow-lg",
				isFromAI &&
					"bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-lg",
				status === "failed" &&
					"bg-destructive/10 border border-destructive",
			)}
		>
			{#if type === "text"}
				<MessageText {content} {timestamp} {sender} {status} {senderName} />
			{:else if type === "image"}
				<MessageImage
					{content}
					{fileUrl}
					{timestamp}
					{sender}
					{status}
				/>
			{:else if type === "audio"}
				<MessageAudio {fileUrl} {timestamp} {sender} {status} />
			{:else if type === "video"}
				<MessageVideo {content} {fileUrl} {timestamp} {sender} {status} />
			{:else if type === "file"}
				<MessageFile
					{content}
					{fileUrl}
					{fileName}
					{timestamp}
					{sender}
					{status}
				/>
			{/if}

			<!-- Failed status indicator -->
			{#if status === "failed"}
				<div
					class="px-4 py-1 bg-destructive/10 border-t border-destructive"
				>
					<p class="text-xs text-destructive">
						No se pudo enviar el mensaje
					</p>
				</div>
			{/if}
		</div>
	</div>
{/if}
