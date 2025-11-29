<script lang="ts">
	import { cn } from "$lib/utils";
	import {
		Badge,
		Button,
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger,
		DropdownMenuLabel,
		DropdownMenuSeparator,
	} from "$lib/components/ui";
	import {
		TrendingUp,
		Target,
		DollarSign,
		Calendar,
		User,
		ChevronDown,
		Check,
	} from "lucide-svelte";
	import type { ConversationDetail } from "$lib/types/inbox.types";
	import type { Stage } from "$lib/types/kanban";

	interface Props {
		conversation: ConversationDetail;
		availableStages?: Stage[];
		onStageChange?: (stageId: string) => void;
		agents?: any[];
		onAssignAgent?: (agentId: string | null) => void;
		class?: string;
	}

	let {
		conversation,
		availableStages = [],
		onStageChange,
		agents = [],
		onAssignAgent,
		class: className,
	}: Props = $props();

	$effect(() => {
		console.log("LeadInfo props:", {
			stagesCount: availableStages.length,
			agentsCount: agents.length,
			firstAgent: JSON.stringify(agents[0]),
			stages: JSON.stringify(availableStages),
			agents: JSON.stringify(agents),
		});
	});

	const lead = $derived(conversation.lead);

	// Priority colors
	const priorityColors = {
		high: "bg-red-500",
		medium: "bg-yellow-500",
		low: "bg-blue-500",
	};

	const priorityLabels = {
		high: "Alta",
		medium: "Media",
		low: "Baja",
	};

	// Score color based on value
	const scoreColor = $derived.by(() => {
		if (!lead?.score) return "text-muted-foreground";
		if (lead.score >= 80) return "text-green-600";
		if (lead.score >= 50) return "text-yellow-600";
		return "text-red-600";
	});

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString("es-ES", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	}

	const currentStage = $derived(
		availableStages.find((s) => s.id === lead?.stage_id) ||
			availableStages.find(
				(s) => s.name?.toLowerCase() === lead?.stage?.toLowerCase(),
			) ||
			availableStages.find((s) => s.id === lead?.stage),
	);

	const currentStageName = $derived(
		currentStage?.name || lead?.stage || "Sin etapa",
	);
	const currentStageColor = $derived(currentStage?.color || "#64748b");
</script>

