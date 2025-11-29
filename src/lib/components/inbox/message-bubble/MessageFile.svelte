<script lang="ts">
	import { cn } from '$lib/utils';
	import { Check, CheckCheck, FileText, Download, Eye, Loader2 } from 'lucide-svelte';
	import { formatFileSize } from '$lib/utils/media.utils';

	interface Props {
		content?: string;
		fileUrl?: string;
		fileName?: string;
		timestamp: string;
		sender: 'customer' | 'agent' | 'ai' | 'system';
		status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
	}

	let { content, fileUrl, fileName, timestamp, sender, status = 'sent' }: Props = $props();

	const isPDF = $derived(fileName?.toLowerCase().endsWith('.pdf') || false);

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

	function handlePreview() {
		if (fileUrl && isPDF) {
			window.open(fileUrl, '_blank');
		}
	}
</script>

<div class="px-4 py-3">
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

	<div class="flex items-center gap-3 min-w-[250px]">
		<!-- File icon -->
		<div
			class={cn(
				'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
				isPDF
					? 'bg-red-500/20 text-red-600 dark:text-red-400'
					: 'bg-background/20'
			)}
		>
			<FileText class="h-6 w-6" />
		</div>

		<!-- File info -->
		<div class="flex-1 min-w-0">
			<p class="text-sm font-semibold truncate">
				{fileName || 'Archivo adjunto'}
			</p>
			{#if content}
				<p class="text-xs opacity-70 truncate mt-0.5">{content}</p>
			{/if}
			{#if isPDF}
				<span class="text-xs opacity-60 mt-1 block">PDF</span>
			{/if}
		</div>

		<!-- Actions -->
		<div class="flex items-center gap-1 flex-shrink-0">
			{#if isPDF && fileUrl}
				<button
					type="button"
					onclick={handlePreview}
					class="p-2 rounded-full bg-background/20 hover:bg-background/30 transition-all hover:scale-105"
					title="Ver PDF"
				>
					<Eye class="h-4 w-4" />
				</button>
			{/if}
			{#if fileUrl}
				<a
					href={fileUrl}
					download={fileName}
					class="p-2 rounded-full bg-background/20 hover:bg-background/30 transition-all hover:scale-105 inline-flex"
					title="Descargar archivo"
				>
					<Download class="h-4 w-4" />
				</a>
			{/if}
		</div>
	</div>

	<!-- Time + Status -->
	<div class="flex items-center justify-end gap-1 mt-2">
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
