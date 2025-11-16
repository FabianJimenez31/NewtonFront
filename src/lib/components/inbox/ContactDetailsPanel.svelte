<script lang="ts">
	import { cn } from '$lib/utils';
	import { ScrollArea, Separator, Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui';
	import ContactInfo from './ContactInfo.svelte';
	import LeadInfo from './LeadInfo.svelte';
	import AIToggle from './AIToggle.svelte';
	import ActivityTimeline from './ActivityTimeline.svelte';
	import type { ConversationDetail } from '$lib/types/inbox.types';
	import type { Stage } from '$lib/types/kanban';

	interface Props {
		conversation: ConversationDetail | null;
		availableStages?: Stage[];
		onContactUpdate?: (data: Partial<ConversationDetail>) => void;
		onStageChange?: (stageId: string) => void;
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
		onAIToggle,
		onAIPause,
		onAIResume,
		class: className
	}: Props = $props();

	// Get initials for avatar fallback
	const initials = $derived(
		conversation?.contact_name
			? conversation.contact_name
					.split(' ')
					.map((n) => n[0])
					.join('')
					.toUpperCase()
					.substring(0, 2)
			: '??'
	);

	// Mock activity timeline data (in real app, fetch from API)
	const mockActivities = $derived.by(() => {
		if (!conversation) return [];

		return [
			{
				id: '1',
				type: 'stage_change' as const,
				title: 'Cambió de etapa',
				description: 'Lead movido a nueva etapa',
				timestamp: new Date(Date.now() - 3600000).toISOString(),
				user: 'Juan Pérez',
				metadata: {
					from_stage: 'Exploración',
					to_stage: 'Calificado'
				}
			},
			{
				id: '2',
				type: 'assignment' as const,
				title: 'Lead asignado',
				description: 'Lead asignado a agente',
				timestamp: new Date(Date.now() - 7200000).toISOString(),
				user: 'Sistema'
			},
			{
				id: '3',
				type: 'ai_toggle' as const,
				title: 'IA activada',
				description: 'Automatización de respuestas iniciada',
				timestamp: new Date(Date.now() - 86400000).toISOString(),
				user: 'María González'
			}
		];
	});
</script>

{#if !conversation}
	<div class="flex items-center justify-center h-full p-6 text-center">
		<div>
			<div class="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
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
	<div class={cn('h-full flex flex-col', className)}>
		<!-- Header with Avatar -->
		<div class="p-4 border-b border-border">
			<div class="flex flex-col items-center text-center">
				<Avatar class="h-16 w-16 mb-3">
					{#if conversation.contact_avatar}
						<AvatarImage src={conversation.contact_avatar} alt={conversation.contact_name} />
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
				<LeadInfo {conversation} {availableStages} {onStageChange} />

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
				<ActivityTimeline events={mockActivities} />
			</div>
		</ScrollArea>
	</div>
{/if}
