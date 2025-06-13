# Room Management Guide

*Track room status, manage assignments, and coordinate housekeeping*

---

## 🏠 Room Status Overview ✅

### Room Status Types

#### **Available Statuses**
- 🟢 **Clean & Ready** - Ready for guest assignment
- 🟡 **Occupied** - Guest currently staying
- 🔴 **Out of Order** - Maintenance required, not bookable
- 🟠 **Dirty** - Needs housekeeping after guest departure
- 🔵 **Cleaning in Progress** - Housekeeping currently working
- ⚪ **Inspected** - Cleaned and inspected, ready for next guest

#### **Status Workflow**
```
Guest Checks Out → Dirty → Cleaning in Progress → Inspected → Clean & Ready → Occupied
                                                      ↓
                                           Out of Order (if issues found)
```

### Visual Room Display ✅
**Current Features**:
- **Floor Plan View**: Visual layout of all rooms
- **Color-Coded Status**: Easy status identification
- **Room Type Indicators**: Standard, Deluxe, Superior, Family
- **Click for Details**: Room information popup

---

## 🔍 Room Information ✅

### Room Details Display
When clicking on any room:

#### **Basic Information**
- Room Number (หมายเลขห้อง)
- Floor Level (ชั้น)
- Room Type (ประเภทห้อง)
- Maximum Occupancy (จำนวนผู้เข้าพักสูงสุด)
- Current Status (สถานะปัจจุบัน)

#### **Occupancy Information**
- Guest Name (if occupied)
- Check-in Date
- Check-out Date
- Number of nights remaining
- Special requests or notes

#### **Housekeeping Information** 🚧
**Coming Soon**:
- Last cleaned date/time
- Assigned housekeeper
- Estimated cleaning completion
- Maintenance notes
- Inspection status

---

## 🛏️ Room Assignment ✅

### Manual Room Assignment

#### **Walk-In Guest Assignment**
1. **Access Room Selection**
   - Go to Walk-In page
   - Select booking option
   - View available rooms

2. **Choose Appropriate Room**
   - Consider guest preferences
   - Check room amenities
   - Verify clean status
   - Confirm pricing

3. **Assign Room**
   - Click on selected room
   - Confirm assignment
   - Update room status to "Occupied"
   - Generate room key

#### **Advance Booking Assignment**
1. **Review Booking Details**
   - Guest preferences
   - Room type requested
   - Special requirements
   - Length of stay

2. **Select Best Match**
   - Available rooms for dates
   - Preferred floor/location
   - Accessibility needs
   - View preferences

3. **Confirm Assignment**
   - Update booking with room number
   - Block room for arrival date
   - Note assignment in system

### Automatic Assignment 🔮
**Planned Features**:
- **Smart Assignment**: Auto-assign based on preferences
- **Optimization**: Maximize occupancy and satisfaction
- **Preference Learning**: Remember guest preferences
- **Group Coordination**: Assign nearby rooms for groups

---

## 🔄 Room Status Updates ✅

### Manual Status Changes

#### **Check-In Process**
1. Guest arrives and completes check-in
2. Activate room key
3. Change status from "Clean & Ready" to "Occupied"
4. Record guest information
5. Set checkout reminder

#### **Check-Out Process**
1. Guest completes checkout
2. Collect room keys
3. Change status to "Dirty"
4. Notify housekeeping
5. Note departure time

#### **Housekeeping Updates** 🚧
**Coming Soon**:
- Housekeepers can update status via mobile
- Real-time cleaning progress
- Photo verification of room condition
- Automatic inspector notification

### Status Change Notifications
- **Housekeeping Department**: Room ready for cleaning
- **Maintenance Team**: Issues requiring attention
- **Front Desk**: Rooms available for assignment
- **Management**: Daily status reports

---

## 🧹 Housekeeping Coordination 🚧

### **Room Cleaning Schedule**
**Coming Soon**:

#### **Priority Levels**
1. **Urgent**: Checkout with same-day arrival
2. **High**: Checkout rooms (departure day)
3. **Medium**: Stay-over rooms (occupied)
4. **Low**: Maintenance and deep cleaning

#### **Cleaning Assignments**
- Assign specific housekeepers to rooms
- Track cleaning start and completion times
- Quality inspection requirements
- Special cleaning requests

#### **Cleaning Checklist**
Standard room cleaning includes:
- [ ] Strip and replace bedding
- [ ] Clean bathroom thoroughly
- [ ] Vacuum/mop floors
- [ ] Dust all surfaces
- [ ] Restock amenities
- [ ] Check mini-bar inventory
- [ ] Test all equipment (TV, A/C, lights)
- [ ] Replace towels and toiletries
- [ ] Empty trash and replace liners
- [ ] Final inspection

### Staff Communication
- **Room Status Updates**: Real-time notifications
- **Special Requests**: Guest preferences and needs
- **Maintenance Issues**: Report problems immediately
- **Rush Requests**: Priority room cleaning
- **Inventory Needs**: Restocking requirements

---

## 🔧 Maintenance Management 🔮

### **Maintenance Request System**
**Planned Features**:

#### **Issue Reporting**
- **Guest Reports**: Via front desk or mobile app
- **Staff Reports**: Housekeeping and maintenance staff
- **Routine Inspections**: Scheduled maintenance checks
- **Preventive Maintenance**: Regular equipment servicing

#### **Issue Categories**
- **Urgent**: Safety issues, no hot water, A/C failure
- **High**: TV not working, minor plumbing
- **Medium**: Cosmetic issues, light bulbs
- **Low**: Preventive maintenance, upgrades

