<script lang="ts">
	import { cn } from '$lib/utils';
	import { Avatar, AvatarImage, AvatarFallback, Badge } from '$lib/components/ui';
	import { MessageCircle, Phone, Mail } from 'lucide-svelte';

	interface Props {
		id: string;
		contactName: string;
		lastMessage: string;
		timestamp: string;
		unreadCount?: number;
		isSelected?: boolean;
		priority?: 'high' | 'medium' | 'low';
		channel?: 'whatsapp' | 'telegram' | 'instagram' | 'messenger' | 'email' | 'sms';
		avatarUrl?: string;
		assignedAgent?: string;
		stage?: string;
		onclick?: () => void;
		class?: string;
	}

	let {
		id,
		contactName,
		lastMessage,
		timestamp,
		unreadCount = 0,
		isSelected = false,
		priority,
		channel = 'whatsapp',
		avatarUrl,
		assignedAgent,
		stage,
		onclick,
		class: className
	}: Props = $props();

	// Get initials from contact name
	const initials = $derived(
		contactName
			? contactName
					.split(' ')
					.map((n) => n[0])
					.join('')
					.toUpperCase()
					.substring(0, 2)
			: '??'
	);

	// Channel icon mapping
	const channelIcons = {
		whatsapp: MessageCircle,
		telegram: MessageCircle,
		instagram: MessageCircle,
		messenger: MessageCircle,
		email: Mail,
		sms: Phone
	};

	const ChannelIcon = $derived(channelIcons[channel] || MessageCircle);

	// Priority color mapping
	const priorityColors = {
		high: 'text-red-500',
		medium: 'text-yellow-500',
		low: 'text-blue-500'
	};
</script>

<button
	class={cn(
		'w-full text-left p-3 rounded-lg transition-all duration-200',
		'hover:bg-accent hover:shadow-sm',
		'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
		isSelected && 'bg-accent border-l-4 border-primary shadow-sm',
		className
	)}
	{onclick}
>
	<div class="flex gap-3">
		<!-- Avatar -->
		<div class="flex-shrink-0">
			<Avatar class="h-10 w-10">
				{#if avatarUrl}
					<AvatarImage src={avatarUrl} alt={contactName} />
				{/if}
				<AvatarFallback>{initials}</AvatarFallback>
			</Avatar>
		</div>

		<!-- Content -->
		<div class="flex-1 min-w-0">
			<!-- Header Row -->
			<div class="flex items-center justify-between mb-1">
				<div class="flex items-center gap-2 min-w-0">
					<h4 class={cn('font-semibold text-sm truncate', unreadCount > 0 && 'text-foreground')}>
						{contactName}
					</h4>
					{#if priority}
						<div class={cn('w-2 h-2 rounded-full', priorityColors[priority])}></div>
					{/if}
				</div>

				<div class="flex items-center gap-1.5 flex-shrink-0">
					<!-- Channel Icon -->
					<ChannelIcon class="h-3.5 w-3.5 text-muted-foreground" />

					<!-- Unread Badge -->
					{#if unreadCount > 0}
						<Badge variant="default" class="h-5 min-w-5 px-1.5 text-xs">
							{unreadCount > 99 ? '99+' : unreadCount}
						</Badge>
					{/if}
				</div>
			</div>

			<!-- Last Message -->
			<p
				class={cn(
					'text-sm truncate mb-1',
					unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
				)}
			>
				{lastMessage}
			</p>

			<!-- Footer Row -->
			<div class="flex items-center justify-between">
				<span class="text-xs text-muted-foreground">{timestamp}</span>

				<div class="flex items-center gap-2">
					<!-- Stage Badge -->
					{#if stage}
						<Badge variant="outline" class="text-xs">
							{stage}
						</Badge>
					{/if}

					<!-- Assigned Agent -->
					{#if assignedAgent}
						<span class="text-xs text-muted-foreground">
							{assignedAgent}
						</span>
					{/if}
				</div>
			</div>
		</div>
	</div>
</button>
