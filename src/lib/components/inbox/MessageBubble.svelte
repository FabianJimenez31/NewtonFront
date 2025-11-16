<script lang="ts">
	import { cn } from '$lib/utils';
	import { Badge } from '$lib/components/ui';
	import { Download, FileText, Play, Pause, Image as ImageIcon, CheckCheck, Check } from 'lucide-svelte';

	interface Props {
		id: string;
		content: string;
		sender: 'customer' | 'agent' | 'system';
		timestamp: string;
		type?: 'text' | 'audio' | 'file' | 'image';
		fileUrl?: string;
		fileName?: string;
		isInternal?: boolean;
		status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
		class?: string;
	}

	let {
		id,
		content,
		sender,
		timestamp,
		type = 'text',
		fileUrl,
		fileName,
		isInternal = false,
		status = 'sent',
		class: className
	}: Props = $props();

	// Audio player state
	let isPlaying = $state(false);
	let audioElement: HTMLAudioElement | undefined = $state();

	function toggleAudio() {
		if (audioElement) {
			if (isPlaying) {
				audioElement.pause();
			} else {
				audioElement.play();
			}
			isPlaying = !isPlaying;
		}
	}

	// Format time
	const formattedTime = $derived(
		new Date(timestamp).toLocaleTimeString('es-ES', {
			hour: '2-digit',
			minute: '2-digit'
		})
	);

	// Message alignment and styling
	const isFromCustomer = $derived(sender === 'customer');
	const isSystem = $derived(sender === 'system');

	// Status icons
	const statusIcons = {
		sending: null,
		sent: Check,
		delivered: CheckCheck,
		read: CheckCheck,
		failed: null
	};

	const StatusIcon = $derived(statusIcons[status]);
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
		<div class="max-w-[70%] rounded-lg px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
			<div class="flex items-center gap-2 mb-1">
				<Badge variant="outline" class="text-xs">Nota interna</Badge>
			</div>
			<p class="text-sm text-foreground">{content}</p>
			<span class="text-xs text-muted-foreground mt-1 block">{formattedTime}</span>
		</div>
	</div>
{:else}
	<!-- Regular message -->
	<div class={cn('flex', isFromCustomer ? 'justify-start' : 'justify-end', className)}>
		<div
			class={cn(
				'max-w-[70%] rounded-lg overflow-hidden',
				isFromCustomer
					? 'bg-muted text-foreground'
					: 'bg-primary text-primary-foreground',
				status === 'failed' && 'bg-destructive/10 border border-destructive'
			)}
		>
			{#if type === 'text'}
				<!-- Text message -->
				<div class="px-4 py-2">
					<p class="text-sm whitespace-pre-wrap break-words">{content}</p>
					<div class="flex items-center justify-end gap-1 mt-1">
						<span class="text-xs opacity-70">{formattedTime}</span>
						{#if !isFromCustomer && StatusIcon}
							<StatusIcon class={cn(
								'h-3 w-3',
								status === 'read' && 'text-blue-400'
							)} />
						{/if}
					</div>
				</div>
			{:else if type === 'image'}
				<!-- Image message -->
				<div>
					{#if fileUrl}
						<img src={fileUrl} alt="Imagen" class="max-w-full h-auto" />
					{:else}
						<div class="flex items-center justify-center h-48 bg-muted">
							<ImageIcon class="h-12 w-12 text-muted-foreground" />
						</div>
					{/if}
					{#if content}
						<div class="px-4 py-2">
							<p class="text-sm">{content}</p>
						</div>
					{/if}
					<div class="px-4 py-2 flex items-center justify-end gap-1">
						<span class="text-xs opacity-70">{formattedTime}</span>
						{#if !isFromCustomer && StatusIcon}
							<StatusIcon class={cn(
								'h-3 w-3',
								status === 'read' && 'text-blue-400'
							)} />
						{/if}
					</div>
				</div>
			{:else if type === 'audio'}
				<!-- Audio message -->
				<div class="px-4 py-2 flex items-center gap-3 min-w-[200px]">
					<button
						onclick={toggleAudio}
						class="flex-shrink-0 w-8 h-8 rounded-full bg-background/20 hover:bg-background/30 flex items-center justify-center transition-colors"
					>
						{#if isPlaying}
							<Pause class="h-4 w-4" />
						{:else}
							<Play class="h-4 w-4 ml-0.5" />
						{/if}
					</button>
					{#if fileUrl}
						<audio bind:this={audioElement} src={fileUrl} onended={() => (isPlaying = false)}></audio>
					{/if}
					<div class="flex-1">
						<div class="h-1 bg-background/20 rounded-full overflow-hidden">
							<div class="h-full bg-background/40 rounded-full" style="width: 0%"></div>
						</div>
					</div>
					<div class="flex items-center gap-1">
						<span class="text-xs opacity-70">{formattedTime}</span>
						{#if !isFromCustomer && StatusIcon}
							<StatusIcon class={cn(
								'h-3 w-3',
								status === 'read' && 'text-blue-400'
							)} />
						{/if}
					</div>
				</div>
			{:else if type === 'file'}
				<!-- File message -->
				<div class="px-4 py-2">
					<div class="flex items-center gap-3">
						<div class="flex-shrink-0 w-10 h-10 rounded-lg bg-background/20 flex items-center justify-center">
							<FileText class="h-5 w-5" />
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium truncate">{fileName || 'Archivo adjunto'}</p>
							{#if content}
								<p class="text-xs opacity-70 truncate">{content}</p>
							{/if}
						</div>
						{#if fileUrl}
							<a
								href={fileUrl}
								download={fileName}
								class="flex-shrink-0 w-8 h-8 rounded-full bg-background/20 hover:bg-background/30 flex items-center justify-center transition-colors"
								title="Descargar archivo"
							>
								<Download class="h-4 w-4" />
							</a>
						{/if}
					</div>
					<div class="flex items-center justify-end gap-1 mt-2">
						<span class="text-xs opacity-70">{formattedTime}</span>
						{#if !isFromCustomer && StatusIcon}
							<StatusIcon class={cn(
								'h-3 w-3',
								status === 'read' && 'text-blue-400'
							)} />
						{/if}
					</div>
				</div>
			{/if}

			<!-- Failed status indicator -->
			{#if status === 'failed'}
				<div class="px-4 py-1 bg-destructive/10 border-t border-destructive">
					<p class="text-xs text-destructive">No se pudo enviar el mensaje</p>
				</div>
			{/if}
		</div>
	</div>
{/if}
