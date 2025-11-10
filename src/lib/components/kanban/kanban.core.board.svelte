<!-- @core -->
<script lang="ts">
	/**
	 * Kanban Core Board - Newton CRM
	 * Business-critical component for main kanban board display
	 */

	import type { Stage, LeadKanban, KanbanFilters } from '$lib/types/kanban';
	import { authStore } from '$lib/stores/auth.store';
	import { kanbanStore, visibleStages } from '$lib/stores/kanban.core.store';
	import { validateTransition } from '$lib/services/kanban.core.service';
	import KanbanColumn from './kanban.core.column.svelte';
	import { Button, Badge } from '$lib/components/ui';
	import { RefreshCw, Filter, Settings, AlertCircle } from 'lucide-svelte';
	import { onMount, onDestroy } from 'svelte';

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
	let draggedLeadId = $state<string | null>(null);
	let draggedFromStage = $state<string | null>(null);

	onMount(async () => {
		console.log('[KANBAN BOARD] Mounting, auth state:', {
			isAuthenticated: $authStore.isAuthenticated,
			hasToken: !!$authStore.token
		});

		if (!$authStore.token) {
			console.error('[KANBAN BOARD] No token available, cannot load board');
			return;
		}

		try {
			console.log('[KANBAN BOARD] Loading config and board data...');
			await kanbanStore.loadConfig($authStore.token);
			await kanbanStore.loadBoard($authStore.token, filters);
			console.log('[KANBAN BOARD] Data loaded successfully');

			if (autoRefresh) {
				kanbanStore.startAutoRefresh($authStore.token);
			}
		} catch (err) {
			console.error('[KANBAN BOARD] Error loading data:', err);
			error = err instanceof Error ? err.message : 'Error al cargar tablero';
		}
	});

	onDestroy(() => {
		kanbanStore.stopAutoRefresh();
	});

	/**
	 * Get leads for a specific stage
	 */
	function getLeadsForStage(stageId: string): LeadKanban[] {
		if (!$kanbanStore.boardData?.stages) return [];
		return $kanbanStore.boardData.stages[stageId] || [];
	}

	/**
	 * Handle manual refresh
	 */
	async function handleRefresh() {
		if (!$authStore.token || isRefreshing) return;

		isRefreshing = true;
		error = null;

		try {
			await kanbanStore.loadBoard($authStore.token, filters);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error al refrescar';
		} finally {
			isRefreshing = false;
		}
	}

	/**
	 * Handle lead drop on stage
	 */
	async function handleDrop(stageId: string, leadId: string) {
		if (!$authStore.token || !draggedFromStage) {
			error = 'Error: no hay información de origen';
			return;
		}

		if (draggedFromStage === stageId) {
			// Same stage, no action needed
			resetDragState();
			return;
		}

		try {
			// Validate transition
			const validation = await validateTransition($authStore.token, {
				lead_id: leadId,
				from_stage: draggedFromStage,
				to_stage: stageId
			});

			if (!validation.is_valid) {
				error = validation.message || 'Transición no permitida';
				resetDragState();
				return;
			}

			// Move lead
			await kanbanStore.moveLeadToStage($authStore.token, leadId, stageId);
			error = null;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error al mover lead';
		} finally {
			resetDragState();
		}
	}

	/**
	 * Reset drag state
	 */
	function resetDragState() {
		draggedLeadId = null;
		draggedFromStage = null;
	}

	/**
	 * Calculate total leads count
	 */
	let totalLeads = $derived(
		$visibleStages.reduce((sum, stage) => sum + getLeadsForStage(stage.id).length, 0)
	);

	/**
	 * Calculate total unread count
	 */
	let totalUnread = $derived(
		$visibleStages.reduce((sum, stage) => {
			const leads = getLeadsForStage(stage.id);
			return sum + leads.reduce((s, l) => s + (l.unread_count || 0), 0);
		}, 0)
	);
</script>

<div class="flex flex-col h-full {className}">
	<!-- Header -->
	<div class="flex-shrink-0 border-b border-border bg-background p-4">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-4">
				<div>
					<h1 class="text-2xl font-bold text-foreground">Pipeline de Ventas</h1>
					<p class="text-sm text-muted-foreground mt-1">
						{totalLeads} conversaciones · {totalUnread} sin leer
					</p>
				</div>
			</div>

			<div class="flex items-center gap-2">
				<Button
					variant="ghost"
					size="icon"
					onclick={handleRefresh}
					disabled={isRefreshing}
				>
					<RefreshCw class={isRefreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
				</Button>

				{#if onConfigureClick}
					<Button variant="ghost" size="icon" onclick={onConfigureClick}>
						<Settings class="h-4 w-4" />
					</Button>
				{/if}
			</div>
		</div>

		<!-- Error message -->
		{#if error}
			<div class="mt-3 rounded-lg border-2 border-red-300 bg-red-50 p-6">
				<div class="flex items-start gap-3">
					<div class="text-red-500">
						<AlertCircle class="h-6 w-6" />
					</div>
					<div class="flex-1">
						<h3 class="text-lg font-semibold text-red-800">Error al cargar tablero</h3>
						<p class="text-sm text-red-700 mt-1">{error}</p>
						<button
							class="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							onclick={handleRefresh}
							disabled={isRefreshing}
						>
							{isRefreshing ? 'Recargando...' : 'Reintentar'}
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Board Content -->
	<div class="flex-1 overflow-x-auto overflow-y-hidden">
		{#if $kanbanStore.isLoadingBoard}
			<!-- Loading state -->
			<div class="flex items-center justify-center h-full">
				<div class="text-center">
					<div class="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
					<p class="mt-4 text-sm text-muted-foreground">Cargando tablero...</p>
				</div>
			</div>
		{:else if $visibleStages.length === 0}
			<!-- Empty state -->
			<div class="flex flex-col items-center justify-center h-full">
				<div class="text-center max-w-md">
					<h3 class="text-lg font-semibold text-foreground">No hay etapas configuradas</h3>
					<p class="mt-2 text-sm text-muted-foreground">
						Ve a Configuración para crear tu pipeline de ventas
					</p>

					{#if onConfigureClick}
						<Button class="mt-6" onclick={onConfigureClick}>
							<Settings class="mr-2 h-4 w-4" />
							Ir a Configuración
						</Button>
					{/if}
				</div>
			</div>
		{:else}
			<!-- Kanban columns -->
			<div class="flex gap-4 p-4 h-full">
				{#each $visibleStages as stage (stage.id)}
					<KanbanColumn
						{stage}
						leads={getLeadsForStage(stage.id)}
						{onLeadClick}
						onDrop={(leadId) => handleDrop(stage.id, leadId)}
					/>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Last update indicator -->
	{#if $kanbanStore.lastUpdate}
		<div class="flex-shrink-0 border-t border-border bg-muted/50 px-4 py-2 text-xs text-muted-foreground text-center">
			Última actualización: {new Date($kanbanStore.lastUpdate).toLocaleTimeString('es-ES')}
		</div>
	{/if}
</div>

<style>
	/* Smooth scroll for horizontal overflow */
	.overflow-x-auto {
		scroll-behavior: smooth;
	}

	/* Custom scrollbar for horizontal scroll */
	.overflow-x-auto::-webkit-scrollbar {
		height: 8px;
	}

	.overflow-x-auto::-webkit-scrollbar-track {
		background: hsl(var(--muted));
	}

	.overflow-x-auto::-webkit-scrollbar-thumb {
		background: hsl(var(--border));
		border-radius: 4px;
	}

	.overflow-x-auto::-webkit-scrollbar-thumb:hover {
		background: hsl(var(--muted-foreground));
	}
</style>
