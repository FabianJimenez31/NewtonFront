<script lang="ts">
	import { cn } from '$lib/utils';
	import { Check, CheckCheck, Video as VideoIcon, Play, Loader2 } from 'lucide-svelte';
	import { scale, fade } from 'svelte/transition';

	interface Props {
		content?: string;
		fileUrl?: string;
		timestamp: string;
		sender: 'customer' | 'agent' | 'ai' | 'system';
		status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
	}

	let { content, fileUrl, timestamp, sender, status = 'sent' }: Props = $props();

	let isLoading = $state(true);
	let hasError = $state(false);
	let videoElement: HTMLVideoElement | undefined = $state();

	function handleVideoLoad() {
		isLoading = false;
		hasError = false;
	}

	function handleVideoError() {
		isLoading = false;
		hasError = true;
	}

	// Format time
	const formattedTime = $derived(
		new Date(timestamp).toLocaleTimeString('es-ES', {
			hour: '2-digit',
			minute: '2-digit',
		})
	);

	const isFromCustomer = $derived(sender === 'customer');

	// Status icons
	const statusIcons = {
		sending: Loader2,
		sent: Check,
		delivered: CheckCheck,
		read: CheckCheck,
		failed: null,
	};

	const StatusIcon = $derived(statusIcons[status]);
</script>

<div class="overflow-hidden max-w-sm">
	<!-- Sender indicator -->
	<div class="px-4 pt-3">
		{#if sender === 'customer'}
			<div class="flex items-center gap-1.5 mb-2 opacity-70">
				<div class="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
				<span class="text-[10px] font-medium uppercase tracking-wide">Cliente</span>
			</div>
		{:else if sender === 'agent'}
			<div class="flex items-center gap-1.5 mb-2 opacity-90">
				<div class="w-1.5 h-1.5 rounded-full bg-white"></div>
				<span class="text-[10px] font-semibold uppercase tracking-wide">Agente</span>
			</div>
		{:else if sender === 'ai'}
			<div class="flex items-center gap-1.5 mb-2 opacity-90">
				<div class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
				<span class="text-[10px] font-semibold uppercase tracking-wide">IA Asistente</span>
			</div>
		{/if}
	</div>

	<!-- Video Container -->
	<div class="relative rounded-lg overflow-hidden">
		{#if fileUrl && !hasError}
			<!-- Loading skeleton -->
			{#if isLoading}
				<div
					class="absolute inset-0 bg-muted/30 animate-pulse flex items-center justify-center z-10"
					transition:fade
				>
					<Loader2 class="h-8 w-8 opacity-50 animate-spin" />
				</div>
			{/if}

			<!-- Video element -->
			<video
				bind:this={videoElement}
				src={fileUrl}
				controls
				class={cn('w-full h-auto rounded-lg', isLoading && 'opacity-0')}
				onloadeddata={handleVideoLoad}
				onerror={handleVideoError}
				preload="metadata"
			>
				<track kind="captions" />
				Tu navegador no soporta la reproducción de video.
			</video>
		{:else}
			<!-- Error state -->
			<div class="flex items-center justify-center h-48 bg-muted/30 rounded-lg">
				<div class="flex flex-col items-center gap-2">
					<VideoIcon class="h-12 w-12 opacity-30" />
					<span class="text-xs opacity-50">No se pudo cargar el video</span>
				</div>
			</div>
		{/if}
	</div>

	<!-- Caption -->
	{#if content}
		<div class="px-4 py-2">
			<p class="text-sm leading-relaxed">{content}</p>
		</div>
	{/if}

	<!-- Time + Status -->
	<div class="px-4 pb-3 flex items-center justify-end gap-1">
		<span class="text-xs opacity-70">{formattedTime}</span>
		{#if !isFromCustomer && StatusIcon}
			<StatusIcon
				class={cn(
					'h-3 w-3',
					status === 'read' && 'text-blue-400',
					status === 'sending' && 'animate-spin'
				)}
			/>
		{/if}
	</div>
</div>
