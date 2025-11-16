<script lang="ts">
	import { cn } from '$lib/utils';
	import { Button, Badge, Textarea, Label } from '$lib/components/ui';
	import { Sparkles, Play, Pause, Ban } from 'lucide-svelte';

	interface Props {
		leadId: string;
		aiEnabled: boolean;
		aiPaused?: boolean;
		pauseReason?: string;
		onToggle?: (enabled: boolean, reason?: string) => Promise<void>;
		onPause?: (reason: string) => Promise<void>;
		onResume?: () => Promise<void>;
		class?: string;
	}

	let {
		leadId,
		aiEnabled,
		aiPaused = false,
		pauseReason = '',
		onToggle,
		onPause,
		onResume,
		class: className
	}: Props = $props();

	let isProcessing = $state(false);
	let showPauseDialog = $state(false);
	let pauseReasonInput = $state('');

	async function handleToggle() {
		if (isProcessing) return;

		isProcessing = true;
		try {
			await onToggle?.(!aiEnabled);
		} catch (err) {
			console.error('Failed to toggle AI:', err);
		} finally {
			isProcessing = false;
		}
	}

	async function handlePause() {
		if (!pauseReasonInput.trim()) return;

		isProcessing = true;
		try {
			await onPause?.(pauseReasonInput);
			showPauseDialog = false;
			pauseReasonInput = '';
		} catch (err) {
			console.error('Failed to pause AI:', err);
		} finally {
			isProcessing = false;
		}
	}

	async function handleResume() {
		isProcessing = true;
		try {
			await onResume?.();
		} catch (err) {
			console.error('Failed to resume AI:', err);
		} finally {
			isProcessing = false;
		}
	}

	const statusColor = $derived.by(() => {
		if (!aiEnabled) return 'text-muted-foreground';
		if (aiPaused) return 'text-yellow-600';
		return 'text-green-600';
	});

	const statusLabel = $derived.by(() => {
		if (!aiEnabled) return 'Desactivado';
		if (aiPaused) return 'Pausado';
		return 'Activo';
	});
</script>

<div class={cn('space-y-3', className)}>
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<Sparkles class={cn('h-4 w-4', statusColor)} />
			<h3 class="text-sm font-semibold text-foreground">IA Automatizada</h3>
		</div>
		<Badge variant={aiEnabled && !aiPaused ? 'default' : 'secondary'}>
			{statusLabel}
		</Badge>
	</div>

	<!-- AI Status Info -->
	<div class="text-xs text-muted-foreground">
		{#if !aiEnabled}
			<p>La IA está desactivada para este lead. Actívala para automatizar respuestas.</p>
		{:else if aiPaused}
			<p>La IA está pausada temporalmente.</p>
			{#if pauseReason}
				<p class="mt-1 text-yellow-600">Razón: {pauseReason}</p>
			{/if}
		{:else}
			<p>La IA está respondiendo automáticamente a los mensajes de este contacto.</p>
		{/if}
	</div>

	<!-- Controls -->
	<div class="space-y-2">
		{#if !aiEnabled}
			<!-- Enable AI -->
			<Button
				size="sm"
				class="w-full"
				onclick={handleToggle}
				disabled={isProcessing}
			>
				<Sparkles class="h-4 w-4 mr-2" />
				{isProcessing ? 'Activando...' : 'Activar IA'}
			</Button>
		{:else if aiPaused}
			<!-- Resume AI -->
			<Button
				size="sm"
				class="w-full"
				onclick={handleResume}
				disabled={isProcessing}
			>
				<Play class="h-4 w-4 mr-2" />
				{isProcessing ? 'Reanudando...' : 'Reanudar IA'}
			</Button>
			<!-- Disable AI -->
			<Button
				size="sm"
				variant="outline"
				class="w-full"
				onclick={handleToggle}
				disabled={isProcessing}
			>
				<Ban class="h-4 w-4 mr-2" />
				Desactivar IA
			</Button>
		{:else}
			<!-- Pause AI -->
			{#if !showPauseDialog}
				<Button
					size="sm"
					variant="outline"
					class="w-full"
					onclick={() => (showPauseDialog = true)}
				>
					<Pause class="h-4 w-4 mr-2" />
					Pausar IA
				</Button>
				<!-- Disable AI -->
				<Button
					size="sm"
					variant="outline"
					class="w-full"
					onclick={handleToggle}
					disabled={isProcessing}
				>
					<Ban class="h-4 w-4 mr-2" />
					Desactivar IA
				</Button>
			{:else}
				<!-- Pause Dialog -->
				<div class="p-3 border border-border rounded-lg bg-muted/30 space-y-2">
					<Label class="text-xs">¿Por qué pausas la IA?</Label>
					<Textarea
						bind:value={pauseReasonInput}
						placeholder="Ej: Cliente pidió hablar con humano"
						rows={2}
						class="text-sm"
					/>
					<div class="flex gap-2">
						<Button
							size="sm"
							onclick={handlePause}
							disabled={!pauseReasonInput.trim() || isProcessing}
							class="flex-1"
						>
							{isProcessing ? 'Pausando...' : 'Pausar'}
						</Button>
						<Button
							size="sm"
							variant="ghost"
							onclick={() => {
								showPauseDialog = false;
								pauseReasonInput = '';
							}}
						>
							Cancelar
						</Button>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>
