<script lang="ts">
	import { cn } from '$lib/utils';
	import { Image as ImageIcon, FileText, Video, X, Send, Loader2 } from 'lucide-svelte';
	import {
		processMediaFile,
		formatFileSize,
		revokePreviewUrl,
		type MediaFile,
	} from '$lib/utils/media.utils';
	import { scale, fade } from 'svelte/transition';

	interface Props {
		onSendImage: (base64: string, mimetype: string, filename: string, caption?: string) => void;
		onSendPdf: (base64: string, filename: string, caption?: string) => void;
		onSendVideo: (base64: string, mimetype: string, filename: string, caption?: string) => void;
		onCancel?: () => void;
		accept?: string;
		mediaType?: 'image' | 'document' | 'video' | 'all';
		class?: string;
	}

	let {
		onSendImage,
		onSendPdf,
		onSendVideo,
		onCancel,
		accept = 'image/*,application/pdf,video/*',
		mediaType = 'all',
		class: className,
	}: Props = $props();

	let fileInputRef: HTMLInputElement | null = $state(null);
	let selectedFile: MediaFile | null = $state(null);
	let caption = $state('');
	let isProcessing = $state(false);
	let error = $state('');

	async function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) return;

		isProcessing = true;
		error = '';

		try {
			selectedFile = await processMediaFile(file);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Error al procesar el archivo';
			console.error('Error processing file:', e);
		} finally {
			isProcessing = false;
		}
	}

	function handleSend() {
		if (!selectedFile) return;

		try {
			if (selectedFile.type === 'image') {
				onSendImage(
					selectedFile.base64,
					selectedFile.mimetype,
					selectedFile.file.name,
					caption || undefined
				);
			} else if (selectedFile.type === 'document') {
				onSendPdf(selectedFile.base64, selectedFile.file.name, caption || undefined);
			} else if (selectedFile.type === 'video') {
				onSendVideo(
					selectedFile.base64,
					selectedFile.mimetype,
					selectedFile.file.name,
					caption || undefined
				);
			}

			handleCancel();
		} catch (e) {
			error = 'Error al enviar el archivo';
			console.error('Error sending file:', e);
		}
	}

	function handleCancel() {
		if (selectedFile?.preview) {
			revokePreviewUrl(selectedFile.preview);
		}
		selectedFile = null;
		caption = '';
		error = '';
		if (fileInputRef) fileInputRef.value = '';
		onCancel?.();
	}

	function openFilePicker() {
		fileInputRef?.click();
	}

	const iconMap = {
		image: ImageIcon,
		document: FileText,
		video: Video,
		all: ImageIcon,
	};

	const Icon = $derived(iconMap[mediaType]);
</script>

{#if !selectedFile}
	<!-- Upload Button -->
	<div class="relative">
		<input
			bind:this={fileInputRef}
			type="file"
			{accept}
			onchange={handleFileSelect}
			class="hidden"
		/>
		<button
			type="button"
			onclick={openFilePicker}
			disabled={isProcessing}
			class={cn(
				'flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300',
				'bg-background hover:bg-muted text-foreground',
				'disabled:opacity-50 disabled:cursor-not-allowed',
				className
			)}
			title={mediaType === 'image'
				? 'Enviar imagen'
				: mediaType === 'document'
					? 'Enviar PDF'
					: mediaType === 'video'
						? 'Enviar video'
						: 'Enviar archivo'}
		>
			{#if isProcessing}
				<Loader2 class="h-5 w-5 animate-spin" />
			{:else}
				<Icon class="h-5 w-5" />
			{/if}
		</button>
	</div>
{:else}
	<!-- Preview and Send UI -->
	<div
		class="flex flex-col gap-3 p-4 bg-muted/50 rounded-xl border border-border min-w-[350px] max-w-[450px]"
		transition:scale
	>
		<!-- File Preview -->
		<div class="flex items-center gap-3">
			{#if selectedFile.type === 'image' && selectedFile.preview}
				<img
					src={selectedFile.preview}
					alt="Preview"
					class="w-20 h-20 object-cover rounded-lg"
				/>
			{:else if selectedFile.type === 'video' && selectedFile.preview}
				<video
					src={selectedFile.preview}
					class="w-20 h-20 object-cover rounded-lg"
					muted
				>
					<track kind="captions" />
				</video>
			{:else if selectedFile.type === 'document'}
				<div
					class="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center"
				>
					<FileText class="h-10 w-10 text-primary" />
				</div>
			{/if}

			<!-- File Info -->
			<div class="flex-1 min-w-0">
				<p class="text-sm font-medium truncate">{selectedFile.file.name}</p>
				<p class="text-xs text-muted-foreground">
					{formatFileSize(selectedFile.file.size)}
				</p>
			</div>

			<!-- Remove button -->
			<button
				type="button"
				onclick={handleCancel}
				class="p-2 rounded-full hover:bg-destructive/10 transition-colors flex-shrink-0"
				title="Eliminar"
			>
				<X class="h-4 w-4 text-destructive" />
			</button>
		</div>

		<!-- Caption Input -->
		<div class="relative">
			<input
				type="text"
				bind:value={caption}
				placeholder="Agregar descripción (opcional)"
				class="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
			/>
		</div>

		<!-- Error Message -->
		{#if error}
			<div
				class="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg"
				transition:fade
			>
				{error}
			</div>
		{/if}

		<!-- Send Button -->
		<button
			type="button"
			onclick={handleSend}
			class="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all hover:scale-[1.02] font-medium"
		>
			<Send class="h-4 w-4" />
			<span>Enviar</span>
		</button>
	</div>
{/if}
