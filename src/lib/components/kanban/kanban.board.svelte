<!-- Kanban Board Wrapper with Global Fields -->
<script lang="ts">
	/**
	 * Kanban Board - Newton CRM
	 * Main board component using global columns and unified cards
	 * This wrapper allows us to use the new unified cards without modifying core files
	 */

	import type { LeadKanban, KanbanFilters } from '$lib/types/kanban';
	import { authStore } from '$lib/stores/auth.store';
	import { kanbanStore, visibleStages } from '$lib/stores/kanban.core.store';
	import { validateTransition } from '$lib/services/kanban.core.service';
	import { moveLeadToStage } from '$lib/services/kanban-proxy.service';
	import KanbanColumn from './kanban.global.column.svelte';
	import BoardHeader from './BoardHeader.svelte';
	import BoardEmptyState from './BoardEmptyState.svelte';
	import { Button } from '$lib/components/ui';
	import { RefreshCw, AlertCircle } from 'lucide-svelte';
	import { onMount, onDestroy } from 'svelte';
	import { calculatePipelineMetrics } from '$lib/composables/usePipelineMetrics';

	interface Props {
		onLeadClick?: (lead: LeadKanban) => void;
		onConfigureClick?: () => void;
		filters?: KanbanFilters;
		autoRefresh?: boolean;
		class?: string;
	}

	let {
		onLeadClick,
		onConfigureClick,
		filters = {},
		autoRefresh = true,
		class: className = ''
	}: Props = $props();

	let isRefreshing = $state(false);
	let error = $state<string | null>(null);
	let hasLoadedBoard = $state(false);

	$effect(() => {
		if ($kanbanStore.boardData) {
			hasLoadedBoard = true;
		}
	});

	const isInitialLoading = $derived(
		!hasLoadedBoard &&
			!error &&
			(!$kanbanStore.boardData ||
				$kanbanStore.isLoading ||
				$kanbanStore.isLoadingBoard)
	);

	const showBoardLoader = $derived(
		hasLoadedBoard &&
			!error &&
			$kanbanStore.isLoadingBoard &&
			!!$kanbanStore.boardData
	);

	// Calculate pipeline metrics using composable
	const pipelineMetrics = $derived(calculatePipelineMetrics($kanbanStore.boardData));

	onMount(async () => {
		console.log('[KANBAN BOARD] Mounting, auth state:', {
			isAuthenticated: $authStore.isAuthenticated,
			hasToken: !!$authStore.token
		});

		if (!$authStore.token) {
			console.error('[KANBAN BOARD] No token available, cannot load board');
			error = 'No se encontró token de autenticación';
			return;
		}

		try {
			console.log('[KANBAN BOARD] Loading config and board data...');
			await kanbanStore.loadConfig($authStore.token!);

			// Log config loaded
			console.log('[KANBAN BOARD] Config loaded:', {
				stageCount: $kanbanStore.stages.length,
				stages: $kanbanStore.stages.map(s => ({ id: s.id, name: s.name, visible: s.is_visible }))
			});

			await loadBoard();

			if (autoRefresh) {
				console.log('[KANBAN BOARD] Starting auto-refresh (30s interval)');
				kanbanStore.startAutoRefresh($authStore.token!);
			}
		} catch (err) {
			console.error('[KANBAN BOARD] Error during mount:', err);
			error = err instanceof Error ? err.message : 'Failed to initialize board';
		}
	});

	onDestroy(() => {
		if (autoRefresh) {
			kanbanStore.stopAutoRefresh();
		}
	});

	async function loadBoard() {
		try {
			isRefreshing = true;
			error = null;
			console.log('[KANBAN BOARD] Starting loadBoard with filters:', filters);
			await kanbanStore.loadBoard($authStore.token!, filters);

			// Log the loaded data
			console.log('[KANBAN BOARD] Board data loaded:', {
				hasData: !!$kanbanStore.boardData,
				stageCount: $kanbanStore.boardData ? Object.keys($kanbanStore.boardData.stages).length : 0,
				stages: $kanbanStore.boardData ? Object.keys($kanbanStore.boardData.stages) : [],
				visibleStages: $visibleStages.map(s => ({ id: s.id, name: s.name }))
			});
		} catch (err) {
			console.error('[KANBAN BOARD] Error loading board:', err);
			error = err instanceof Error ? err.message : 'Failed to load board data';
		} finally {
			isRefreshing = false;
		}
	}

	async function handleRefresh() {
		if (isRefreshing) return;
		await loadBoard();
	}

	async function handleDrop(lead: LeadKanban, targetStageId: string) {
		try {
			// Validate the transition
			const validation = await validateTransition(
				$authStore.token!,
				{
					lead_id: lead.id,
					from_stage: lead.stage,
					to_stage: targetStageId
				}
			);

			if (!validation.is_valid) {
				console.error('[KANBAN BOARD] Invalid transition:', validation.message);
				error = validation.message || 'Invalid stage transition';
				return;
			}

			// Move the lead - use the service directly
			await moveLeadToStage($authStore.token!, lead.id, { stage: targetStageId });

			// Refresh the board
			await loadBoard();
		} catch (err) {
			console.error('[KANBAN BOARD] Error handling drop:', err);
			error = err instanceof Error ? err.message : 'Failed to move lead';
		}
	}
