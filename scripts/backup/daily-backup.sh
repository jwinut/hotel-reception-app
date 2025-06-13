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
REPORT_FILE="${BACKUP_DIR}/backup-report.md"
STATUS_FILE="${BACKUP_DIR}/backup-status.json"
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
            BACKUP_SIZE=$(du -h "$compressed_path" | cut -f1)
            log "SUCCESS" "Backup created successfully: $COMPRESSED_FILENAME ($BACKUP_SIZE)"
            
            # Verify backup integrity
            if gunzip -t "$compressed_path" 2>/dev/null; then
                log "SUCCESS" "Backup integrity verified"
                BACKUP_SUCCESS=true
                return 0
            else
                log "ERROR" "Backup integrity check failed"
                BACKUP_SUCCESS=false
                return 1
            fi
        else
            log "ERROR" "Failed to compress backup"
            BACKUP_SUCCESS=false
            return 1
        fi
    else
        log "ERROR" "Database backup failed"
        BACKUP_SUCCESS=false
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
    local backup_success=${1:-true}
    local backup_file=${2:-""}
    local backup_size=${3:-"0"}
    
    local total_backups=$(find "$BACKUP_DIR" -name "hotel_backup_*.sql.gz" | wc -l)
    local total_size=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "0")
    local oldest_backup=$(find "$BACKUP_DIR" -name "hotel_backup_*.sql.gz" 2>/dev/null | xargs ls -1t 2>/dev/null | tail -1 | xargs basename 2>/dev/null || echo "None")
    local newest_backup=$(find "$BACKUP_DIR" -name "hotel_backup_*.sql.gz" 2>/dev/null | xargs ls -1t 2>/dev/null | head -1 | xargs basename 2>/dev/null || echo "None")
    
    # Generate console report
    log "INFO" "=== Backup Report ==="
    log "INFO" "Total backups: $total_backups"
    log "INFO" "Total backup size: $total_size"
    log "INFO" "Oldest backup: $oldest_backup"
    log "INFO" "Newest backup: $newest_backup"
    log "INFO" "Retention policy: $RETENTION_DAYS days"
    log "INFO" "===================="
    
    # Generate detailed markdown report
    generate_markdown_report "$backup_success" "$backup_file" "$backup_size" "$total_backups" "$total_size" "$oldest_backup" "$newest_backup"
    
    # Generate JSON status for monitoring
    generate_json_status "$backup_success" "$backup_file" "$backup_size" "$total_backups" "$total_size"
}

