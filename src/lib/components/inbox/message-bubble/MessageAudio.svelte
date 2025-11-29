<script lang="ts">
	import { cn } from '$lib/utils';
	import { Check, CheckCheck, Play, Pause, Loader2 } from 'lucide-svelte';
	import { formatAudioDuration } from '$lib/utils/media.utils';

	interface Props {
		fileUrl?: string;
		timestamp: string;
		sender: 'customer' | 'agent' | 'ai' | 'system';
		status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
	}

	let { fileUrl, timestamp, sender, status = 'sent' }: Props = $props();

	// Audio player state
	let isPlaying = $state(false);
	let isLoading = $state(false);
	let currentTime = $state(0);
	let duration = $state(0);
	let audioElement: HTMLAudioElement | undefined = $state();
	let waveformBars = $state<number[]>(Array(30).fill(50));

	// Simulated waveform animation
	$effect(() => {
		if (isPlaying) {
			const interval = setInterval(() => {
				waveformBars = waveformBars.map((_, i) => {
					const progress = currentTime / (duration || 1);
					const barProgress = i / waveformBars.length;
					if (barProgress < progress) {
						return 80 + Math.random() * 20;
					}
					return 30 + Math.random() * 20;
				});
			}, 100);
			return () => clearInterval(interval);
		}
	});

	function toggleAudio() {
		if (!audioElement) return;

		if (isPlaying) {
			audioElement.pause();
		} else {
			audioElement.play();
		}
	}

	function handlePlay() {
		isPlaying = true;
		isLoading = false;
	}

	function handlePause() {
		isPlaying = false;
	}

	function handleTimeUpdate() {
		if (audioElement) {
			currentTime = audioElement.currentTime;
		}
	}

	function handleLoadedMetadata() {
		if (audioElement) {
			duration = audioElement.duration;
		}
		isLoading = false;
	}

	function handleEnded() {
		isPlaying = false;
		currentTime = 0;
	}

	function handleLoadStart() {
		isLoading = true;
	}

	function handleSeek(event: MouseEvent) {
		if (!audioElement) return;
		const target = event.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const percentage = x / rect.width;
		audioElement.currentTime = percentage * duration;
	}

	// Format time
	const formattedTime = $derived(
		new Date(timestamp).toLocaleTimeString('es-ES', {
			hour: '2-digit',
			minute: '2-digit',
		})
	);

	const formattedCurrentTime = $derived(formatAudioDuration(currentTime));
	const formattedDuration = $derived(formatAudioDuration(duration));
	const progress = $derived((currentTime / duration) * 100 || 0);

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

<div class="px-4 py-3 min-w-[280px]">
	<!-- Sender indicator -->
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

	<div class="flex flex-col gap-2">
		<!-- Play/Pause Button + Waveform -->
		<div class="flex items-center gap-3">
			<button
				onclick={toggleAudio}
				disabled={!fileUrl || isLoading}
				class={cn(
					'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all',
					'bg-background/20 hover:bg-background/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
				)}
			>
				{#if isLoading}
					<Loader2 class="h-5 w-5 animate-spin" />
				{:else if isPlaying}
					<Pause class="h-5 w-5" />
				{:else}
					<Play class="h-5 w-5 ml-0.5" />
				{/if}
			</button>

			<!-- Waveform visualization (clickable) -->
			<button
				onclick={handleSeek}
				class="flex-1 flex items-center gap-px h-10 cursor-pointer"
				disabled={!fileUrl || isLoading}
			>
				{#each waveformBars as height, i}
					{@const barProgress = (i / waveformBars.length) * 100}
					<div
						class={cn(
							'flex-1 rounded-full transition-all duration-150',
							barProgress < progress
								? 'bg-background/80'
								: 'bg-background/30'
						)}
						style="height: {Math.max(height / 2, 20)}%"
					></div>
				{/each}
			</button>
		</div>

		<!-- Progress bar -->
		<div class="relative h-1 bg-background/20 rounded-full overflow-hidden">
			<div
				class="absolute left-0 top-0 h-full bg-background/60 rounded-full transition-all duration-100"
				style="width: {progress}%"
			></div>
		</div>

		<!-- Time + Status -->
		<div class="flex items-center justify-between">
			<span class="text-xs opacity-70">
				{formattedCurrentTime}
				{#if duration > 0}
					/ {formattedDuration}
				{/if}
			</span>
			<div class="flex items-center gap-1">
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
	</div>

	<!-- Hidden audio element -->
	{#if fileUrl}
		<audio
			bind:this={audioElement}
			src={fileUrl}
			onplay={handlePlay}
			onpause={handlePause}
			ontimeupdate={handleTimeUpdate}
			onloadedmetadata={handleLoadedMetadata}
			onended={handleEnded}
			onloadstart={handleLoadStart}
			class="hidden"
		>
			<track kind="captions" />
		</audio>
	{/if}
</div>
