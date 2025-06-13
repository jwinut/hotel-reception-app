#!/bin/bash

# Hotel Reception Database Daily Backup Script
# This script creates compressed database backups with rotation
# Usage: ./daily-backup.sh [environment]

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_DIR="${PROJECT_DIR}/backups"
LOG_FILE="${BACKUP_DIR}/backup.log"
ENVIRONMENT="${1:-production}"

# Database configuration
DB_CONTAINER="hotel_postgres"
DB_NAME="hoteldb"
DB_USER="hoteluser"
DB_PASSWORD="hotelpass"

# Backup settings
RETENTION_DAYS=30
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DATE_ONLY=$(date +"%Y%m%d")
BACKUP_FILENAME="hotel_backup_${DATE_ONLY}_${TIMESTAMP}.sql"
COMPRESSED_FILENAME="${BACKUP_FILENAME}.gz"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
    
    case $level in
        "INFO")  echo -e "${BLUE}[INFO]${NC} $message" ;;
        "WARN")  echo -e "${YELLOW}[WARN]${NC} $message" ;;
        "ERROR") echo -e "${RED}[ERROR]${NC} $message" ;;
        "SUCCESS") echo -e "${GREEN}[SUCCESS]${NC} $message" ;;
    esac
    
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

# Check if Docker Compose is running
check_services() {
    log "INFO" "Checking if database service is running..."
    
    if ! docker compose ps hotel-database | grep -q "Up\|running"; then
        log "ERROR" "Database service is not running. Please start it with: docker compose up hotel-database -d"
        exit 1
    fi
    
    log "SUCCESS" "Database service is running"
}

# Create backup directory
setup_backup_dir() {
    log "INFO" "Setting up backup directory: $BACKUP_DIR"
    
    mkdir -p "$BACKUP_DIR"
    touch "$LOG_FILE"
    
    log "SUCCESS" "Backup directory ready"
}

# Perform database backup
create_backup() {
    local backup_path="${BACKUP_DIR}/${BACKUP_FILENAME}"
    local compressed_path="${BACKUP_DIR}/${COMPRESSED_FILENAME}"
    
    log "INFO" "Starting database backup..."
    log "INFO" "Backup file: $COMPRESSED_FILENAME"
    
    # Create backup using pg_dump
    if docker compose exec -T hotel-database pg_dump \
        -h localhost \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --no-password \
        --verbose \
        --clean \
        --if-exists \
        --create \
        --encoding=UTF8 > "$backup_path" 2>/dev/null; then
        
        # Compress the backup
        if gzip "$backup_path"; then
            local backup_size=$(du -h "$compressed_path" | cut -f1)
            log "SUCCESS" "Backup created successfully: $COMPRESSED_FILENAME ($backup_size)"
            
            # Verify backup integrity
            if gunzip -t "$compressed_path" 2>/dev/null; then
                log "SUCCESS" "Backup integrity verified"
            else
                log "ERROR" "Backup integrity check failed"
                return 1
            fi
        else
            log "ERROR" "Failed to compress backup"
            return 1
        fi
    else
        log "ERROR" "Database backup failed"
        return 1
    fi
}

# Clean up old backups
cleanup_old_backups() {
    log "INFO" "Cleaning up backups older than $RETENTION_DAYS days..."
    
    local deleted_count=0
    
    # Find and delete old backup files
    while IFS= read -r -d '' file; do
        log "INFO" "Deleting old backup: $(basename "$file")"
        rm "$file"
        ((deleted_count++))
    done < <(find "$BACKUP_DIR" -name "hotel_backup_*.sql.gz" -mtime +$RETENTION_DAYS -print0 2>/dev/null)
    
    if [ $deleted_count -gt 0 ]; then
        log "SUCCESS" "Cleaned up $deleted_count old backup(s)"
    else
        log "INFO" "No old backups to clean up"
    fi
}

# Generate backup report
generate_report() {
    local total_backups=$(find "$BACKUP_DIR" -name "hotel_backup_*.sql.gz" | wc -l)
    local total_size=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "0")
    local oldest_backup=$(find "$BACKUP_DIR" -name "hotel_backup_*.sql.gz" -printf '%T@ %p\n' 2>/dev/null | sort -n | head -1 | cut -d' ' -f2- | xargs basename 2>/dev/null || echo "None")
    local newest_backup=$(find "$BACKUP_DIR" -name "hotel_backup_*.sql.gz" -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2- | xargs basename 2>/dev/null || echo "None")
    
    log "INFO" "=== Backup Report ==="
    log "INFO" "Total backups: $total_backups"
    log "INFO" "Total backup size: $total_size"
    log "INFO" "Oldest backup: $oldest_backup"
    log "INFO" "Newest backup: $newest_backup"
    log "INFO" "Retention policy: $RETENTION_DAYS days"
    log "INFO" "===================="
}

# Send notification (can be extended for email/Slack)
send_notification() {
    local status=$1
    local message=$2
    
    # For now, just log. Can be extended to send emails/Slack notifications
    log "INFO" "Notification: $status - $message"
    
    # Example: Send to webhook (uncomment and configure)
    # curl -X POST "https://hooks.slack.com/your-webhook" \
    #   -H "Content-Type: application/json" \
    #   -d "{\"text\": \"Hotel Database Backup $status: $message\"}"
}

# Test database connection
test_connection() {
    log "INFO" "Testing database connection..."
    
    if docker compose exec -T hotel-database psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
        log "SUCCESS" "Database connection successful"
    else
        log "ERROR" "Database connection failed"
        exit 1
    fi
}

# Main backup function
main() {
    log "INFO" "Starting Hotel Reception Database Backup"
    log "INFO" "Environment: $ENVIRONMENT"
    log "INFO" "Timestamp: $TIMESTAMP"
    
    # Change to project directory
    cd "$PROJECT_DIR"
    
    # Run backup process
    setup_backup_dir
    check_services
    test_connection
    
    if create_backup; then
        cleanup_old_backups
        generate_report
        send_notification "SUCCESS" "Daily backup completed successfully"
        log "SUCCESS" "Backup process completed successfully"
    else
        send_notification "FAILED" "Daily backup failed"
        log "ERROR" "Backup process failed"
        exit 1
    fi
}

# Help function
show_help() {
    echo "Hotel Reception Database Backup Script"
    echo ""
    echo "Usage: $0 [environment]"
    echo ""
    echo "Arguments:"
    echo "  environment    Environment name (default: production)"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Run backup for production"
    echo "  $0 development        # Run backup for development"
    echo ""
    echo "Configuration:"
    echo "  RETENTION_DAYS: $RETENTION_DAYS days"
    echo "  BACKUP_DIR: $BACKUP_DIR"
    echo "  LOG_FILE: $LOG_FILE"
}

# Check for help flag
if [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
    show_help
    exit 0
fi

# Run main function
main "$@"