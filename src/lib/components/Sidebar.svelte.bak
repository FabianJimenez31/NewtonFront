<script lang="ts">
	import { cn } from '$lib/utils';
	import { Button, Separator } from '$lib/components/ui';
	import {
		ChevronLeft,
		ChevronRight,
		LayoutDashboard,
		MessageSquare,
		Users,
		Target,
		BarChart,
		Settings,
		User,
		LogOut,
		Sparkles
	} from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.store';

	interface MenuItem {
		id: string;
		label: string;
		icon: any;
		href: string;
		badge?: number;
	}

	interface Props {
		activeItem?: string;
		class?: string;
	}

	let { activeItem = 'pipeline', class: className }: Props = $props();

	let isExpanded = $state(true);
	let hoveredItem = $state<string | null>(null);

	const menuItems: MenuItem[] = [
		{ id: 'pipeline', label: 'Pipeline', icon: LayoutDashboard, href: '/pipeline' },
		{ id: 'conversaciones', label: 'Conversaciones', icon: MessageSquare, href: '/conversaciones', badge: 3 },
		{ id: 'contactos', label: 'Contactos', icon: Users, href: '/contactos' },
		{ id: 'objetivos', label: 'Objetivos', icon: Target, href: '/objetivos' },
		{ id: 'reportes', label: 'Reportes', icon: BarChart, href: '/reportes' },
		{ id: 'config', label: 'Configuración', icon: Settings, href: '/configuracion' }
	];

	function toggleSidebar() {
		isExpanded = !isExpanded;
	}

	function navigateTo(href: string) {
		goto(href);
	}

	async function handleLogout() {
		await authStore.logout();
		goto('/login');
	}

	function getInitials(name: string): string {
		return name
			.split(' ')
			.map(n => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}
</script>

<aside
	class={cn(
		'sidebar-container',
		isExpanded ? 'sidebar-expanded' : 'sidebar-collapsed',
		className
	)}
>
	<!-- Gradient Background -->
	<div class="sidebar-gradient"></div>

	<!-- Content -->
	<div class="sidebar-content">
		<!-- Header -->
		<div class="sidebar-header">
			{#if isExpanded}
				<div class="brand-container">
					<div class="brand-icon">
						<Sparkles class="h-5 w-5" />
					</div>
					<div class="brand-text">
						<h1 class="brand-title">Newton</h1>
						<span class="brand-subtitle">CRM</span>
					</div>
				</div>
			{:else}
				<div class="brand-icon-collapsed">
					<Sparkles class="h-6 w-6" />
				</div>
			{/if}

			<button
				onclick={toggleSidebar}
				class="toggle-button"
				aria-label={isExpanded ? 'Contraer sidebar' : 'Expandir sidebar'}
			>
				{#if isExpanded}
					<ChevronLeft class="h-4 w-4" />
				{:else}
					<ChevronRight class="h-4 w-4" />
				{/if}
			</button>
		</div>

		<!-- Navigation -->
		<nav class="sidebar-nav">
			<ul class="nav-list">
				{#each menuItems as item (item.id)}
					{@const Icon = item.icon}
					{@const isActive = activeItem === item.id}
					{@const isHovered = hoveredItem === item.id}

					<li>
						<a
							href={item.href}
							onmouseenter={() => hoveredItem = item.id}
							onmouseleave={() => hoveredItem = null}
							class={cn(
								'nav-item',
								isActive && 'nav-item-active',
								!isExpanded && 'nav-item-collapsed'
							)}
						>
							<div class="nav-item-icon">
								<Icon class="h-5 w-5" />
							</div>

							{#if isExpanded}
								<span class="nav-item-label">{item.label}</span>

								{#if item.badge && item.badge > 0}
									<span class="nav-badge">{item.badge}</span>
								{/if}
							{/if}

							<!-- Active indicator -->
							{#if isActive}
								<div class="active-indicator"></div>
							{/if}
						</a>

						<!-- Tooltip for collapsed state -->
						{#if !isExpanded && (isHovered || isActive)}
							<div class="nav-tooltip">
								{item.label}
								{#if item.badge && item.badge > 0}
									<span class="tooltip-badge">{item.badge}</span>
								{/if}
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		</nav>

		<!-- Spacer -->
		<div class="flex-1"></div>

		<!-- User Section -->
		<div class="user-section">
			<div class="user-divider"></div>

			<div class="user-profile">
				<div class="user-avatar">
					{#if $authStore.user?.name}
						<span class="avatar-initials">
							{getInitials($authStore.user.name)}
						</span>
					{:else}
						<User class="h-5 w-5" />
					{/if}
					<div class="avatar-status"></div>
				</div>

				{#if isExpanded}
					<div class="user-info">
						<span class="user-name">
							{$authStore.user?.name || 'Usuario'}
						</span>
						<span class="user-email">
							{$authStore.user?.email || 'usuario@email.com'}
						</span>
					</div>
				{/if}
			</div>

			<!-- Logout Button -->
			<button
				onclick={handleLogout}
				class={cn(
					'logout-button',
					!isExpanded && 'logout-button-collapsed'
				)}
			>
				<LogOut class="h-4 w-4" />
				{#if isExpanded}
					<span>Cerrar sesión</span>
				{/if}
			</button>
		</div>
	</div>
</aside>

<style>
	/* Container */
	.sidebar-container {
		position: relative;
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: linear-gradient(180deg, #71276f 0%, #571d54 50%, #3d1438 100%);
		transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
		overflow: hidden;
		box-shadow: 4px 0 24px rgba(0, 0, 0, 0.12);
	}

	.sidebar-expanded {
		width: 280px;
	}

	.sidebar-collapsed {
		width: 80px;
	}

	/* Gradient Overlay */
	.sidebar-gradient {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background:
			radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
			radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.08) 0%, transparent 50%);
		pointer-events: none;
		animation: pulse 8s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.7; }
	}

	/* Content */
	.sidebar-content {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 1.5rem 0;
	}

	/* Header */
	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 1.5rem;
		margin-bottom: 2rem;
	}

	.brand-container {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.brand-icon {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(10px);
		border-radius: 12px;
		color: white;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.brand-icon-collapsed {
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(10px);
		border-radius: 14px;
		color: white;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		margin: 0 auto;
	}

	.brand-text {
		display: flex;
		flex-direction: column;
	}

	.brand-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: white;
		line-height: 1.2;
		letter-spacing: -0.02em;
	}

	.brand-subtitle {
		font-size: 0.75rem;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.7);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.toggle-button {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 8px;
		color: white;
		cursor: pointer;
		transition: all 200ms ease;
	}

	.toggle-button:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: scale(1.05);
	}

	/* Navigation */
	.sidebar-nav {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 0 1rem;
		scrollbar-width: thin;
		scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
	}

	.sidebar-nav::-webkit-scrollbar {
		width: 4px;
	}

	.sidebar-nav::-webkit-scrollbar-track {
		background: transparent;
	}

	.sidebar-nav::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 2px;
	}

	.nav-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.nav-list li {
		position: relative;
	}

	.nav-item {
		text-decoration: none;
		position: relative;
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.875rem 1rem;
		background: transparent;
		border: none;
		border-radius: 12px;
		color: rgba(255, 255, 255, 0.8);
		font-size: 0.9375rem;
		font-weight: 500;
		text-align: left;
		cursor: pointer;
		transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
	}

	.nav-item:hover {
		background: rgba(255, 255, 255, 0.12);
		color: white;
		transform: translateX(4px);
	}

	.nav-item-active {
		background: rgba(255, 255, 255, 0.2);
		color: white;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.nav-item-active:hover {
		background: rgba(255, 255, 255, 0.25);
		transform: translateX(4px);
	}

	.nav-item-collapsed {
		justify-content: center;
		padding: 0.875rem;
	}

	.nav-item-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.nav-item-label {
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.nav-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 20px;
		height: 20px;
		padding: 0 6px;
		background: #ff4444;
		color: white;
		font-size: 0.75rem;
		font-weight: 600;
		border-radius: 10px;
		box-shadow: 0 2px 8px rgba(255, 68, 68, 0.4);
	}

	.active-indicator {
		position: absolute;
		left: -1rem;
		top: 50%;
		transform: translateY(-50%);
		width: 4px;
		height: 60%;
		background: white;
		border-radius: 0 2px 2px 0;
		box-shadow: 0 2px 8px rgba(255, 255, 255, 0.5);
	}

	/* Tooltip */
	.nav-tooltip {
		position: absolute;
		left: 100%;
		top: 50%;
		transform: translateY(-50%);
		margin-left: 1rem;
		padding: 0.5rem 0.75rem;
		background: rgba(9, 0, 0, 0.95);
		backdrop-filter: blur(10px);
		color: white;
		font-size: 0.875rem;
		font-weight: 500;
		white-space: nowrap;
		border-radius: 8px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
		pointer-events: none;
		animation: tooltipIn 200ms ease;
		z-index: 100;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.tooltip-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 18px;
		height: 18px;
		padding: 0 5px;
		background: #ff4444;
		color: white;
		font-size: 0.7rem;
		font-weight: 600;
		border-radius: 9px;
	}

	@keyframes tooltipIn {
		from {
			opacity: 0;
			transform: translateY(-50%) translateX(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(-50%) translateX(0);
		}
	}

	/* User Section */
	.user-section {
		padding: 0 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.user-divider {
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.2) 50%,
			transparent 100%
		);
		margin-bottom: 0.5rem;
	}

	.user-profile {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem;
		background: rgba(255, 255, 255, 0.08);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		transition: all 200ms ease;
	}

	.user-profile:hover {
		background: rgba(255, 255, 255, 0.12);
		border-color: rgba(255, 255, 255, 0.2);
	}

	.user-avatar {
		position: relative;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%);
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		color: white;
		font-weight: 600;
		flex-shrink: 0;
	}

	.avatar-initials {
		font-size: 0.875rem;
		letter-spacing: -0.02em;
	}

	.avatar-status {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 12px;
		height: 12px;
		background: #4ade80;
		border: 2px solid #71276f;
		border-radius: 50%;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.user-info {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
	}

	.user-name {
		font-size: 0.9375rem;
		font-weight: 600;
		color: white;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.user-email {
		font-size: 0.8125rem;
		color: rgba(255, 255, 255, 0.6);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.logout-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.75rem 1rem;
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 10px;
		color: rgba(255, 255, 255, 0.8);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 200ms ease;
	}

	.logout-button:hover {
		background: rgba(255, 68, 68, 0.2);
		border-color: rgba(255, 68, 68, 0.3);
		color: white;
	}

	.logout-button-collapsed {
		padding: 0.75rem;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.sidebar-expanded {
			width: 240px;
		}

		.sidebar-collapsed {
			width: 70px;
		}
	}
</style>
