<script lang="ts">
	import { cn } from '$lib/utils';
	import type { ComponentType } from 'svelte';

	interface MenuItem {
		id: string;
		label: string;
		icon: ComponentType;
		href: string;
		badge?: number;
	}

	interface Props {
		items: MenuItem[];
		activeItem: string;
		isExpanded: boolean;
		class?: string;
	}

	let {
		items,
		activeItem,
		isExpanded,
		class: className
	}: Props = $props();

	let hoveredItem = $state<string | null>(null);
</script>

<nav class={cn('sidebar-nav', className)}>
	<ul class="nav-list">
		{#each items as item (item.id)}
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

<style>
	/* CRITICAL: Fix scroll issue */
	.sidebar-nav {
		flex: 1;
		overflow: hidden !important; /* NO SCROLL */
		padding: 0 1rem;
	}

	.nav-list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		max-height: 100%;
		overflow: hidden; /* Ensure no scroll */
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		padding: 0.75rem;
		border-radius: 10px;
		color: rgba(255, 255, 255, 0.8);
		text-decoration: none;
		transition: all 200ms ease;
		position: relative;
		font-size: 0.9375rem;
		font-weight: 500;
		letter-spacing: -0.01em;
	}

	.nav-item-collapsed {
		justify-content: center;
		padding: 0.875rem;
	}

	.nav-item:hover {
		background: rgba(255, 255, 255, 0.15);
		color: white;
	}

	.nav-item-active {
		background: rgba(255, 255, 255, 0.2);
		color: white;
	}

	.nav-item-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 20px;
		height: 20px;
	}

	.nav-item-label {
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Active Indicator */
	.active-indicator {
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 3px;
		height: 24px;
		background: white;
		border-radius: 0 3px 3px 0;
		box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
	}

	/* Badge */
	.nav-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 20px;
		height: 20px;
		padding: 0 6px;
		background: rgba(255, 255, 255, 0.25);
		border-radius: 10px;
		font-size: 0.75rem;
		font-weight: 600;
		color: white;
		backdrop-filter: blur(10px);
	}

	/* Tooltip */
	.nav-tooltip {
		position: absolute;
		left: calc(100% + 8px);
		top: 50%;
		transform: translateY(-50%);
		padding: 0.5rem 0.75rem;
		background: rgba(0, 0, 0, 0.9);
		color: white;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 500;
		white-space: nowrap;
		pointer-events: none;
		z-index: 10;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		animation: fadeIn 200ms ease;
	}

	.tooltip-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 18px;
		height: 18px;
		padding: 0 5px;
		background: rgba(113, 39, 111, 0.8);
		border-radius: 9px;
		font-size: 0.7rem;
		font-weight: 600;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-50%) translateX(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(-50%) translateX(0);
		}
	}

	/* Responsive adjustments */
	@media (max-height: 700px) {
		.nav-item {
			padding: 0.625rem;
		}
	}
</style>