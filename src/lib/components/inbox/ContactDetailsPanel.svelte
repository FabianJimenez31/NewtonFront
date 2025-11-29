<script lang="ts">
	import { cn } from "$lib/utils";
	import {
		ScrollArea,
		Separator,
		Avatar,
		AvatarImage,
		AvatarFallback,
	} from "$lib/components/ui";
	import ContactInfo from "./ContactInfo.svelte";
	import LeadInfo from "./LeadInfo.svelte";
	import AIToggle from "./AIToggle.svelte";
	import ActivityTimeline from "./ActivityTimeline.svelte";
	import type { ConversationDetail } from "$lib/types/inbox.types";
	import type { Stage } from "$lib/types/kanban";

	interface Props {
		conversation: ConversationDetail | null;
		availableStages?: Stage[];
		onContactUpdate?: (data: Partial<ConversationDetail>) => void;
		onStageChange?: (stageId: string) => void;
		agents?: any[];
		onAssignAgent?: (agentId: string | null) => void;
		onAIToggle?: (enabled: boolean, reason?: string) => Promise<void>;
		onAIPause?: (reason: string) => Promise<void>;
		onAIResume?: () => Promise<void>;
		class?: string;
	}

	let {
		conversation,
		availableStages = [],
		onContactUpdate,
		onStageChange,
		agents = [],
		onAssignAgent,
		onAIToggle,
		onAIPause,
		onAIResume,
		class: className,
	}: Props = $props();

	// Get initials for avatar fallback
	const initials = $derived(
		conversation?.contact_name
			? conversation.contact_name
					.split(" ")
					.map((n) => n[0])
					.join("")
					.toUpperCase()
					.substring(0, 2)
			: "??",
	);

	// Activity timeline data
	const activities = $derived.by(() => {
		if (!conversation?.lead) return [];
		// TODO: Fetch real activity history from API
		// For now, we return empty array to avoid showing fake data
		return [];
	});
</script>

{#if !conversation}
	<div class="flex items-center justify-center h-full p-6 text-center">
		<div>
			<div
				class="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center"
			>
				<Avatar class="h-full w-full">
					<AvatarFallback>?</AvatarFallback>
				</Avatar>
			</div>
			<p class="text-sm text-muted-foreground">
				Selecciona una conversación para ver los detalles
			</p>
		</div>
	</div>
{:else}
	<div class={cn("h-full flex flex-col", className)}>
		<!-- Header with Avatar -->
		<div class="p-4 border-b border-border">
			<div class="flex flex-col items-center text-center">
				<Avatar class="h-16 w-16 mb-3">
					{#if conversation.contact_avatar}
						<AvatarImage
							src={conversation.contact_avatar}
							alt={conversation.contact_name}
						/>
					{/if}
					<AvatarFallback class="text-lg">{initials}</AvatarFallback>
				</Avatar>
				<h2 class="text-lg font-semibold text-foreground">
					{conversation.contact_name}
				</h2>
				<p class="text-sm text-muted-foreground">
					{conversation.channel}
				</p>
			</div>
		</div>

		<!-- Scrollable Content -->
		<ScrollArea class="flex-1">
			<div class="p-4 space-y-6">
				<!-- Contact Information -->
				<ContactInfo {conversation} onUpdate={onContactUpdate} />

				<Separator />

				<!-- Lead Information -->
				<LeadInfo
					{conversation}
					{availableStages}
					{onStageChange}
					{agents}
					{onAssignAgent}
				/>

				<Separator />

				<!-- AI Toggle -->
				{#if conversation.lead}
					<AIToggle
						leadId={conversation.lead.id}
						aiEnabled={conversation.lead.ai_enabled}
						aiPaused={!!conversation.lead.ai_paused_reason}
						pauseReason={conversation.lead.ai_paused_reason}
						onToggle={onAIToggle}
						onPause={onAIPause}
						onResume={onAIResume}
					/>

					<Separator />
				{/if}

				<!-- Activity Timeline -->
				<ActivityTimeline events={activities} />
			</div>
		</ScrollArea>
	</div>
{/if}