# Generate detailed markdown report
generate_markdown_report() {
    local backup_success=$1
    local backup_file=$2
    local backup_size=$3
    local total_backups=$4
    local total_size=$5
    local oldest_backup=$6
    local newest_backup=$7
    local report_date=$(date "+%Y-%m-%d %H:%M:%S")
    
    # Create or update markdown report
    if [ ! -f "$REPORT_FILE" ]; then
        cat > "$REPORT_FILE" << EOF
# Hotel Reception Database Backup Report

This report tracks the status and history of automated database backups.

## Latest Backup Status

EOF
    fi
    
    # Create temp report content
    local temp_report=$(mktemp)
    cat > "$temp_report" << EOF
# Hotel Reception Database Backup Report

This report tracks the status and history of automated database backups.

## Latest Backup Status

**Last Updated**: $report_date  
**Environment**: $ENVIRONMENT  
**Status**: $([ "$backup_success" = "true" ] && echo "✅ SUCCESS" || echo "❌ FAILED")  

EOF
    
    if [ "$backup_success" = "true" ]; then
        cat >> "$temp_report" << EOF
**Latest Backup**: $backup_file  
**Backup Size**: $backup_size  
**Backup Time**: $TIMESTAMP  

EOF
    else
        cat >> "$temp_report" << EOF
**Error**: Backup process failed. Check logs for details.  
**Timestamp**: $TIMESTAMP  

EOF
    fi
    
    cat >> "$temp_report" << EOF
## Backup Statistics

| Metric | Value |
|--------|-------|
| Total Backups | $total_backups |
| Total Size | $total_size |
| Oldest Backup | $oldest_backup |
| Newest Backup | $newest_backup |
| Retention Period | $RETENTION_DAYS days |

## Recent Backup History

EOF
    
    # Add recent backup history
    echo "| Date | Filename | Size | Status |" >> "$temp_report"
    echo "|------|----------|------|--------|
" >> "$temp_report"
    
    # List recent backups
    find "$BACKUP_DIR" -name "hotel_backup_*.sql.gz" 2>/dev/null | \
        xargs ls -1t 2>/dev/null | head -10 | while read -r filepath; do
        local filename=$(basename "$filepath")
        local size=$(du -h "$filepath" 2>/dev/null | cut -f1 || echo "N/A")
        local date_created=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$filepath" 2>/dev/null || echo "N/A")
        echo "| $date_created | $filename | $size | ✅ Success |" >> "$temp_report"
    done
    
    # Add current backup entry if successful
    if [ "$backup_success" = "true" ] && [ -n "$backup_file" ]; then
        local current_date=$(date "+%Y-%m-%d %H:%M")
        echo "| $current_date | $backup_file | $backup_size | ✅ Success |" >> "$temp_report"
    fi
    
    cat >> "$temp_report" << EOF

## Backup Schedule

- **Frequency**: Daily at 2:00 AM
- **Retention**: $RETENTION_DAYS days
- **Compression**: Gzip enabled
- **Integrity Check**: Automatic verification

## Monitoring

- **Log File**: \`backup.log\`
- **Cron Log**: \`cron.log\`
- **Status API**: JSON status available in \`backup-status.json\`

## Commands

\`\`\`bash
# Manual backup
npm run backup

# List backups
npm run backup:list

# Setup automated backups
npm run backup:setup

# View logs
tail -f backups/backup.log
\`\`\`

---
*Report generated automatically by backup system*
EOF
    
    # Replace report file
    mv "$temp_report" "$REPORT_FILE"
    log "SUCCESS" "Markdown report updated: $REPORT_FILE"
}

# Generate JSON status for monitoring
generate_json_status() {
    local backup_success=$1
    local backup_file=$2
    local backup_size=$3
    local total_backups=$4
    local total_size=$5
    local status_timestamp=$(date -u "+%Y-%m-%dT%H:%M:%SZ")
    
    # Get database stats
    local room_count=$(docker compose exec -T hotel-database psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM rooms;" 2>/dev/null | tr -d ' ' || echo "0")
    local booking_count=$(docker compose exec -T hotel-database psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM walkin_bookings;" 2>/dev/null | tr -d ' ' || echo "0")
    local pricing_count=$(docker compose exec -T hotel-database psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM room_type_pricing WHERE is_active = true;" 2>/dev/null | tr -d ' ' || echo "0")
    
    cat > "$STATUS_FILE" << EOF
{
  "backup_status": {
    "last_backup": {
      "timestamp": "$status_timestamp",
      "success": $backup_success,
      "filename": "$backup_file",
      "size": "$backup_size",
      "environment": "$ENVIRONMENT"
    },
    "statistics": {
      "total_backups": $total_backups,
      "total_size": "$total_size",
      "retention_days": $RETENTION_DAYS
    },
    "database_stats": {
      "rooms": $room_count,
      "bookings": $booking_count,
      "active_pricing_rules": $pricing_count
    },
    "system_info": {
      "database_container": "$DB_CONTAINER",
      "database_name": "$DB_NAME",
      "backup_directory": "$BACKUP_DIR"
    }
  }
}
EOF
    
    log "SUCCESS" "JSON status updated: $STATUS_FILE"
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
    # Initialize variables
    BACKUP_SUCCESS=false
    BACKUP_SIZE="0"
    
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
        generate_report "$BACKUP_SUCCESS" "$COMPRESSED_FILENAME" "$BACKUP_SIZE"
        send_notification "SUCCESS" "Daily backup completed successfully"
        log "SUCCESS" "Backup process completed successfully"
    else
        generate_report "false" "" "0"
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