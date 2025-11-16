<script lang="ts">
	import { cn } from '$lib/utils';
	import { Button, Textarea } from '$lib/components/ui';
	import { Send, Paperclip, Mic, Smile, MoreHorizontal } from 'lucide-svelte';

	interface Props {
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		isSending?: boolean;
		maxLength?: number;
		showAudioButton?: boolean;
		showFileButton?: boolean;
		showEmojiButton?: boolean;
		showMoreButton?: boolean;
		onSend?: (message: string) => void;
		onSendAudio?: (file: File) => void;
		onSendFile?: (file: File) => void;
		onEmojiClick?: () => void;
		onMoreClick?: () => void;
		class?: string;
	}

	let {
		value = $bindable(''),
		placeholder = 'Escribe un mensaje...',
		disabled = false,
		isSending = false,
		maxLength = 4000,
		showAudioButton = true,
		showFileButton = true,
		showEmojiButton = true,
		showMoreButton = false,
		onSend,
		onSendAudio,
		onSendFile,
		onEmojiClick,
		onMoreClick,
		class: className
	}: Props = $props();

	let fileInput: HTMLInputElement | undefined = $state();
	let audioInput: HTMLInputElement | undefined = $state();

	// Check if message can be sent
	const canSend = $derived(value.trim().length > 0 && !isSending && !disabled);

	function handleSend() {
		if (canSend) {
			onSend?.(value.trim());
			value = '';
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		// Send on Enter (without Shift)
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSend();
		}
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			onSendFile?.(file);
			// Reset input
			target.value = '';
		}
	}

	function handleAudioSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			onSendAudio?.(file);
			// Reset input
			target.value = '';
		}
	}

	function triggerFileUpload() {
		fileInput?.click();
	}

	function triggerAudioUpload() {
		audioInput?.click();
	}

	// Character count
	const characterCount = $derived(value.length);
	const isNearLimit = $derived(characterCount > maxLength * 0.9);
</script>

<div class={cn('p-4 bg-background', className)}>
	<div class="flex items-end gap-2">
		<!-- Left: Action buttons -->
		<div class="flex items-center gap-1 pb-2">
			<!-- File upload -->
			{#if showFileButton && onSendFile}
				<input
					bind:this={fileInput}
					type="file"
					class="hidden"
					accept="*/*"
					onchange={handleFileSelect}
				/>
				<Button
					variant="ghost"
					size="icon"
					{disabled}
					onclick={triggerFileUpload}
					title="Adjuntar archivo"
				>
					<Paperclip class="h-5 w-5" />
				</Button>
			{/if}

			<!-- Audio upload -->
			{#if showAudioButton && onSendAudio}
				<input
					bind:this={audioInput}
					type="file"
					class="hidden"
					accept="audio/*"
					onchange={handleAudioSelect}
				/>
				<Button
					variant="ghost"
					size="icon"
					{disabled}
					onclick={triggerAudioUpload}
					title="Enviar audio"
				>
					<Mic class="h-5 w-5" />
				</Button>
			{/if}

			<!-- Emoji picker -->
			{#if showEmojiButton && onEmojiClick}
				<Button
					variant="ghost"
					size="icon"
					{disabled}
					onclick={onEmojiClick}
					title="Añadir emoji"
				>
					<Smile class="h-5 w-5" />
				</Button>
			{/if}

			<!-- More options -->
			{#if showMoreButton && onMoreClick}
				<Button
					variant="ghost"
					size="icon"
					{disabled}
					onclick={onMoreClick}
					title="Más opciones"
				>
					<MoreHorizontal class="h-5 w-5" />
				</Button>
			{/if}
		</div>

		<!-- Center: Text input -->
		<div class="flex-1 relative">
			<Textarea
				bind:value
				{placeholder}
				{disabled}
				maxlength={maxLength}
				rows={1}
				class="resize-none min-h-[40px] max-h-[200px] pr-12"
				onkeydown={handleKeydown}
			/>

			<!-- Character count (when near limit) -->
			{#if isNearLimit}
				<div class="absolute bottom-2 right-2 text-xs text-muted-foreground">
					<span class={cn(characterCount >= maxLength && 'text-destructive')}>
						{characterCount}/{maxLength}
					</span>
				</div>
			{/if}
		</div>

		<!-- Right: Send button -->
		<div class="pb-2">
			<Button
				variant="default"
				size="icon"
				disabled={!canSend}
				onclick={handleSend}
				title="Enviar mensaje"
				class={cn(
					'transition-all',
					canSend && 'bg-primary hover:bg-primary/90',
					!canSend && 'opacity-50 cursor-not-allowed'
				)}
			>
				{#if isSending}
					<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
				{:else}
					<Send class="h-5 w-5" />
				{/if}
			</Button>
		</div>
	</div>

	<!-- Status indicator -->
	{#if isSending}
		<div class="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
			<div class="w-1 h-1 rounded-full bg-current animate-pulse"></div>
			<span>Enviando mensaje...</span>
		</div>
	{/if}
</div>
