<script lang="ts">
	import type { Stage, StageCreate, StageUpdate } from '$lib/types/kanban';
	import { authStore } from '$lib/stores/auth.store';
	import { kanbanStore } from '$lib/stores/kanban.core.store';
	import { Button, Input, Label } from '$lib/components/ui';
	import { validateStageData, getNextOrder } from '$lib/services/kanban.validators';
	import { normalizeColor, validateHexColor } from '$lib/utils/color.utils';
	import ColorPicker from './ColorPicker.svelte';

	interface Props {
		stage?: Stage | null;
		onSuccess: () => void;
		onCancel: () => void;
	}

	let { stage = null, onSuccess, onCancel }: Props = $props();

	// Form fields
	let name = $state(stage?.name || '');
	let color = $state(stage?.color || '#71276f');
	let icon = $state(stage?.icon || '');
	let order = $state(stage?.order ?? 0);
	let isVisible = $state(stage?.is_visible ?? true);
	let isActive = $state(stage?.is_active ?? true);
	let autoScore = $state<number | undefined>(stage?.auto_score);
	let stageType = $state<'initial' | 'progress' | 'success' | 'failure' | 'waiting'>('progress');
	let baseScore = $state<number>(50);

	let errors = $state<string[]>([]);
	let isSubmitting = $state(false);

	// Set initial order for new stages
	$effect(() => {
		if (!stage && $kanbanStore.stages.length > 0 && order === 0) {
			order = getNextOrder($kanbanStore.stages);
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		errors = [];

		// Normalize color before submission
		const normalizedColor = normalizeColor(color);
		if (!validateHexColor(normalizedColor)) {
			errors = ['El color debe estar en formato hexadecimal (#RRGGBB)'];
			return;
		}

		// Prepare data based on whether it's create or update
		let stageData: StageCreate | StageUpdate;

		if (stage) {
			// Update existing stage
			stageData = {
				name,
				color: normalizedColor,
				order,
				is_visible: isVisible,
				is_active: isActive
			};
		} else {
			// Create new stage - include all required fields
			const stageId = `stage_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
			stageData = {
				id: stageId,
				name,
				display_name: name, // Use same as name for display
				stage_type: stageType,
				base_score: baseScore,
				color: normalizedColor,
				order,
				is_visible: isVisible,
				is_active: isActive
			} as StageCreate;
		}

		if (icon.trim()) {
			stageData.icon = icon.trim();
		}

		if (autoScore !== undefined && autoScore !== null) {
			stageData.auto_score = autoScore;
		}

		// Validate
		const validationErrors = validateStageData(stageData);
		if (validationErrors.length > 0) {
			errors = validationErrors;
			return;
		}

		if (!$authStore.token) {
			errors = ['No hay token de autenticación'];
			return;
		}

		isSubmitting = true;

		try {
			if (stage) {
				// Update existing stage
				await kanbanStore.updateStage($authStore.token, stage.id, stageData as StageUpdate);
			} else {
				// Create new stage
				await kanbanStore.createStage($authStore.token, stageData as StageCreate);
			}

			onSuccess();
		} catch (error) {
			errors = [error instanceof Error ? error.message : 'Error al guardar etapa'];
		} finally {
			isSubmitting = false;
		}
	}

	function handleColorChange(newColor: string) {
		color = newColor;
	}
</script>

<form onsubmit={handleSubmit} class="space-y-4">
	<!-- Error messages -->
	{#if errors.length > 0}
		<div class="rounded-lg border border-red-200 bg-red-50 p-3">
			<ul class="text-sm text-red-800 list-disc list-inside">
				{#each errors as error}
					<li>{error}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- Name -->
	<div class="space-y-2">
		<Label for="name">Nombre *</Label>
		<Input
			id="name"
			type="text"
			bind:value={name}
			placeholder="Ej: Prospecto, Calificado, Propuesta..."
			required
			maxlength={50}
		/>
		<p class="text-xs text-muted-foreground">
			{name.length}/50 caracteres
		</p>
	</div>

	<!-- Color Picker -->
	<ColorPicker
		value={color}
		onchange={handleColorChange}
		label="Color"
		id="color"
		required
	/>

	<!-- Stage Type (only for new stages) -->
	{#if !stage}
		<div class="space-y-2">
			<Label for="stageType">Tipo de Etapa *</Label>
			<select
				id="stageType"
				bind:value={stageType}
				class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
				required
			>
				<option value="initial">Inicial</option>
				<option value="progress">En Progreso</option>
				<option value="success">Éxito</option>
				<option value="failure">Perdido</option>
				<option value="waiting">En Espera</option>
			</select>
			<p class="text-xs text-muted-foreground">
				Define el tipo de etapa en el pipeline
			</p>
		</div>

		<!-- Base Score (only for new stages) -->
		<div class="space-y-2">
			<Label for="baseScore">Puntaje Base *</Label>
			<Input
				id="baseScore"
				type="number"
				bind:value={baseScore}
				min="0"
				max="100"
				step="5"
				required
			/>
			<p class="text-xs text-muted-foreground">
				Puntaje base para leads en esta etapa (0-100)
			</p>
		</div>
	{/if}

	<!-- Order -->
	<div class="space-y-2">
		<Label for="order">Orden *</Label>
		<Input
			id="order"
			type="number"
			bind:value={order}
			min="0"
			step="1"
			required
		/>
		<p class="text-xs text-muted-foreground">
			Posición de la columna (0 = primera)
		</p>
	</div>

	<!-- Icon (optional) -->
	<div class="space-y-2">
		<Label for="icon">Icono (opcional)</Label>
		<Input
			id="icon"
			type="text"
			bind:value={icon}
			placeholder="Ej: rocket, check-circle, users..."
		/>
		<p class="text-xs text-muted-foreground">
			Nombre de icono de lucide-svelte (opcional)
		</p>
	</div>

	<!-- Auto Score (optional) -->
	<div class="space-y-2">
		<Label for="autoScore">Puntaje Automático (opcional)</Label>
		<Input
			id="autoScore"
			type="number"
			bind:value={autoScore}
			min="0"
			max="100"
			step="1"
			placeholder="0-100"
		/>
		<p class="text-xs text-muted-foreground">
			Puntaje asignado automáticamente a leads en esta etapa (0-100)
		</p>
	</div>

	<!-- Checkboxes -->
	<div class="space-y-3">
		<div class="flex items-center gap-2">
			<input
				id="isActive"
				type="checkbox"
				bind:checked={isActive}
				class="h-4 w-4 rounded border-border"
			/>
			<Label for="isActive" class="cursor-pointer">Etapa activa</Label>
		</div>

		<div class="flex items-center gap-2">
			<input
				id="isVisible"
				type="checkbox"
				bind:checked={isVisible}
				class="h-4 w-4 rounded border-border"
			/>
			<Label for="isVisible" class="cursor-pointer">Visible en kanban</Label>
		</div>
	</div>

	<!-- Actions -->
	<div class="flex justify-end gap-2 pt-4 border-t">
		<Button type="button" variant="ghost" onclick={onCancel} disabled={isSubmitting}>
			Cancelar
		</Button>
		<Button type="submit" disabled={isSubmitting}>
			{isSubmitting ? 'Guardando...' : stage ? 'Actualizar' : 'Crear'}
		</Button>
	</div>
</form>
