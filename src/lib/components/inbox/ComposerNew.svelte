<script lang="ts">
	import { cn } from '$lib/utils';
	import { Button } from '$lib/components/ui';
	import { Send, FileText, Image as ImageIcon, Video, Lock, Sparkles } from 'lucide-svelte';
	import { fade } from 'svelte/transition';
	import AudioRecorder from './AudioRecorder.svelte';
	import MediaUploader from './MediaUploader.svelte';

	interface Props {
		onSend: (content: string, type: 'text', isInternal: boolean) => void;
		onSendAudio: (audioBase64: string, duration: number) => void;
		onSendImage: (base64: string, mimetype: string, filename: string, caption?: string) => void;
		onSendPdf: (base64: string, filename: string, caption?: string) => void;
		onSendVideo: (base64: string, mimetype: string, filename: string, caption?: string) => void;
		onTyping?: () => void;
		isAiEnabled?: boolean;
		class?: string;
	}

	let {
		onSend,
		onSendAudio,
		onSendImage,
		onSendPdf,
		onSendVideo,
		onTyping,
		isAiEnabled = false,
		class: className,
	}: Props = $props();

	let content = $state('');
	let isInternal = $state(false);
	let isAiActive = $state(false);
	let inputRef: HTMLTextAreaElement | undefined = $state();
	let showMediaMenu = $state(false);

	function handleSend() {
		if (!content.trim()) return;
		onSend(content, 'text', isInternal);
		content = '';
		if (inputRef) {
			inputRef.style.height = 'auto';
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		content = target.value;
		onTyping?.();
		target.style.height = 'auto';
		target.style.height = `${Math.min(target.scrollHeight, 150)}px`;
	}

	function toggleInternal() {
		isInternal = !isInternal;
		setTimeout(() => inputRef?.focus(), 0);
	}

	function toggleAi() {
		isAiActive = !isAiActive;
	}

	function toggleMediaMenu() {
		showMediaMenu = !showMediaMenu;
	}
</script>

<div
	class={cn(
		'p-4 border-t border-border bg-background transition-colors duration-300',
		isInternal && 'bg-yellow-50/30',
		className
	)}
>
	<!-- Toolbar -->
	<div class="flex items-center justify-between mb-2">
		<div class="flex items-center gap-1">
			<!-- Internal Note Toggle -->
			<button
				type="button"
				onclick={toggleInternal}
				class={cn(
					'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200',
					isInternal
						? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
						: 'text-muted-foreground hover:bg-muted hover:text-foreground'
				)}
				title="Nota interna (solo visible para el equipo)"
			>
				<Lock class="h-3 w-3" />
				<span>Nota interna</span>
			</button>

			<!-- AI Assist Toggle -->
			{#if isAiEnabled}
				<button
					type="button"
					onclick={toggleAi}
					class={cn(
						'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ml-1',
						isAiActive
							? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
							: 'text-muted-foreground hover:bg-muted hover:text-foreground'
					)}
					title="Asistente IA"
				>
					<Sparkles class="h-3 w-3" />
					<span>AI Assist</span>
				</button>
			{/if}
		</div>
	</div>

	<!-- Input Area -->
	<div
		class={cn(
			'relative rounded-xl border transition-all duration-200 focus-within:ring-1 focus-within:ring-primary/20',
			isInternal
				? 'bg-yellow-50 border-yellow-200 focus-within:border-yellow-400'
				: 'bg-background border-input focus-within:border-primary'
		)}
	>
		<textarea
			bind:this={inputRef}
			value={content}
			oninput={handleInput}
			onkeydown={handleKeydown}
			placeholder={isInternal ? 'Escribe una nota interna...' : 'Escribe un mensaje...'}
			rows="1"
			class="w-full bg-transparent border-none focus:ring-0 resize-none py-3 px-4 min-h-[44px] max-h-[150px] text-sm placeholder:text-muted-foreground/70"
		></textarea>

		<!-- AI Suggestion Overlay (Placeholder) -->
		{#if isAiActive && !content}
			<div
				class="absolute top-3 left-4 pointer-events-none text-sm text-muted-foreground/50 flex items-center gap-2"
				transition:fade
			>
				<Sparkles class="h-3 w-3" />
				<span>La IA sugerirá respuestas aquí...</span>
			</div>
		{/if}

		<!-- Actions Footer -->
		<div class="flex items-center justify-between px-2 pb-2">
			<div class="flex items-center gap-0.5">
				<!-- Audio Recorder -->
				<AudioRecorder onSend={(audioBase64: string, duration: number) => onSendAudio(audioBase64, duration)} />

				<!-- Image Uploader -->
				<MediaUploader
					onSendImage={(base64, mimetype, filename, caption) => onSendImage(base64, mimetype, filename, caption)}
					onSendPdf={(base64, filename, caption) => onSendPdf(base64, filename, caption)}
					onSendVideo={(base64, mimetype, filename, caption) => onSendVideo(base64, mimetype, filename, caption)}
					accept="image/*"
					mediaType="image"
				/>

				<!-- PDF Uploader -->
				<MediaUploader
					onSendImage={(base64, mimetype, filename, caption) => onSendImage(base64, mimetype, filename, caption)}
					onSendPdf={(base64, filename, caption) => onSendPdf(base64, filename, caption)}
					onSendVideo={(base64, mimetype, filename, caption) => onSendVideo(base64, mimetype, filename, caption)}
					accept="application/pdf"
					mediaType="document"
				/>

				<!-- Video Uploader -->
				<MediaUploader
					onSendImage={(base64, mimetype, filename, caption) => onSendImage(base64, mimetype, filename, caption)}
					onSendPdf={(base64, filename, caption) => onSendPdf(base64, filename, caption)}
					onSendVideo={(base64, mimetype, filename, caption) => onSendVideo(base64, mimetype, filename, caption)}
					accept="video/*"
					mediaType="video"
				/>
			</div>

			<Button
				size="sm"
				class={cn(
					'h-8 px-3 transition-all duration-200',
					isInternal ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : ''
				)}
				disabled={!content.trim()}
				onclick={handleSend}
			>
				<span class="mr-2">{isInternal ? 'Guardar' : 'Enviar'}</span>
				<Send class="h-3 w-3" />
			</Button>
		</div>
	</div>
</div>
