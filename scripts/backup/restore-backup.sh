#!/bin/bash

# Hotel Reception Database Restore Script
# This script restores database from backup files
# Usage: ./restore-backup.sh <backup_file> [target_database]

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_DIR="${PROJECT_DIR}/backups"

# Database configuration
DB_CONTAINER="hotel_postgres"
DB_NAME="${2:-hoteldb_restore}"
DB_USER="hoteluser"
DB_PASSWORD="hotelpass"

# Input validation
BACKUP_FILE="${1:-}"

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
}

# Help function
show_help() {
    echo "Hotel Reception Database Restore Script"
    echo ""
    echo "Usage: $0 <backup_file> [target_database]"
    echo ""
    echo "Arguments:"
    echo "  backup_file       Path to backup file (.sql or .sql.gz)"
    echo "  target_database   Target database name (default: hoteldb_restore)"
    echo ""
    echo "Options:"
    echo "  -h, --help        Show this help message"
    echo "  -l, --list        List available backup files"
    echo ""
    echo "Examples:"
    echo "  $0 backups/hotel_backup_20231215_120000.sql.gz"
    echo "  $0 hotel_backup_20231215_120000.sql.gz hoteldb_test"
    echo "  $0 --list"
    echo ""
}

# List available backups
list_backups() {
    log "INFO" "Available backup files in $BACKUP_DIR:"
    echo ""
    
    if [ -d "$BACKUP_DIR" ]; then
        local backup_files=$(find "$BACKUP_DIR" -name "hotel_backup_*.sql*" -type f | sort -r)
        
        if [ -n "$backup_files" ]; then
            printf "%-40s %-15s %-20s\n" "Backup File" "Size" "Date Created"
            printf "%-40s %-15s %-20s\n" "----------------------------------------" "---------------" "--------------------"
            
            while IFS= read -r file; do
                if [ -f "$file" ]; then
                    local basename_file=$(basename "$file")
                    local size=$(du -h "$file" | cut -f1)
                    local date_created=$(date -r "$file" "+%Y-%m-%d %H:%M:%S")
                    printf "%-40s %-15s %-20s\n" "$basename_file" "$size" "$date_created"
                fi
            done <<< "$backup_files"
        else
            log "WARN" "No backup files found"
        fi
    else
        log "ERROR" "Backup directory does not exist: $BACKUP_DIR"
    fi
    
    echo ""
}

