# Configuration Guide

## Overview
This guide explains how to modify hotel-specific settings without programming knowledge. All hotel configuration is stored in JSON files that can be edited with any text editor.

## Configuration Files Location
All configuration files are located in: `frontend/public/config/`

## 1. Room Data Configuration (`roomData.json`)

### Purpose
Defines all rooms in your hotel with their numbers and types.

### Structure
```json
{
  "rooms": [
    { "roomNumber": "301", "roomType": "Deluxe" },
    { "roomNumber": "302", "roomType": "Standard" }
  ]
}
```

### How to Modify
1. **Adding a new room**: Add a new object to the "rooms" array
2. **Changing room type**: Modify the "roomType" value
3. **Removing a room**: Delete the entire room object

### Available Room Types
- Standard
- Superior  
- Deluxe
- Family
- Hop in
- Zenith

### Example: Adding Room 319
```json
{ "roomNumber": "319", "roomType": "Superior" }
```

## 2. Hotel Layout Configuration (`hotelLayout.json`)

### Purpose
Defines how rooms appear on the visual floor plan interface.

### Structure
```json
{
  "layout": [
    {
      "floor": "3",
      "rows": [
        ["301", "302", "303", null, "304"],
        ["305", "306", null, "307", "308"]
      ]
    }
  ]
}
```

### How to Modify
1. **Adding a floor**: Add a new floor object to the "layout" array
2. **Rearranging rooms**: Change the order in the "rows" arrays
3. **Empty spaces**: Use `null` for empty spaces in the grid
4. **Room positioning**: Each array in "rows" represents a row of rooms

### Important Notes
- Room numbers in layout MUST match room numbers in `roomData.json`
- Use `null` for empty spaces (hallways, elevators, etc.)
- Rows are displayed top to bottom as listed

## 3. Pricing Configuration (`priceData.json`)

### Purpose
Sets room rates for each room type with and without breakfast.

### Structure
```json
{
  "prices": [
    { 
      "roomType": "Standard", 
      "noBreakfast": 1200, 
      "withBreakfast": 1450 
    }
  ]
}
```

### How to Modify
1. **Update prices**: Change the numeric values
2. **Add new room type pricing**: Add a new pricing object
3. **Currency**: All prices are in Thai Baht (no currency symbol needed)

### Example: Updating Standard Room Prices
```json
{ 
  "roomType": "Standard", 
  "noBreakfast": 1300, 
  "withBreakfast": 1550 
}
```

## 4. Booking Options Configuration (`bookingOptions.json`)

### Purpose
Defines the different booking types available for walk-in guests.

### Structure
```json
{
  "walkInOptions": [
    { 
      "id": "walkin_bf", 
      "label": "ราคาปกติ รับอาหารเช้า" 
    }
  ]
}
```

### How to Modify
1. **Change option text**: Modify the "label" value
2. **Add new option**: Add a new option object with unique "id"
3. **Remove option**: Delete the entire option object

### Important Notes
- The "id" must be unique and use only letters, numbers, and underscores
- The "label" is what guests and staff will see
- Keep labels concise for better display

## Configuration Best Practices

### 1. Backup Before Changes
Always backup configuration files before making changes:
```bash
cp config/roomData.json config/roomData.json.backup
```

### 2. Validate JSON Format
Use an online JSON validator to check syntax after editing:
- Copy your JSON content
- Paste into validator (search "JSON validator" online)
- Fix any syntax errors before saving

### 3. Test Changes
After modifying configuration:
1. Refresh the application in your browser
2. Test the affected functionality
3. Verify rooms display correctly
4. Check pricing calculations

### 4. Common JSON Syntax Rules
- Use double quotes around all text: `"roomType"`
- Separate items with commas: `"301", "302"`
- No comma after the last item in a list
- Use `null` (not "null") for empty values
- Numbers don't need quotes: `1200`

## Troubleshooting

### Problem: Rooms not displaying
**Cause**: Room in layout doesn't exist in roomData.json
**Solution**: Add the room to roomData.json or remove from layout

### Problem: Application shows error after configuration change
**Cause**: Invalid JSON syntax
**Solution**: Check JSON syntax using online validator, fix errors

### Problem: New room type doesn't show pricing
**Cause**: Room type not added to priceData.json
**Solution**: Add pricing entry for the new room type

### Problem: Layout looks wrong
**Cause**: Incorrect row arrangement in hotelLayout.json
**Solution**: Rearrange room numbers in rows to match physical layout

## Getting Help

If you encounter issues with configuration:
1. Check the browser console for error messages (F12 key)
2. Verify JSON syntax using online validator
3. Compare your changes with working backup files
4. Contact technical support with specific error messages

## Future Database Migration

When the system is upgraded to use a database:
- Current JSON configuration will be automatically imported
- Configuration will then be managed through admin interface
- No data loss will occur during the transition
- Hotel operations can continue normally during upgrade