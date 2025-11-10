module.exports = {
  apps: [
    {
      name: 'newton-dev',
      script: 'npm',
      args: 'run dev',
      cwd: '/home/debian/newton',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 5173,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      kill_timeout: 3000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};