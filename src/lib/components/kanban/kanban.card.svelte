<!-- Unified Kanban Card with Global Fields -->
<script lang="ts">
	/**
	 * Kanban Card - Newton CRM
	 * Unified card component with global fields support
	 * This is the main card component for the kanban board
	 */

	import type { LeadKanban } from '$lib/types/kanban';
	import { Badge } from '$lib/components/ui';
	import { MessageSquare, Clock, User } from 'lucide-svelte';
	import ChannelBadge from './ChannelBadge.svelte';
	import CountryFlag from './CountryFlag.svelte';
	import DealValue from './DealValue.svelte';
	import TagsGroup from './TagsGroup.svelte';
	import SLAIndicator from './SLAIndicator.svelte';
	import { formatRelativeTime } from '$lib/utils/dates';
	import { truncateText } from '$lib/utils/formatters';

	interface Props {
		lead: LeadKanban;
		onclick?: () => void;
		draggable?: boolean;
		class?: string;
	}

	let { lead, onclick, draggable = false, class: className = '' }: Props = $props();

	/**
	 * Get priority badge variant
	 */
	function getPriorityVariant(priority?: string): 'default' | 'secondary' | 'destructive' {
		if (!priority) return 'secondary';
		const lower = priority.toLowerCase();
		if (lower === 'alta' || lower === 'high') return 'destructive';
		if (lower === 'media' || lower === 'medium') return 'default';
		return 'secondary';
	}
</script>

<div
	class="group relative rounded-lg border border-border bg-card p-3 hover:shadow-md transition-all cursor-pointer {className}"
	class:draggable
	{draggable}
	onclick={onclick}
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Enter' && onclick?.()}
>
	<!-- Header: Name + Channel + Country + Unread Badge -->
	<div class="flex items-start justify-between gap-2 mb-2">
		<div class="flex items-center gap-2 flex-1 min-w-0">
			<User class="h-4 w-4 text-muted-foreground flex-shrink-0" />
			<h3 class="font-semibold text-sm text-foreground truncate">{lead.name}</h3>

			<!-- Channel Badge - Only show if available -->
			{#if lead.channel}
				<ChannelBadge channel={lead.channel} size="sm" variant="outline" />
			{/if}

			<!-- Country Flag - Only show if available -->
			{#if lead.country_code}
				<CountryFlag countryCode={lead.country_code} size="sm" showCode={true} />
			{/if}
		</div>

		{#if lead.unread_count && lead.unread_count > 0}
			<Badge variant="default" class="flex-shrink-0 h-5">
				{lead.unread_count}
			</Badge>
		{/if}
	</div>

	<!-- Deal Value - Only show if exists -->
	{#if lead.deal_value}
		<div class="mb-2">
			<DealValue
				value={lead.deal_value}
				currency={lead.currency}
				size="sm"
				variant="primary"
				compact={lead.deal_value > 10000}
			/>
		</div>
	{/if}

	<!-- Last Message -->
	{#if lead.last_message}
		<div class="flex items-start gap-2 mb-2">
			<MessageSquare class="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
			<p class="text-xs text-muted-foreground line-clamp-2 flex-1">
				{truncateText(lead.last_message, 80)}
			</p>
		</div>
	{/if}

	<!-- Tags - Only show if exists -->
	{#if lead.tags && lead.tags.length > 0}
		<div class="mb-2">
			<TagsGroup tags={lead.tags} maxVisible={3} size="sm" />
		</div>
	{/if}

	<!-- Footer: Timestamp + Priority + Score + SLA -->
	<div class="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-border">
		<!-- Left side: Timestamp -->
		<div class="flex items-center gap-1 text-xs text-muted-foreground">
			<Clock class="h-3 w-3" />
			<span>{formatRelativeTime(lead.last_interaction || lead.last_channel_at)}</span>
		</div>

		<!-- Right side: Badges -->
		<div class="flex items-center gap-1.5">
			<!-- SLA Status - Only show if available -->
			{#if lead.sla_status}
				<SLAIndicator
					status={lead.sla_status}
					size="sm"
					showLabel={false}
					showIcon={true}
				/>
			{/if}

			{#if lead.priority}
				<Badge variant={getPriorityVariant(lead.priority)} class="text-xs h-5">
					{lead.priority}
				</Badge>
			{/if}

			{#if lead.score !== undefined && lead.score !== null}
				<Badge variant="outline" class="text-xs h-5">
					{lead.score}
				</Badge>
			{/if}

			{#if lead.ai_automation_enabled}
				<Badge variant="secondary" class="text-xs h-5">
					AI
				</Badge>
			{/if}
		</div>
	</div>

	<!-- Extended info on hover (tooltip-like) - Only show if any field exists -->
	{#if lead.language || lead.external_id || lead.integration_source || lead.last_agent_name || (lead.assigned_agent_name && lead.assigned_agent_name !== lead.last_agent_name)}
		<div class="hidden group-hover:block absolute z-10 top-full mt-2 left-0 right-0 p-2 bg-popover border border-border rounded-md shadow-lg text-xs">
			<div class="space-y-1 text-muted-foreground">
				{#if lead.language}
					<div>Language: {lead.language}</div>
				{/if}
				{#if lead.external_id}
					<div>External ID: {lead.external_id}</div>
				{/if}
				{#if lead.integration_source}
					<div>Source: {lead.integration_source}</div>
				{/if}
				{#if lead.last_agent_name}
					<div>Last Agent: {lead.last_agent_name}</div>
				{/if}
				{#if lead.assigned_agent_name && lead.assigned_agent_name !== lead.last_agent_name}
					<div>Assigned to: {lead.assigned_agent_name}</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Drag handle indicator (when draggable) -->
	{#if draggable}
		<div
			class="absolute inset-0 rounded-lg border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
		></div>
	{/if}
</div>

<style>
	.draggable:active {
		cursor: grabbing;
		opacity: 0.8;
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>