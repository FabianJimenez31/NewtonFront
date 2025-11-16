<script lang="ts">
	import { cn } from '$lib/utils';
	import { Button, Badge, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '$lib/components/ui';
	import { Filter, X } from 'lucide-svelte';

	interface FilterOptions {
		status?: string[];
		priority?: string[];
		stage?: string[];
		channel?: string[];
	}

	interface Props {
		activeFilters?: FilterOptions;
		availableStages?: Array<{ id: string; name: string; color: string }>;
		availableChannels?: Array<{ id: string; name: string }>;
		onFilterChange?: (filters: FilterOptions) => void;
		onClearFilters?: () => void;
		class?: string;
	}

	let {
		activeFilters = $bindable({}),
		availableStages = [],
		availableChannels = [
			{ id: 'whatsapp', name: 'WhatsApp' },
			{ id: 'telegram', name: 'Telegram' },
			{ id: 'instagram', name: 'Instagram' },
			{ id: 'messenger', name: 'Messenger' },
			{ id: 'email', name: 'Email' },
			{ id: 'sms', name: 'SMS' }
		],
		onFilterChange,
		onClearFilters,
		class: className
	}: Props = $props();

	// Available filter options
	const statusOptions = [
		{ id: 'open', name: 'Abierto' },
		{ id: 'pending', name: 'Pendiente' },
		{ id: 'resolved', name: 'Resuelto' }
	];

	const priorityOptions = [
		{ id: 'high', name: 'Alta' },
		{ id: 'medium', name: 'Media' },
		{ id: 'low', name: 'Baja' }
	];

	// Count active filters
	const activeFilterCount = $derived(
		Object.values(activeFilters).reduce((sum, arr) => sum + (arr?.length || 0), 0)
	);

	function toggleFilter(category: keyof FilterOptions, value: string) {
		const current = activeFilters[category] || [];
		const index = current.indexOf(value);

		if (index > -1) {
			// Remove filter
			activeFilters[category] = current.filter((v) => v !== value);
		} else {
			// Add filter
			activeFilters[category] = [...current, value];
		}

		onFilterChange?.(activeFilters);
	}

	function isFilterActive(category: keyof FilterOptions, value: string): boolean {
		return activeFilters[category]?.includes(value) || false;
	}

	function handleClearFilters() {
		activeFilters = {};
		onClearFilters?.();
	}
</script>

<div class={cn('flex items-center gap-2', className)}>
	<!-- Filter Dropdown -->
	<DropdownMenu>
		<DropdownMenuTrigger asChild>
			<Button variant="outline" size="sm" class="relative">
				<Filter class="h-4 w-4 mr-2" />
				Filtros
				{#if activeFilterCount > 0}
					<Badge variant="default" class="ml-2 h-5 min-w-5 px-1.5">
						{activeFilterCount}
					</Badge>
				{/if}
			</Button>
		</DropdownMenuTrigger>

		<DropdownMenuContent align="start" class="w-56">
			<!-- Status Filters -->
			<DropdownMenuLabel>Estado</DropdownMenuLabel>
			{#each statusOptions as option}
				<DropdownMenuItem onclick={() => toggleFilter('status', option.id)}>
					<div class="flex items-center justify-between w-full">
						<span>{option.name}</span>
						{#if isFilterActive('status', option.id)}
							<Badge variant="default" class="h-5 w-5 p-0 flex items-center justify-center">
								✓
							</Badge>
						{/if}
					</div>
				</DropdownMenuItem>
			{/each}

			<DropdownMenuSeparator />

			<!-- Priority Filters -->
			<DropdownMenuLabel>Prioridad</DropdownMenuLabel>
			{#each priorityOptions as option}
				<DropdownMenuItem onclick={() => toggleFilter('priority', option.id)}>
					<div class="flex items-center justify-between w-full">
						<span>{option.name}</span>
						{#if isFilterActive('priority', option.id)}
							<Badge variant="default" class="h-5 w-5 p-0 flex items-center justify-center">
								✓
							</Badge>
						{/if}
					</div>
				</DropdownMenuItem>
			{/each}

			{#if availableStages.length > 0}
				<DropdownMenuSeparator />

				<!-- Stage Filters -->
				<DropdownMenuLabel>Etapa</DropdownMenuLabel>
				{#each availableStages as stage}
					<DropdownMenuItem onclick={() => toggleFilter('stage', stage.id)}>
						<div class="flex items-center justify-between w-full">
							<div class="flex items-center gap-2">
								<div class="w-3 h-3 rounded-full" style="background-color: {stage.color}"></div>
								<span>{stage.name}</span>
							</div>
							{#if isFilterActive('stage', stage.id)}
								<Badge variant="default" class="h-5 w-5 p-0 flex items-center justify-center">
									✓
								</Badge>
							{/if}
						</div>
					</DropdownMenuItem>
				{/each}
			{/if}

			<DropdownMenuSeparator />

			<!-- Channel Filters -->
			<DropdownMenuLabel>Canal</DropdownMenuLabel>
			{#each availableChannels as channel}
				<DropdownMenuItem onclick={() => toggleFilter('channel', channel.id)}>
					<div class="flex items-center justify-between w-full">
						<span>{channel.name}</span>
						{#if isFilterActive('channel', channel.id)}
							<Badge variant="default" class="h-5 w-5 p-0 flex items-center justify-center">
								✓
							</Badge>
						{/if}
					</div>
				</DropdownMenuItem>
			{/each}
		</DropdownMenuContent>
	</DropdownMenu>

	<!-- Clear Filters Button -->
	{#if activeFilterCount > 0}
		<Button variant="ghost" size="sm" onclick={handleClearFilters}>
			<X class="h-4 w-4 mr-1" />
			Limpiar
		</Button>
	{/if}

	<!-- Active Filter Badges -->
	{#if activeFilterCount > 0}
		<div class="flex gap-1 flex-wrap">
			{#each Object.entries(activeFilters) as [category, values]}
				{#if values && values.length > 0}
					{#each values as value}
						<Badge variant="secondary" class="gap-1">
							{value}
							<button
								class="ml-1 hover:text-destructive"
								onclick={() => toggleFilter(category as keyof FilterOptions, value)}
							>
								<X class="h-3 w-3" />
							</button>
						</Badge>
					{/each}
				{/if}
			{/each}
		</div>
	{/if}
</div>
