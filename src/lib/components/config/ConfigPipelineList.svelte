<script lang="ts">
	import type { Stage } from '$lib/types/kanban';
	import { authStore } from '$lib/stores/auth.store';
	import { kanbanStore } from '$lib/stores/kanban.core.store';
	import { Button, Badge, Dialog } from '$lib/components/ui';
	import { Pencil, Trash2, GripVertical, Plus } from 'lucide-svelte';
	import ConfigStageForm from './ConfigStageForm.svelte';

	interface Props {
		stages: Stage[];
		isLoading: boolean;
		showCreateForm: boolean;
	}

	let {
		stages = $bindable([]),
		isLoading = false,
		showCreateForm = $bindable(false)
	}: Props = $props();

	let editingStage = $state<Stage | null>(null);
	let showDeleteDialog = $state(false);
	let stageToDelete = $state<Stage | null>(null);
	let deleteError = $state<string | null>(null);

	function handleEdit(stage: Stage) {
		editingStage = stage;
	}

	function handleDeleteClick(stage: Stage) {
		stageToDelete = stage;
		showDeleteDialog = true;
		deleteError = null;
	}

	async function confirmDelete() {
		if (!stageToDelete || !$authStore.token) return;

		try {
			await kanbanStore.deleteStage($authStore.token, stageToDelete.id);
			showDeleteDialog = false;
			stageToDelete = null;
			deleteError = null;
		} catch (error) {
			deleteError = error instanceof Error ? error.message : 'Error al eliminar etapa';
		}
	}

	function cancelDelete() {
		showDeleteDialog = false;
		stageToDelete = null;
		deleteError = null;
	}
</script>

<div class="space-y-4">
	<!-- Stages grid -->
	<div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
		{#each stages as stage (stage.id)}
			<div
				class="rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow"
			>
				<!-- Stage header -->
				<div class="flex items-start justify-between gap-2">
					<div class="flex items-start gap-2 flex-1">
						<GripVertical class="h-5 w-5 text-muted-foreground cursor-move flex-shrink-0 mt-0.5" />
						<div class="flex-1 min-w-0">
							<h3 class="font-semibold text-foreground truncate">{stage.name}</h3>
							<p class="text-xs text-muted-foreground mt-1">
								Orden: {stage.order}
								{#if stage.icon}
									· Icono: {stage.icon}
								{/if}
							</p>
						</div>
					</div>

					<div class="flex items-center gap-1 flex-shrink-0">
						<Button
							variant="ghost"
							size="icon"
							class="h-8 w-8"
							onclick={() => handleEdit(stage)}
						>
							<Pencil class="h-4 w-4" />
						</Button>

						<Button
							variant="ghost"
							size="icon"
							class="h-8 w-8 text-red-600 hover:text-red-700"
							onclick={() => handleDeleteClick(stage)}
						>
							<Trash2 class="h-4 w-4" />
						</Button>
					</div>
				</div>

				<!-- Color preview -->
				<div class="mt-3 flex items-center gap-2">
					<div
						class="h-6 w-12 rounded border border-border"
						style="background-color: {stage.color}"
					></div>
					<span class="text-xs font-mono text-muted-foreground">{stage.color}</span>
				</div>

				<!-- Badges -->
				<div class="mt-3 flex gap-2 flex-wrap">
					{#if stage.is_active}
						<Badge variant="default" class="text-xs">Activo</Badge>
					{:else}
						<Badge variant="outline" class="text-xs">Inactivo</Badge>
					{/if}

					{#if stage.is_visible}
						<Badge variant="secondary" class="text-xs">Visible</Badge>
					{/if}

					{#if stage.auto_score !== undefined && stage.auto_score !== null}
						<Badge variant="outline" class="text-xs">Score: {stage.auto_score}</Badge>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>

<!-- Create/Edit Form Dialog -->
{#if showCreateForm || editingStage}
	<Dialog
		open={true}
		onOpenChange={() => {
			showCreateForm = false;
			editingStage = null;
		}}
		class="max-w-2xl"
	>
		<div class="space-y-4">
			<div class="sticky top-0 bg-background pb-2 border-b">
				<h2 class="text-lg font-semibold">
					{editingStage ? 'Editar Etapa' : 'Nueva Etapa'}
				</h2>
			</div>

			<ConfigStageForm
				stage={editingStage}
				onSuccess={() => {
					showCreateForm = false;
					editingStage = null;
				}}
				onCancel={() => {
					showCreateForm = false;
					editingStage = null;
				}}
			/>
		</div>
	</Dialog>
{/if}

<!-- Delete Confirmation Dialog -->
{#if showDeleteDialog && stageToDelete}
	<Dialog open={true} onOpenChange={cancelDelete}>
		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Confirmar eliminación</h2>

			<p class="text-sm text-muted-foreground">
				¿Estás seguro de que deseas eliminar la etapa <strong>{stageToDelete.name}</strong>?
				Esta acción no se puede deshacer.
			</p>

			{#if deleteError}
				<div class="rounded-lg border border-red-200 bg-red-50 p-3">
					<p class="text-sm text-red-800">{deleteError}</p>
				</div>
			{/if}

			<div class="flex justify-end gap-2 mt-4">
				<Button variant="ghost" onclick={cancelDelete}>Cancelar</Button>
				<Button
					variant="secondary"
					onclick={confirmDelete}
					class="bg-red-600 text-white hover:bg-red-700"
				>
					Eliminar
				</Button>
			</div>
		</div>
	</Dialog>
{/if}
