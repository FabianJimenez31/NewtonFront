#!/bin/bash

# Newton CRM Development Server Service Manager
# This script helps manage the systemd service for the development server

SERVICE_NAME="newton-dev"
SERVICE_FILE="newton-dev.service"
SYSTEMD_PATH="/etc/systemd/system"

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }

# Check if running with sudo
check_sudo() {
    if [ "$EUID" -ne 0 ]; then
        print_error "Please run with sudo: sudo $0 $1"
        exit 1
    fi
}

# Install the service
install() {
    check_sudo "install"

    print_warning "Installing Newton CRM Development Service..."

    # Copy service file to systemd directory
    cp "$SERVICE_FILE" "$SYSTEMD_PATH/"

    # Reload systemd daemon
    systemctl daemon-reload

    # Enable the service to start on boot
    systemctl enable "$SERVICE_NAME.service"

    print_success "Service installed successfully!"
    print_warning "Use 'sudo $0 start' to start the service"
}

# Uninstall the service
uninstall() {
    check_sudo "uninstall"

    print_warning "Uninstalling Newton CRM Development Service..."

    # Stop the service if running
    systemctl stop "$SERVICE_NAME.service" 2>/dev/null

    # Disable the service
    systemctl disable "$SERVICE_NAME.service" 2>/dev/null

    # Remove service file
    rm -f "$SYSTEMD_PATH/$SERVICE_FILE"

    # Reload systemd daemon
    systemctl daemon-reload

    print_success "Service uninstalled successfully!"
}

# Start the service
start() {
    check_sudo "start"

    print_warning "Starting Newton CRM Development Service..."
    systemctl start "$SERVICE_NAME.service"

    if systemctl is-active --quiet "$SERVICE_NAME.service"; then
        print_success "Service started successfully!"
        print_warning "Development server is running at http://localhost:5173"
        print_warning "Use 'sudo $0 logs' to view logs"
    else
        print_error "Failed to start service. Check logs with 'sudo $0 logs'"
        exit 1
    fi
}

# Stop the service
stop() {
    check_sudo "stop"

    print_warning "Stopping Newton CRM Development Service..."
    systemctl stop "$SERVICE_NAME.service"
    print_success "Service stopped!"
}

# Restart the service
restart() {
    check_sudo "restart"

    print_warning "Restarting Newton CRM Development Service..."
    systemctl restart "$SERVICE_NAME.service"

    if systemctl is-active --quiet "$SERVICE_NAME.service"; then
        print_success "Service restarted successfully!"
    else
        print_error "Failed to restart service. Check logs with 'sudo $0 logs'"
        exit 1
    fi
}

# Check service status
status() {
    systemctl status "$SERVICE_NAME.service"
}

# View logs
logs() {
    journalctl -u "$SERVICE_NAME.service" -f --no-pager
}

# Enable auto-start on boot
enable() {
    check_sudo "enable"

    systemctl enable "$SERVICE_NAME.service"
    print_success "Service will start automatically on boot"
}

# Disable auto-start on boot
disable() {
    check_sudo "disable"

    systemctl disable "$SERVICE_NAME.service"
    print_success "Service will not start automatically on boot"
}

# Show usage
usage() {
    echo "Newton CRM Development Server Service Manager"
    echo ""
    echo "Usage: $0 {install|uninstall|start|stop|restart|status|logs|enable|disable}"
    echo ""
    echo "Commands:"
    echo "  install    - Install the systemd service"
    echo "  uninstall  - Remove the systemd service"
    echo "  start      - Start the development server"
    echo "  stop       - Stop the development server"
    echo "  restart    - Restart the development server"
    echo "  status     - Check service status"
    echo "  logs       - View service logs (live)"
    echo "  enable     - Enable auto-start on boot"
    echo "  disable    - Disable auto-start on boot"
    echo ""
    echo "Example:"
    echo "  sudo $0 install   # Install the service"
    echo "  sudo $0 start     # Start the server"
    echo "  sudo $0 logs      # View logs"
}

# Main script logic
case "$1" in
    install)
        install
        ;;
    uninstall)
        uninstall
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    logs)
        logs
        ;;
    enable)
        enable
        ;;
    disable)
        disable
        ;;
    *)
        usage
        exit 1
        ;;
esac