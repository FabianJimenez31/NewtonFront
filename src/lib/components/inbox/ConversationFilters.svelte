<script lang="ts">
	import {
		Button,
		Badge,
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
		DropdownMenuLabel,
		Input,
		ScrollArea,
	} from "$lib/components/ui";
	import {
		Filter,
		X,
		Check,
		Search,
		Square,
		CheckSquare,
	} from "lucide-svelte";

	import type {
		ConversationStatus,
		Priority,
		Channel,
		InboxFilters,
	} from "$lib/types/inbox.types";

	interface FilterOptions {
		status: ConversationStatus[];
		priority: Priority[];
		stage: string[];
		channel: Channel[];
	}

	interface Props {
		activeFilters: InboxFilters;
		availableStages: { id: string; name: string; color: string }[];
		availableChannels?: { id: Channel; name: string }[];
		onFilterChange?: (filters: InboxFilters) => void;
		onClearFilters?: () => void;
		class?: string;
	}

	let {
		activeFilters,
		availableStages = [],
		availableChannels = [],
		onFilterChange,
		onClearFilters,
		class: className,
	}: Props = $props();

	let searchQuery = $state("");

	// Filter stages based on search query
	let filteredStages = $derived(
		availableStages.filter((stage) =>
			stage.name.toLowerCase().includes(searchQuery.toLowerCase()),
		),
	);

	function toggleFilter(category: keyof FilterOptions, value: string): void {
		const current = (activeFilters[category] as string[]) || [];
		const index = current.indexOf(value);

		if (index >= 0) {
			activeFilters[category] = current.filter((v) => v !== value) as any;
		} else {
			activeFilters[category] = [...current, value] as any;
		}

		onFilterChange?.(activeFilters);
	}

	function handleClearFilters() {
		onClearFilters?.();
	}

	function isFilterActive(
		category: keyof FilterOptions,
		value: string,
	): boolean {
		return (activeFilters[category] as any[])?.includes(value) || false;
	}

	let activeFilterCount = $derived(
		(activeFilters.status?.length || 0) +
			(activeFilters.priority?.length || 0) +
			(activeFilters.stage?.length || 0) +
			(activeFilters.channel?.length || 0),
	);
</script>

<div class={className}>
	<!-- Filter Dropdown -->
	<DropdownMenu>
		<DropdownMenuTrigger asChild>
			<Button variant="outline" size="sm" class="relative border-dashed">
				<Filter class="h-4 w-4 mr-2" />
				Etapa
				{#if activeFilterCount > 0}
					<Badge
						variant="secondary"
						class="ml-2 rounded-sm px-1 font-normal lg:hidden"
					>
						{activeFilterCount}
					</Badge>
					<div class="hidden space-x-1 lg:flex ml-2">
						{#if activeFilters.stage && activeFilters.stage.length > 2}
							<Badge
								variant="secondary"
								class="rounded-sm px-1 font-normal"
							>
								{activeFilters.stage.length} seleccionados
							</Badge>
						{:else if activeFilters.stage && activeFilters.stage.length > 0}
							{#each activeFilters.stage as stageId}
								{@const stage = availableStages.find(
									(s) => s.id === stageId,
								)}
								{#if stage}
									<Badge
										variant="secondary"
										class="rounded-sm px-1 font-normal"
									>
										{stage.name}
									</Badge>
								{/if}
							{/each}
						{/if}
					</div>
				{/if}
			</Button>
		</DropdownMenuTrigger>

		<DropdownMenuContent align="start" class="w-[280px] p-0">
			<div class="p-2">
				<div class="relative">
					<Search
						class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"
					/>
					<Input
						placeholder="Buscar etapa..."
						class="pl-8 h-9"
						bind:value={searchQuery}
					/>
				</div>
			</div>

			<DropdownMenuSeparator />

			<ScrollArea class="max-h-[300px] overflow-y-auto">
				<div class="p-1">
					{#if filteredStages.length > 0}
						{#each filteredStages as stage}
							<DropdownMenuItem
								closeOnSelect={false}
								onclick={() => toggleFilter("stage", stage.id)}
								class="flex items-center justify-between px-2 py-1.5 cursor-pointer"
							>
								<div
									class="flex items-center gap-2 overflow-hidden"
								>
									<div
										class="w-3 h-3 rounded-full flex-shrink-0"
										style="background-color: {stage.color}"
									></div>
									<span class="truncate">{stage.name}</span>
								</div>
								<div
									class="flex items-center justify-center w-4 h-4 ml-2 flex-shrink-0"
								>
									{#if isFilterActive("stage", stage.id)}
										<CheckSquare
											class="h-4 w-4 opacity-100"
										/>
									{:else}
										<Square class="h-4 w-4 opacity-50" />
									{/if}
								</div>
							</DropdownMenuItem>
						{/each}
					{:else}
						<div
							class="py-6 text-center text-sm text-muted-foreground"
						>
							No se encontraron etapas
						</div>
					{/if}
				</div>
			</ScrollArea>

			{#if activeFilterCount > 0}
				<DropdownMenuSeparator />
				<div class="p-2">
					<Button
						variant="ghost"
						class="w-full justify-center h-8 text-xs"
						onclick={handleClearFilters}
					>
						Limpiar filtros
					</Button>
				</div>
			{/if}
		</DropdownMenuContent>
	</DropdownMenu>
</div>
