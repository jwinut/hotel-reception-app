#!/bin/bash

# Setup automatic daily backups using cron
# This script configures cron to run daily backups

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_SCRIPT="$SCRIPT_DIR/daily-backup.sh"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    local level=$1
    shift
    local message="$*"
    
    case $level in
        "INFO")  echo -e "${BLUE}[INFO]${NC} $message" ;;
        "WARN")  echo -e "${YELLOW}[WARN]${NC} $message" ;;
        "ERROR") echo -e "${RED}[ERROR]${NC} $message" ;;
        "SUCCESS") echo -e "${GREEN}[SUCCESS]${NC} $message" ;;
    esac
}

# Check if running as root (for system-wide cron)
check_permissions() {
    if [ "$EUID" -eq 0 ]; then
        log "INFO" "Running as root - will setup system-wide cron job"
        CRON_USER="root"
    else
        log "INFO" "Running as user - will setup user cron job"
        CRON_USER="$USER"
    fi
}

# Setup cron job
setup_cron() {
    local cron_time="${1:-"0 2 * * *"}"  # Default: 2 AM daily
    local cron_job="$cron_time cd $PROJECT_DIR && $BACKUP_SCRIPT production >> $PROJECT_DIR/backups/cron.log 2>&1"
    
    log "INFO" "Setting up cron job for user: $CRON_USER"
    log "INFO" "Schedule: $cron_time"
    log "INFO" "Command: $cron_job"
    
    # Get current crontab
    local temp_cron=$(mktemp)
    crontab -l 2>/dev/null > "$temp_cron" || true
    
    # Remove existing hotel backup jobs
    grep -v "hotel-reception.*backup" "$temp_cron" > "${temp_cron}.new" || cp "$temp_cron" "${temp_cron}.new"
    
    # Add new cron job
    echo "# Hotel Reception Database Daily Backup" >> "${temp_cron}.new"
    echo "$cron_job" >> "${temp_cron}.new"
    
    # Install new crontab
    if crontab "${temp_cron}.new"; then
        log "SUCCESS" "Cron job installed successfully"
    else
        log "ERROR" "Failed to install cron job"
        rm -f "$temp_cron" "${temp_cron}.new"
        exit 1
    fi
    
    # Cleanup
    rm -f "$temp_cron" "${temp_cron}.new"
}

# Verify cron service
verify_cron_service() {
    if command -v systemctl >/dev/null 2>&1; then
        if systemctl is-active --quiet cron 2>/dev/null || systemctl is-active --quiet crond 2>/dev/null; then
            log "SUCCESS" "Cron service is running"
        else
            log "WARN" "Cron service may not be running. Start it with:"
            log "INFO" "  sudo systemctl start cron    # or crond on some systems"
        fi
    elif command -v service >/dev/null 2>&1; then
        if service cron status >/dev/null 2>&1 || service crond status >/dev/null 2>&1; then
            log "SUCCESS" "Cron service is running"
        else
            log "WARN" "Cron service may not be running"
        fi
    else
        log "INFO" "Cannot verify cron service status on this system"
    fi
}

# Create log directory
setup_log_directory() {
    local backup_dir="$PROJECT_DIR/backups"
    mkdir -p "$backup_dir"
    touch "$backup_dir/cron.log"
    log "SUCCESS" "Backup directory and log file created"
}

# Test backup script
test_backup() {
    log "INFO" "Testing backup script..."
    
    if [ -x "$BACKUP_SCRIPT" ]; then
        log "SUCCESS" "Backup script is executable"
    else
        log "ERROR" "Backup script is not executable: $BACKUP_SCRIPT"
        exit 1
    fi
    
    # Test run (dry run would be ideal, but our script doesn't have that option)
    log "INFO" "Backup script path: $BACKUP_SCRIPT"
    log "INFO" "You can test manually with: $BACKUP_SCRIPT"
}

# Show current cron jobs
show_current_cron() {
    log "INFO" "Current cron jobs for $CRON_USER:"
    echo ""
    crontab -l 2>/dev/null || log "INFO" "No cron jobs found"
    echo ""
}

# Remove cron job
remove_cron() {
    log "INFO" "Removing hotel reception backup cron jobs..."
    
    local temp_cron=$(mktemp)
    crontab -l 2>/dev/null > "$temp_cron" || true
    
    # Remove hotel backup jobs
    if grep -v "hotel-reception.*backup" "$temp_cron" > "${temp_cron}.new"; then
        crontab "${temp_cron}.new"
        log "SUCCESS" "Backup cron jobs removed"
    else
        log "INFO" "No backup cron jobs found to remove"
    fi
    
    rm -f "$temp_cron" "${temp_cron}.new"
}

# Help function
show_help() {
    echo "Hotel Reception Database Backup Cron Setup"
    echo ""
    echo "Usage: $0 [options] [cron_schedule]"
    echo ""
    echo "Arguments:"
    echo "  cron_schedule    Cron schedule (default: '0 2 * * *' - daily at 2 AM)"
    echo ""
    echo "Options:"
    echo "  -h, --help       Show this help message"
    echo "  -s, --status     Show current cron jobs"
    echo "  -r, --remove     Remove backup cron jobs"
    echo "  -t, --test       Test backup script only"
    echo ""
    echo "Examples:"
    echo "  $0                           # Setup daily backup at 2 AM"
    echo "  $0 '0 3 * * *'              # Setup daily backup at 3 AM"
    echo "  $0 '0 2 * * 0'              # Setup weekly backup on Sunday at 2 AM"
    echo "  $0 --status                  # Show current cron jobs"
    echo "  $0 --remove                  # Remove backup cron jobs"
    echo ""
    echo "Cron Schedule Format:"
    echo "  ┌───────────── minute (0 - 59)"
    echo "  │ ┌───────────── hour (0 - 23)"
    echo "  │ │ ┌───────────── day of month (1 - 31)"
    echo "  │ │ │ ┌───────────── month (1 - 12)"
    echo "  │ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)"
    echo "  │ │ │ │ │"
    echo "  * * * * *"
    echo ""
}

# Main function
main() {
    local cron_schedule="${1:-"0 2 * * *"}"
    
    log "INFO" "Setting up Hotel Reception Database Backup Automation"
    
    check_permissions
    setup_log_directory
    test_backup
    verify_cron_service
    setup_cron "$cron_schedule"
    show_current_cron
    
    log "SUCCESS" "Backup automation setup completed!"
    log "INFO" "Daily backups will run at: $cron_schedule"
    log "INFO" "Backup logs will be written to: $PROJECT_DIR/backups/cron.log"
    log "INFO" "You can monitor backups with: tail -f $PROJECT_DIR/backups/cron.log"
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -s|--status)
        check_permissions
        show_current_cron
        exit 0
        ;;
    -r|--remove)
        check_permissions
        remove_cron
        exit 0
        ;;
    -t|--test)
        test_backup
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac