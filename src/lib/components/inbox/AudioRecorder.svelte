<script lang="ts">
	import { cn } from '$lib/utils';
	import { Mic, Square, Send, X } from 'lucide-svelte';
	import { blobToBase64, formatAudioDuration } from '$lib/utils/media.utils';
	import { fade, scale } from 'svelte/transition';

	interface Props {
		onSend: (audioBase64: string, duration: number) => void;
		onCancel?: () => void;
		class?: string;
	}

	let { onSend, onCancel, class: className }: Props = $props();

	let isRecording = $state(false);
	let isPaused = $state(false);
	let duration = $state(0);
	let mediaRecorder: MediaRecorder | null = $state(null);
	let audioChunks: Blob[] = $state([]);
	let recordingInterval: ReturnType<typeof setInterval> | null = $state(null);
	let stream: MediaStream | null = $state(null);
	let audioBlob: Blob | null = $state(null);
	let audioUrl: string | null = $state(null);
	let waveformBars = $state<number[]>([]);

	// Animated waveform
	$effect(() => {
		if (isRecording && !isPaused) {
			const interval = setInterval(() => {
				waveformBars = Array(20)
					.fill(0)
					.map(() => Math.random() * 100);
			}, 100);
			return () => clearInterval(interval);
		}
	});

	async function startRecording() {
		try {
			// Debug: Log navigator info
			console.log('[AudioRecorder] navigator.mediaDevices:', navigator.mediaDevices);
			console.log('[AudioRecorder] window.isSecureContext:', window.isSecureContext);
			console.log('[AudioRecorder] location.protocol:', window.location.protocol);

			// Check if browser supports media devices
			if (!navigator.mediaDevices) {
				console.error('[AudioRecorder] navigator.mediaDevices is undefined');

				// Check if it's a security context issue
				if (!window.isSecureContext) {
					throw new Error(
						'La grabación de audio requiere HTTPS o localhost. ' +
						'URL actual: ' + window.location.protocol + '//' + window.location.host
					);
				}

				throw new Error('Tu navegador no soporta grabación de audio. Usa Chrome, Firefox o Edge.');
			}

			if (!navigator.mediaDevices.getUserMedia) {
				throw new Error('getUserMedia no está disponible en este navegador.');
			}

			stream = await navigator.mediaDevices.getUserMedia({ audio: true });

			// Check supported MIME types
			let mimeType = 'audio/webm;codecs=opus';
			if (!MediaRecorder.isTypeSupported(mimeType)) {
				mimeType = 'audio/webm';
				if (!MediaRecorder.isTypeSupported(mimeType)) {
					mimeType = 'audio/ogg;codecs=opus';
					if (!MediaRecorder.isTypeSupported(mimeType)) {
						mimeType = ''; // Let browser choose
					}
				}
			}

			const options = mimeType ? { mimeType } : {};
			mediaRecorder = new MediaRecorder(stream, options);

			audioChunks = [];

			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					audioChunks.push(event.data);
				}
			};

			mediaRecorder.onstop = async () => {
				const blobType = mediaRecorder?.mimeType || 'audio/webm';
				audioBlob = new Blob(audioChunks, { type: blobType });
				audioUrl = URL.createObjectURL(audioBlob);
				stopTimer();
			};

			mediaRecorder.start();
			isRecording = true;
			startTimer();
		} catch (error) {
			console.error('Error accessing microphone:', error);
			let errorMessage = 'No se pudo acceder al micrófono.';

			if (error instanceof Error) {
				if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
					errorMessage = 'Permiso denegado. Por favor permite el acceso al micrófono en tu navegador.';
				} else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
					errorMessage = 'No se encontró micrófono. Conecta un micrófono e intenta de nuevo.';
				} else if (error.name === 'NotReadableError') {
					errorMessage = 'El micrófono ya está en uso por otra aplicación.';
				} else {
					errorMessage = error.message;
				}
			}

			alert(errorMessage);
		}
	}

	function stopRecording() {
		if (mediaRecorder && mediaRecorder.state !== 'inactive') {
			mediaRecorder.stop();
			isRecording = false;
		}
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
			stream = null;
		}
	}

	function startTimer() {
		duration = 0;
		recordingInterval = setInterval(() => {
			duration++;
		}, 1000);
	}

	function stopTimer() {
		if (recordingInterval) {
			clearInterval(recordingInterval);
			recordingInterval = null;
		}
	}

	async function handleSend() {
		if (!audioBlob) return;

		try {
			const base64 = await blobToBase64(audioBlob);
			onSend(base64, duration);
			handleCancel();
		} catch (error) {
			console.error('Error sending audio:', error);
			alert('Error al enviar el audio');
		}
	}

	function handleCancel() {
		stopRecording();
		duration = 0;
		audioChunks = [];
		audioBlob = null;
		if (audioUrl) {
			URL.revokeObjectURL(audioUrl);
			audioUrl = null;
		}
		waveformBars = [];
		onCancel?.();
	}

	function toggleRecording() {
		if (isRecording) {
			stopRecording();
		} else {
			startRecording();
		}
	}
</script>

{#if !isRecording && !audioBlob}
	<!-- Record Button -->
	<button
		type="button"
		onclick={startRecording}
		class={cn(
			'flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:scale-110',
			'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg',
			className
		)}
		title="Grabar audio"
	>
		<Mic class="h-5 w-5" />
	</button>
{:else if isRecording}
	<!-- Recording UI -->
	<div
		class="flex items-center gap-3 px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 min-w-[300px]"
		transition:scale
	>
		<!-- Recording indicator -->
		<div class="flex items-center gap-2">
			<div class="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
			<span class="text-sm font-medium text-red-700 dark:text-red-400">
				{formatAudioDuration(duration)}
			</span>
		</div>

		<!-- Waveform visualization -->
		<div class="flex items-center gap-0.5 h-8 flex-1">
			{#each waveformBars as height, i}
				<div
					class="w-1 bg-red-500/60 rounded-full transition-all duration-100"
					style="height: {Math.max(height, 20)}%"
				></div>
			{/each}
		</div>

		<!-- Actions -->
		<div class="flex items-center gap-1">
			<button
				type="button"
				onclick={handleCancel}
				class="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
				title="Cancelar"
			>
				<X class="h-4 w-4 text-red-600 dark:text-red-400" />
			</button>
			<button
				type="button"
				onclick={stopRecording}
				class="p-2 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
				title="Detener"
			>
				<Square class="h-4 w-4 text-white fill-white" />
			</button>
		</div>
	</div>
{:else if audioBlob && audioUrl}
	<!-- Preview and Send UI -->
	<div
		class="flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-xl border border-primary/20 min-w-[300px]"
		transition:scale
	>
		<!-- Audio player -->
		<audio src={audioUrl} controls class="flex-1 h-8">
			<track kind="captions" />
		</audio>

		<!-- Duration -->
		<span class="text-sm font-medium text-primary">
			{formatAudioDuration(duration)}
		</span>

		<!-- Actions -->
		<div class="flex items-center gap-1">
			<button
				type="button"
				onclick={handleCancel}
				class="p-2 rounded-full hover:bg-primary/10 transition-colors"
				title="Descartar"
			>
				<X class="h-4 w-4 text-primary" />
			</button>
			<button
				type="button"
				onclick={handleSend}
				class="p-2 rounded-full bg-primary hover:bg-primary/90 transition-all hover:scale-105"
				title="Enviar audio"
			>
				<Send class="h-4 w-4 text-primary-foreground" />
			</button>
		</div>
	</div>
{/if}
