<script lang="ts">
	import { Input, Label } from '$lib/components/ui';
	import { normalizeColor, validateHexColor } from '$lib/utils/color.utils';

	interface Props {
		value: string;
		onchange: (color: string) => void;
		label?: string;
		id?: string;
		required?: boolean;
	}

	let { value = '#71276F', onchange, label, id = 'color', required = false }: Props = $props();

	let internalValue = $state(value);

	// Sync internal value with prop changes
	$effect(() => {
		internalValue = value;
	});

	function handleColorPickerChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const newColor = input.value.toUpperCase();
		internalValue = newColor;
		onchange(newColor);
	}

	function handleTextInput(e: Event) {
		const input = e.target as HTMLInputElement;
		internalValue = input.value;
	}

	function handleBlur() {
		// Normalize the color on blur
		const normalized = normalizeColor(internalValue);

		// Validate hex format
		if (validateHexColor(normalized)) {
			internalValue = normalized;
			onchange(normalized);
		} else if (internalValue.length === 0) {
			// Reset to default if empty
			internalValue = '#71276F';
			onchange('#71276F');
		}
	}
</script>

{#if label}
	<div class="space-y-2">
		<Label for={id}>{label}{required ? ' *' : ''}</Label>
		<div class="flex gap-2">
			<input
				{id}
				type="color"
				value={internalValue}
				onchange={handleColorPickerChange}
				class="h-10 w-20 cursor-pointer rounded-md border border-input"
			/>
			<Input
				type="text"
				value={internalValue}
				oninput={handleTextInput}
				onblur={handleBlur}
				placeholder="#71276F"
				maxlength={7}
				class="flex-1 font-mono"
				{required}
			/>
		</div>
		<p class="text-xs text-muted-foreground">
			Selecciona un color para la columna en el kanban
		</p>
	</div>
{:else}
	<div class="flex gap-2">
		<input
			{id}
			type="color"
			value={internalValue}
			onchange={handleColorPickerChange}
			class="h-10 w-20 cursor-pointer rounded-md border border-input"
		/>
		<Input
			type="text"
			value={internalValue}
			oninput={handleTextInput}
			onblur={handleBlur}
			placeholder="#71276F"
			maxlength={7}
			class="flex-1 font-mono"
			{required}
		/>
	</div>
{/if}