<div class={cn("space-y-4", className)}>
	<h3 class="text-sm font-semibold text-foreground">Información del Lead</h3>

	{#if lead}
		<div class="space-y-3">
			<!-- Stage -->
			<div>
				<p class="text-xs text-muted-foreground mb-2">Etapa Actual</p>
				<DropdownMenu>
					<DropdownMenuTrigger class="w-full">
						<Button
							variant="outline"
							class="w-full justify-between font-normal bg-background"
						>
							<div class="flex items-center gap-2">
								<div
									class="w-2.5 h-2.5 rounded-full ring-1 ring-offset-1 ring-offset-background"
									style="background-color: {currentStageColor}; --tw-ring-color: {currentStageColor}"
								></div>
								<span class="truncate">{currentStageName}</span>
							</div>
							<ChevronDown class="w-4 h-4 opacity-50 shrink-0" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent class="w-[240px]" align="start">
						<DropdownMenuLabel>Cambiar Etapa</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{#each availableStages as stage}
							<DropdownMenuItem
								onclick={() => onStageChange?.(stage.id)}
								class="justify-between cursor-pointer"
							>
								<div class="flex items-center gap-2">
									<div
										class="w-2 h-2 rounded-full"
										style="background-color: {stage.color}"
									></div>
									<span>{stage.name}</span>
								</div>
								{#if stage.name === currentStageName || stage.id === currentStage?.id}
									<Check class="w-4 h-4 text-primary" />
								{/if}
							</DropdownMenuItem>
						{/each}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<!-- Score -->
			<div class="flex items-start gap-2">
				<TrendingUp class="h-4 w-4 text-muted-foreground mt-0.5" />
				<div class="flex-1">
					<p class="text-xs text-muted-foreground mb-1">Puntuación</p>
					<div class="flex items-center gap-2">
						<div
							class="flex-1 bg-muted rounded-full h-2 overflow-hidden"
						>
							<div
								class={cn(
									"h-full transition-all",
									scoreColor.replace("text-", "bg-"),
								)}
								style="width: {lead.score}%"
							></div>
						</div>
						<span class={cn("text-sm font-semibold", scoreColor)}>
							{lead.score}
						</span>
					</div>
				</div>
			</div>

			<!-- Priority -->
			<div class="flex items-start gap-2">
				<Target class="h-4 w-4 text-muted-foreground mt-0.5" />
				<div class="flex-1">
					<p class="text-xs text-muted-foreground mb-1">Prioridad</p>
					<div class="flex items-center gap-2">
						<div
							class={cn(
								"w-2 h-2 rounded-full",
								priorityColors[lead.priority],
							)}
						></div>
						<span class="text-sm"
							>{priorityLabels[lead.priority]}</span
						>
					</div>
				</div>
			</div>

			<!-- Created Date -->
			<div class="flex items-start gap-2">
				<Calendar class="h-4 w-4 text-muted-foreground mt-0.5" />
				<div class="flex-1">
					<p class="text-xs text-muted-foreground mb-0.5">Creado</p>
					<p class="text-sm">{formatDate(lead.created_at)}</p>
				</div>
			</div>

			<!-- Last Contact -->
			{#if lead.last_contact}
				<div class="flex items-start gap-2">
					<Calendar class="h-4 w-4 text-muted-foreground mt-0.5" />
					<div class="flex-1">
						<p class="text-xs text-muted-foreground mb-0.5">
							Último Contacto
						</p>
						<p class="text-sm">{formatDate(lead.last_contact)}</p>
					</div>
				</div>
			{/if}

			<!-- Assigned Agent -->
			<div class="flex items-start gap-2">
				<User class="h-4 w-4 text-muted-foreground mt-0.5" />
				<div class="flex-1">
					<p class="text-xs text-muted-foreground mb-1">
						Agente Asignado
					</p>
					<DropdownMenu>
						<DropdownMenuTrigger class="w-full">
							<div
								class="flex items-center justify-between w-full px-2 py-1.5 text-sm rounded-md hover:bg-accent transition-colors -ml-2"
							>
								<div class="flex items-center gap-2">
									{#if lead.assigned_agent}
										<div
											class="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium"
										>
											{lead.assigned_agent.name
												.charAt(0)
												.toUpperCase()}
										</div>
										<span class="text-sm"
											>{lead.assigned_agent.name}</span
										>
									{:else}
										<div
											class="w-6 h-6 rounded-full bg-muted flex items-center justify-center"
										>
											<User
												class="w-3 h-3 text-muted-foreground"
											/>
										</div>
										<span
											class="text-sm text-muted-foreground"
											>Sin asignar</span
										>
									{/if}
								</div>
								<ChevronDown class="w-4 h-4 opacity-50" />
							</div>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start" class="w-[200px]">
							<DropdownMenuLabel>Asignar Agente</DropdownMenuLabel
							>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onclick={() => onAssignAgent?.(null)}
							>
								<div class="flex items-center gap-2">
									<div
										class="w-6 h-6 rounded-full bg-muted flex items-center justify-center"
									>
										<User
											class="w-3 h-3 text-muted-foreground"
										/>
									</div>
									<span>Sin asignar</span>
								</div>
							</DropdownMenuItem>
							{#each agents as agent}
								<DropdownMenuItem
									onclick={() => onAssignAgent?.(agent.id)}
								>
									<div class="flex items-center gap-2">
										<div
											class="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium"
										>
											{(agent.name || "?")
												.charAt(0)
												.toUpperCase()}
										</div>
										<span>{agent.name || "Sin nombre"}</span
										>
									</div>
								</DropdownMenuItem>
							{/each}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			<!-- Tags -->
			{#if lead.tags && lead.tags.length > 0}
				<div>
					<p class="text-xs text-muted-foreground mb-2">Etiquetas</p>
					<div class="flex flex-wrap gap-1">
						{#each lead.tags as tag}
							<Badge variant="outline" class="text-xs"
								>{tag}</Badge
							>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<p class="text-sm text-muted-foreground">
			No hay información de lead disponible
		</p>
	{/if}
</div>
