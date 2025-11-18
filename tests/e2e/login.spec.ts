import { test, expect } from '@playwright/test';

test.describe('Login experience', () => {
	test('renders the login form with the expected controls', async ({ page }) => {
		await page.goto('/login');

		await expect(page.getByRole('heading', { name: 'Bienvenido' })).toBeVisible();
		await expect(page.getByText('Inicia sesión en tu cuenta')).toBeVisible();

		const emailInput = page.getByRole('textbox', { name: 'Correo electrónico' });
		const passwordInput = page.getByRole('textbox', { name: 'Contraseña' });
		await expect(emailInput).toBeVisible();
		await expect(passwordInput).toBeVisible();

		await emailInput.fill('usuario@example.com');
		await passwordInput.fill('super-secret');
		await expect(page.getByRole('button', { name: 'Iniciar Sesión' })).toBeEnabled();
	});

	test('allows toggling password visibility', async ({ page }) => {
		await page.goto('/login');

		const passwordInput = page.getByRole('textbox', { name: 'Contraseña' });
		await passwordInput.fill('secret');

		const toggle = page.getByLabel('Mostrar contraseña');
		await toggle.check();
		await expect(passwordInput).toHaveAttribute('type', 'text');

		await toggle.uncheck();
		await expect(passwordInput).toHaveAttribute('type', 'password');
	});
});