#### **Work Order Process**
1. **Issue Reported**: Guest or staff reports problem
2. **Assessment**: Maintenance evaluates severity
3. **Scheduling**: Assign technician and timeline
4. **Room Status**: Mark "Out of Order" if necessary
5. **Completion**: Update status and test functionality
6. **Documentation**: Record work performed and parts used

### Maintenance Tracking
- **Work Order History**: Complete repair records
- **Equipment Lifecycle**: Track equipment age and performance
- **Cost Tracking**: Maintenance expenses per room
- **Vendor Management**: External contractor coordination
- **Warranty Tracking**: Equipment warranty status

---

## 📊 Room Revenue Management 🔮

### **Dynamic Pricing**
**Future Implementation**:

#### **Pricing Factors**
- **Occupancy Level**: Higher rates when nearly full
- **Seasonal Demand**: Peak vs. off-peak pricing
- **Day of Week**: Weekend vs. weekday rates
- **Local Events**: Concerts, festivals, conferences
- **Competitor Rates**: Market positioning
- **Booking Lead Time**: Early booking discounts

#### **Revenue Optimization**
- **Upgrade Opportunities**: Sell higher category rooms
- **Length of Stay**: Encourage longer bookings
- **Package Deals**: Room + breakfast + services
- **Last-Minute Deals**: Fill empty rooms
- **Group Rates**: Volume discounts

### Rate Management
- **Base Rates**: Standard pricing by room type
- **Seasonal Rates**: Holiday and peak period pricing
- **Promotional Rates**: Special offers and discounts
- **Corporate Rates**: Business account pricing
- **Walk-in Rates**: Same-day pricing strategy

---

## 🏨 Room Inventory Control ✅

### Current Room Types
Based on system configuration:

#### **Standard Rooms**
- Basic amenities
- Standard pricing tier
- Most common room type
- Suitable for business travelers

#### **Superior Rooms**
- Enhanced amenities
- Mid-tier pricing
- Better views or location
- Popular for leisure guests

#### **Deluxe Rooms**
- Premium amenities
- Higher pricing tier
- Best views and furnishings
- Ideal for special occasions

#### **Family Rooms**
- Larger space
- Additional beds/sofa bed
- Family-friendly amenities
- Special pricing for families

### Inventory Management
- **Available Count**: Rooms ready for booking
- **Blocked Rooms**: Held for maintenance or special use
- **Oversold Protection**: Prevent overbooking
- **Room Type Flexibility**: Upgrade options when sold out

---

## 📱 Mobile Room Management 🔮

### **Staff Mobile App**
**Planned Features**:

#### **Housekeeping Mobile**
- View assigned rooms
- Update cleaning status
- Report maintenance issues
- Photo documentation
- Inventory requests

#### **Maintenance Mobile**
- Receive work orders
- Update repair status
- Access equipment manuals
- Order parts and supplies
- Complete work documentation

#### **Management Mobile**
- Real-time room status overview
- Revenue and occupancy metrics
- Staff productivity monitoring
- Guest satisfaction tracking
- Emergency notifications

---

## 🔐 Room Security 🔮

### **Access Control**
**Future Implementation**:

#### **Key Card Management**
- Program room access codes
- Set expiration dates
- Track key usage
- Emergency master keys
- Lost key replacement

#### **Security Monitoring**
- Room access logs
- Unusual activity alerts
- Master key usage tracking
- Guest safety features
- Emergency response protocols

---

## 📋 Room Management Best Practices

### **Daily Procedures**
- [ ] **Morning**: Review overnight departures and arrivals
- [ ] **Status Check**: Verify all room statuses are accurate
- [ ] **Housekeeping Coordination**: Plan cleaning schedule
- [ ] **Maintenance Review**: Check for pending work orders
- [ ] **Guest Requests**: Process room change requests

### **Guest Service Excellence**
- [ ] **Room Preferences**: Note and honor guest preferences
- [ ] **Quick Response**: Address room issues immediately
- [ ] **Upgrades**: Offer upgrades when available
- [ ] **Special Occasions**: Prepare rooms for celebrations
- [ ] **Follow-up**: Ensure guest satisfaction with room

### **Operational Efficiency**
- [ ] **Status Accuracy**: Keep room status updated in real-time
- [ ] **Communication**: Coordinate between departments effectively
- [ ] **Planning**: Anticipate busy periods and prepare accordingly
- [ ] **Documentation**: Record all room-related incidents
- [ ] **Quality Control**: Regular room inspections

---

## 🚨 Emergency Procedures

### **Room Emergencies**
1. **Guest Safety First**: Ensure guest welfare
2. **Immediate Response**: Address urgent issues
3. **Alternative Accommodation**: Move guest if necessary
4. **Documentation**: Record incident details
5. **Follow-up**: Ensure resolution and guest satisfaction

### **System Failures**
1. **Manual Tracking**: Use backup paper systems
2. **Communication**: Inform all relevant staff
3. **Priority Rooms**: Focus on occupied rooms
4. **Guest Communication**: Explain any limitations
5. **Recovery Plan**: Restore system data when possible

---

## 📞 Room Management Contacts

### **Internal Departments**
- **Housekeeping Supervisor**: Room cleaning coordination
- **Maintenance Manager**: Repair and maintenance issues
- **Duty Manager**: Guest room complaints
- **Engineering**: Major equipment problems

### **Emergency Contacts**
- **Security**: Guest safety issues
- **Fire Department**: Fire or safety emergencies
- **Police**: Security incidents
- **Hotel Management**: Major incidents

---

*Next: [Guest Services Guide](05-guest-services.md)*