# Validate backup file
validate_backup_file() {
    local file_path=""
    
    # Check if it's a full path or just filename
    if [[ "$BACKUP_FILE" == /* ]]; then
        file_path="$BACKUP_FILE"
    else
        file_path="$BACKUP_DIR/$BACKUP_FILE"
    fi
    
    if [ ! -f "$file_path" ]; then
        log "ERROR" "Backup file not found: $file_path"
        log "INFO" "Use --list to see available backup files"
        exit 1
    fi
    
    # Verify file integrity for compressed files
    if [[ "$file_path" == *.gz ]]; then
        if ! gunzip -t "$file_path" 2>/dev/null; then
            log "ERROR" "Backup file is corrupted: $file_path"
            exit 1
        fi
        log "SUCCESS" "Backup file integrity verified"
    fi
    
    echo "$file_path"
}

# Check if database service is running
check_services() {
    log "INFO" "Checking if database service is running..."
    
    if ! docker compose ps hotel-database | grep -q "Up\|running"; then
        log "ERROR" "Database service is not running. Please start it with: docker compose up hotel-database -d"
        exit 1
    fi
    
    log "SUCCESS" "Database service is running"
}

# Create restore database
create_restore_database() {
    log "INFO" "Creating restore database: $DB_NAME"
    
    # Drop database if exists and create new one
    docker compose exec -T hotel-database psql -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS \"$DB_NAME\";" >/dev/null 2>&1
    docker compose exec -T hotel-database psql -U "$DB_USER" -d postgres -c "CREATE DATABASE \"$DB_NAME\";" >/dev/null 2>&1
    
    log "SUCCESS" "Restore database created: $DB_NAME"
}

# Restore database from backup
restore_database() {
    local backup_path="$1"
    
    log "INFO" "Starting database restore from: $(basename "$backup_path")"
    
    # Determine if file is compressed
    if [[ "$backup_path" == *.gz ]]; then
        log "INFO" "Decompressing and restoring backup..."
        if gunzip -c "$backup_path" | docker compose exec -T hotel-database psql -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
            log "SUCCESS" "Database restored successfully"
        else
            log "ERROR" "Database restore failed"
            return 1
        fi
    else
        log "INFO" "Restoring uncompressed backup..."
        if docker compose exec -T hotel-database psql -U "$DB_USER" -d "$DB_NAME" < "$backup_path" >/dev/null 2>&1; then
            log "SUCCESS" "Database restored successfully"
        else
            log "ERROR" "Database restore failed"
            return 1
        fi
    fi
}

# Verify restore
verify_restore() {
    log "INFO" "Verifying database restore..."
    
    # Check if tables exist
    local table_count=$(docker compose exec -T hotel-database psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ' || echo "0")
    
    if [ "$table_count" -gt 0 ]; then
        log "SUCCESS" "Restore verification passed: $table_count tables found"
        
        # Show basic statistics
        log "INFO" "Database statistics:"
        
        # Check if rooms table exists and show count
        if docker compose exec -T hotel-database psql -U "$DB_USER" -d "$DB_NAME" -c "\dt rooms" >/dev/null 2>&1; then
            local room_count=$(docker compose exec -T hotel-database psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM rooms;" 2>/dev/null | tr -d ' ' || echo "0")
            log "INFO" "  Rooms: $room_count"
        fi
        
        # Check if walkin_bookings table exists and show count
        if docker compose exec -T hotel-database psql -U "$DB_USER" -d "$DB_NAME" -c "\dt walkin_bookings" >/dev/null 2>&1; then
            local booking_count=$(docker compose exec -T hotel-database psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM walkin_bookings;" 2>/dev/null | tr -d ' ' || echo "0")
            log "INFO" "  Bookings: $booking_count"
        fi
        
        # Check if room_type_pricing table exists and show count
        if docker compose exec -T hotel-database psql -U "$DB_USER" -d "$DB_NAME" -c "\dt room_type_pricing" >/dev/null 2>&1; then
            local pricing_count=$(docker compose exec -T hotel-database psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM room_type_pricing WHERE is_active = true;" 2>/dev/null | tr -d ' ' || echo "0")
            log "INFO" "  Active Pricing Rules: $pricing_count"
        fi
        
    else
        log "ERROR" "Restore verification failed: No tables found"
        return 1
    fi
}

# Generate restore report
generate_report() {
    local backup_file="$1"
    local backup_size=$(du -h "$backup_file" | cut -f1)
    local restore_time=$(date "+%Y-%m-%d %H:%M:%S")
    
    log "INFO" "=== Restore Report ==="
    log "INFO" "Backup file: $(basename "$backup_file")"
    log "INFO" "Backup size: $backup_size"
    log "INFO" "Target database: $DB_NAME"
    log "INFO" "Restore completed: $restore_time"
    log "INFO" "====================="
}

# Main restore function
main() {
    local backup_path
    
    log "INFO" "Starting Hotel Reception Database Restore"
    
    # Change to project directory
    cd "$PROJECT_DIR"
    
    # Validate and get backup file path
    backup_path=$(validate_backup_file)
    
    # Run restore process
    check_services
    create_restore_database
    
    if restore_database "$backup_path"; then
        verify_restore
        generate_report "$backup_path"
        log "SUCCESS" "Database restore completed successfully"
        log "INFO" "You can now connect to the restored database: $DB_NAME"
    else
        log "ERROR" "Database restore failed"
        exit 1
    fi
}

# Check command line arguments
if [ $# -eq 0 ]; then
    show_help
    exit 1
fi

case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -l|--list)
        list_backups
        exit 0
        ;;
    *)
        if [ -z "$BACKUP_FILE" ]; then
            log "ERROR" "Backup file is required"
            show_help
            exit 1
        fi
        main "$@"
        ;;
esac