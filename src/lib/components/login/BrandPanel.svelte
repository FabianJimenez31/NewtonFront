<div class="brand-panel">
	<div class="brand-content">
		<div class="logo-section">
			<div class="logo-icon">N</div>
			<h2 class="brand-title">Newton CRM</h2>
		</div>
		<p class="brand-description">
			Gestiona tus relaciones con clientes de manera inteligente y eficiente
		</p>
		<div class="features">
			<div class="feature-item">
				<div class="feature-icon">✓</div>
				<span>Multi-tenant</span>
			</div>
			<div class="feature-item">
				<div class="feature-icon">✓</div>
				<span>Pipeline de ventas visual</span>
			</div>
			<div class="feature-item">
				<div class="feature-icon">✓</div>
				<span>Gestión de conversaciones</span>
			</div>
		</div>
	</div>
</div>

<style>
	.brand-panel {
		position: relative;
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 60px;
	}

	.brand-content {
		max-width: 480px;
		color: white;
	}

	.logo-section {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 32px;
	}

	.logo-icon {
		width: 56px;
		height: 56px;
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(10px);
		border-radius: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28px;
		font-weight: 700;
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.brand-title {
		font-size: 2rem;
		font-weight: 700;
		color: white;
		margin: 0;
		letter-spacing: -0.5px;
	}

	.brand-description {
		font-size: 1.125rem;
		line-height: 1.7;
		color: rgba(255, 255, 255, 0.9);
		margin-bottom: 48px;
		font-weight: 400;
	}

	.features {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.feature-item {
		display: flex;
		align-items: center;
		gap: 14px;
		color: white;
		font-size: 1rem;
		font-weight: 500;
	}

	.feature-icon {
		width: 32px;
		height: 32px;
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(10px);
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 16px;
		font-weight: 700;
		flex-shrink: 0;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	/* Responsive */
	@media (max-width: 968px) {
		.brand-panel {
			padding: 40px 24px 24px;
			min-height: auto;
		}

		.brand-content {
			max-width: 100%;
		}

		.brand-description {
			font-size: 1rem;
			margin-bottom: 32px;
		}

		.logo-section {
			margin-bottom: 24px;
		}

		.brand-title {
			font-size: 1.5rem;
		}

		.features {
			gap: 16px;
		}

		.feature-item {
			font-size: 0.9375rem;
		}
	}

	@media (max-width: 640px) {
		.brand-panel {
			padding: 32px 20px 20px;
		}

		.logo-icon {
			width: 48px;
			height: 48px;
			font-size: 24px;
		}

		.brand-title {
			font-size: 1.375rem;
		}

		.features {
			display: none;
		}
	}
</style>
