<script lang="ts">
	import { cn } from '$lib/utils';
	import { Avatar, AvatarImage, AvatarFallback, Badge, Button, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '$lib/components/ui';
	import { Phone, Video, MoreVertical, UserPlus, Archive, Trash2, Ban } from 'lucide-svelte';

	interface Props {
		contactName: string;
		contactStatus?: 'online' | 'offline' | 'typing';
		avatarUrl?: string;
		channel?: string;
		assignedAgent?: string;
		onCall?: () => void;
		onVideoCall?: () => void;
		onAssign?: () => void;
		onArchive?: () => void;
		onBlock?: () => void;
		onDelete?: () => void;
		class?: string;
	}

	let {
		contactName,
		contactStatus = 'offline',
		avatarUrl,
		channel,
		assignedAgent,
		onCall,
		onVideoCall,
		onAssign,
		onArchive,
		onBlock,
		onDelete,
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

	// Status indicator styling
	const statusStyles = {
		online: 'bg-green-500',
		offline: 'bg-gray-400',
		typing: 'bg-blue-500'
	};

	const statusLabels = {
		online: 'En línea',
		offline: 'Desconectado',
		typing: 'Escribiendo...'
	};
</script>

<div class={cn('px-4 py-3 flex items-center justify-between', className)}>
	<!-- Left: Contact Info -->
	<div class="flex items-center gap-3 min-w-0 flex-1">
		<!-- Avatar with status -->
		<div class="relative flex-shrink-0">
			<Avatar class="h-10 w-10">
				{#if avatarUrl}
					<AvatarImage src={avatarUrl} alt={contactName} />
				{/if}
				<AvatarFallback>{initials}</AvatarFallback>
			</Avatar>
			<!-- Status indicator -->
			<div
				class={cn(
					'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background',
					statusStyles[contactStatus]
				)}
			></div>
		</div>

		<!-- Name and status -->
		<div class="min-w-0 flex-1">
			<h3 class="font-semibold text-sm text-foreground truncate">
				{contactName}
			</h3>
			<div class="flex items-center gap-2">
				<p class="text-xs text-muted-foreground">
					{statusLabels[contactStatus]}
				</p>
				{#if channel}
					<Badge variant="outline" class="text-xs px-1.5 py-0">
						{channel}
					</Badge>
				{/if}
				{#if assignedAgent}
					<span class="text-xs text-muted-foreground">• {assignedAgent}</span>
				{/if}
			</div>
		</div>
	</div>

	<!-- Right: Action Buttons -->
	<div class="flex items-center gap-2">
		<!-- Call button -->
		{#if onCall}
			<Button variant="ghost" size="icon" onclick={onCall} title="Llamar">
				<Phone class="h-4 w-4" />
			</Button>
		{/if}

		<!-- Video call button -->
		{#if onVideoCall}
			<Button variant="ghost" size="icon" onclick={onVideoCall} title="Videollamada">
				<Video class="h-4 w-4" />
			</Button>
		{/if}

		<!-- More options -->
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" title="Más opciones">
					<MoreVertical class="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end">
				{#if onAssign}
					<DropdownMenuItem onclick={onAssign}>
						<UserPlus class="h-4 w-4 mr-2" />
						Asignar agente
					</DropdownMenuItem>
				{/if}

				{#if onArchive}
					<DropdownMenuItem onclick={onArchive}>
						<Archive class="h-4 w-4 mr-2" />
						Archivar conversación
					</DropdownMenuItem>
				{/if}

				{#if onBlock}
					<DropdownMenuSeparator />
					<DropdownMenuItem onclick={onBlock}>
						<Ban class="h-4 w-4 mr-2" />
						Bloquear contacto
					</DropdownMenuItem>
				{/if}

				{#if onDelete}
					<DropdownMenuItem onclick={onDelete} class="text-destructive">
						<Trash2 class="h-4 w-4 mr-2" />
						Eliminar conversación
					</DropdownMenuItem>
				{/if}
			</DropdownMenuContent>
		</DropdownMenu>
	</div>
</div>
