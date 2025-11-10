#!/bin/bash

# Newton CRM Development Server - Quick Start Script

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_info() { echo -e "${BLUE}ℹ${NC} $1"; }

# Check if server is already running
check_running() {
    if lsof -i:5173 &> /dev/null; then
        print_warning "Server is already running on port 5173!"
        print_info "Access it at: http://localhost:5173"
        return 0
    fi
    return 1
}

# Quick start with best available option
start() {
    check_running && return

    # Try PM2 first
    if command -v pm2 &> /dev/null; then
        print_info "Starting with PM2..."
        ./pm2-manager.sh start
    # Try systemd
    elif command -v systemctl &> /dev/null && [ -f "/etc/systemd/system/newton-dev.service" ]; then
        print_info "Starting with systemd..."
        sudo systemctl start newton-dev
        print_success "Server started with systemd!"
    # Fallback to npm
    else
        print_info "Starting with npm run dev..."
        npm run dev
    fi
}

# Stop server
stop() {
    # Try PM2
    if command -v pm2 &> /dev/null && pm2 list | grep -q newton-dev; then
        ./pm2-manager.sh stop
    # Try systemd
    elif systemctl is-active --quiet newton-dev.service 2>/dev/null; then
        sudo systemctl stop newton-dev
        print_success "Server stopped!"
    else
        print_warning "No running server found"
    fi
}

# Check status
status() {
    echo "Newton CRM Server Status:"
    echo "========================="

    if lsof -i:5173 &> /dev/null; then
        print_success "Server is RUNNING on port 5173"
        print_info "http://localhost:5173"
    else
        print_warning "Server is NOT running"
    fi

    # Check PM2
    if command -v pm2 &> /dev/null && pm2 list | grep -q newton-dev; then
        echo ""
        echo "PM2 Status:"
        pm2 status newton-dev --mini
    fi

    # Check systemd
    if systemctl is-active --quiet newton-dev.service 2>/dev/null; then
        echo ""
        echo "Systemd Status: active"
    fi
}

# Setup (install service)
setup() {
    echo "Setup Options:"
    echo "1) Install systemd service (Linux servers)"
    echo "2) Install PM2 (Development)"
    echo "3) Skip setup"
    read -p "Choose [1-3]: " choice

    case $choice in
        1)
            if [ -f "./service-manager.sh" ]; then
                sudo ./service-manager.sh install
                print_success "Systemd service installed!"
            else
                print_error "service-manager.sh not found"
            fi
            ;;
        2)
            if ! command -v pm2 &> /dev/null; then
                npm install -g pm2
            fi
            print_success "PM2 ready!"
            ;;
        *)
            print_info "Setup skipped"
            ;;
    esac
}

# Show usage
usage() {
    echo "Newton CRM Development Server"
    echo ""
    echo "Usage: $0 {start|stop|restart|status|setup|logs}"
    echo ""
    echo "  start   - Start development server"
    echo "  stop    - Stop development server"
    echo "  restart - Restart development server"
    echo "  status  - Check server status"
    echo "  setup   - Install service (systemd or PM2)"
    echo "  logs    - View server logs"
}

# Main
case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        stop
        sleep 2
        start
        ;;
    status)
        status
        ;;
    setup)
        setup
        ;;
    logs)
        if command -v pm2 &> /dev/null && pm2 list | grep -q newton-dev; then
            pm2 logs newton-dev
        elif systemctl is-active --quiet newton-dev.service 2>/dev/null; then
            sudo journalctl -u newton-dev -f
        else
            print_error "No running service found"
        fi
        ;;
    *)
        usage
        ;;
esac