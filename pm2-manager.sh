#!/bin/bash

# Newton CRM PM2 Development Server Manager
# Alternative to systemd service using PM2 process manager

APP_NAME="newton-dev"
CONFIG_FILE="ecosystem.config.cjs"

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_info() { echo -e "${BLUE}ℹ${NC} $1"; }

# Check if PM2 is installed
check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        print_error "PM2 is not installed!"
        print_info "Install PM2 globally with: npm install -g pm2"
        exit 1
    fi
}

# Create logs directory if it doesn't exist
setup_logs() {
    if [ ! -d "logs" ]; then
        mkdir -p logs
        print_success "Created logs directory"
    fi
}

# Install PM2 globally if not present
install_pm2() {
    print_warning "Installing PM2 globally..."
    npm install -g pm2

    if command -v pm2 &> /dev/null; then
        print_success "PM2 installed successfully!"
    else
        print_error "Failed to install PM2"
        exit 1
    fi
}

# Start the development server
start() {
    check_pm2
    setup_logs

    print_warning "Starting Newton CRM Development Server with PM2..."

    # Start using ecosystem config
    pm2 start "$CONFIG_FILE"

    # Save PM2 process list
    pm2 save

    print_success "Development server started!"
    print_info "Server is running at http://localhost:5173"
    print_info "Use '$0 logs' to view logs"
    print_info "Use '$0 monitor' for real-time monitoring"
}

# Stop the development server
stop() {
    check_pm2

    print_warning "Stopping Newton CRM Development Server..."
    pm2 stop "$APP_NAME"
    print_success "Server stopped!"
}

# Restart the development server
restart() {
    check_pm2

    print_warning "Restarting Newton CRM Development Server..."
    pm2 restart "$APP_NAME"
    print_success "Server restarted!"
}

# Reload the development server (zero-downtime restart)
reload() {
    check_pm2

    print_warning "Reloading Newton CRM Development Server..."
    pm2 reload "$APP_NAME"
    print_success "Server reloaded!"
}

# Delete the app from PM2
delete() {
    check_pm2

    print_warning "Removing Newton CRM from PM2..."
    pm2 delete "$APP_NAME"
    print_success "App removed from PM2!"
}

# Check status
status() {
    check_pm2
    pm2 status "$APP_NAME"
}

# View logs
logs() {
    check_pm2
    pm2 logs "$APP_NAME" --lines 50
}

# Monitor in real-time
monitor() {
    check_pm2
    pm2 monit
}

# Setup PM2 to start on system boot
startup() {
    check_pm2

    print_warning "Setting up PM2 to start on system boot..."

    # Generate startup script
    pm2 startup systemd -u "$USER" --hp "$HOME"

    print_warning "Follow the instructions above to complete the setup"
    print_info "After running the command, use '$0 save' to save the current process list"
}

# Save PM2 process list
save() {
    check_pm2

    pm2 save
    print_success "PM2 process list saved!"
    print_info "Processes will be restored on system reboot"
}

# Show PM2 info
info() {
    check_pm2

    echo "PM2 Process Information for $APP_NAME:"
    echo "======================================="
    pm2 info "$APP_NAME"
}

# Clean logs
clean_logs() {
    print_warning "Cleaning PM2 logs..."
    rm -f logs/*.log
    pm2 flush
    print_success "Logs cleaned!"
}

# Show usage
usage() {
    echo "Newton CRM PM2 Development Server Manager"
    echo ""
    echo "Usage: $0 {start|stop|restart|reload|delete|status|logs|monitor|startup|save|info|clean-logs|install-pm2}"
    echo ""
    echo "Commands:"
    echo "  start       - Start the development server"
    echo "  stop        - Stop the development server"
    echo "  restart     - Restart the development server"
    echo "  reload      - Reload with zero-downtime"
    echo "  delete      - Remove app from PM2"
    echo "  status      - Check server status"
    echo "  logs        - View server logs"
    echo "  monitor     - Real-time monitoring dashboard"
    echo "  startup     - Configure PM2 to start on boot"
    echo "  save        - Save current PM2 process list"
    echo "  info        - Show detailed process information"
    echo "  clean-logs  - Clean all log files"
    echo "  install-pm2 - Install PM2 globally"
    echo ""
    echo "Examples:"
    echo "  $0 start      # Start the server"
    echo "  $0 logs       # View logs"
    echo "  $0 monitor    # Open monitoring dashboard"
}

# Main script logic
case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    reload)
        reload
        ;;
    delete)
        delete
        ;;
    status)
        status
        ;;
    logs)
        logs
        ;;
    monitor)
        monitor
        ;;
    startup)
        startup
        ;;
    save)
        save
        ;;
    info)
        info
        ;;
    clean-logs)
        clean_logs
        ;;
    install-pm2)
        install_pm2
        ;;
    *)
        usage
        exit 1
        ;;
esac