</script>

<div class="flex flex-col h-full px-3 sm:px-6 pb-4 {className}">
	<!-- Board Header -->
	<BoardHeader
		metrics={pipelineMetrics}
		{isRefreshing}
		onRefresh={handleRefresh}
		{onConfigureClick}
	/>

	<!-- Error Display -->
	{#if error}
		<div class="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-4">
			<div class="flex items-start gap-2">
				<AlertCircle class="h-5 w-5 mt-0.5 flex-shrink-0" />
				<div class="flex-1">
					<p class="font-semibold text-sm mb-1">Error al cargar el pipeline</p>
					<p class="text-sm opacity-90">{error}</p>
					<div class="mt-2 flex gap-2 flex-wrap">
						<Button
							variant="ghost"
							size="sm"
							onclick={handleRefresh}
							disabled={isRefreshing}
							class="border border-border"
						>
							<RefreshCw class="h-3 w-3 mr-1 {isRefreshing ? 'animate-spin' : ''}" />
							Reintentar
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onclick={() => window.location.reload()}
							class="border border-border"
						>
							Recargar página
						</Button>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Loading State -->
	{#if isInitialLoading}
		<!-- Skeleton placeholder while loading -->
		<div class="flex gap-4 overflow-x-auto pb-2">
				{#each Array(3) as _, idx}
					<div
						class="min-w-[320px] max-w-[360px] rounded-2xl border border-border bg-card/60 p-4 space-y-4 animate-pulse"
						aria-label={`Cargando columna ${idx + 1}`}
					>
						<div class="h-6 rounded-md bg-muted"></div>
						<div class="space-y-3">
							{#each Array(3) as __}
								<div class="h-20 rounded-lg bg-muted/70"></div>
							{/each}
						</div>
					</div>
				{/each}
		</div>
	{:else if !$kanbanStore.boardData || Object.keys($kanbanStore.boardData.stages).length === 0}
		<!-- Empty State -->
		<BoardEmptyState onRefresh={handleRefresh} />
	{:else}
		<!-- Kanban Columns -->
		<div class="relative flex-1 overflow-x-auto">
			{#if showBoardLoader}
				<div class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background/70 backdrop-blur-sm">
					<div class="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
					<p class="text-sm text-muted-foreground">Actualizando tablero…</p>
				</div>
			{/if}
			<div class="flex gap-4 h-full pb-4 min-w-min pr-2 sm:pr-4 pl-1 sm:pl-2">
				{#each $visibleStages as stage (stage.id)}
					{@const leads = $kanbanStore.boardData.stages[stage.id] || []}
					<KanbanColumn
						{stage}
						{leads}
						{onLeadClick}
						onDrop={handleDrop}
						class="w-[350px]"
					/>
				{/each}
			</div>
		</div>
	{/if}
</div>
