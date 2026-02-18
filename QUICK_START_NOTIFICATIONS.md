# Quick Start Guide - Real-time Notifications

## What's Been Added

Your Task Manager now has a complete real-time notification system with:
- ✅ Socket.io integration for live updates
- ✅ Notification drawer sidebar component
- ✅ Notification icon with unread badge in header
- ✅ Connection status indicator
- ✅ Browser notifications support
- ✅ Unread count tracking

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

This will install `socket.io-client` and all required packages.

### 2. Configure Backend URL

**For Development** (default):
- Backend: `http://localhost:8000`
- File: [src/environments/environment.ts](src/environments/environment.ts)

**For Production:**
- Update `notificationServiceUrl` in [src/environments/environment.prod.ts](src/environments/environment.prod.ts)

### 3. Ensure Auth Token

The notification service reads the auth token from localStorage. Make sure your login flow stores the token:

```typescript
// After successful login
localStorage.setItem('auth_token', jwtToken);
```

### 4. Start Your Application

```bash
npm start
```

The notification icon will appear in the top right of the header. It will show:
- 🔴 Red dot: Disconnected from notification service
- 🟢 Green dot: Connected and ready to receive notifications
- Red badge: Count of unread notifications

## How It Works

### Backend Events Flow
```
Backend Server
    ↓
Socket.io Events
    ↓
NotificationService (listens)
    ↓
RxJS Observables
    ↓
Components (HeaderComponent, NotificationDrawerComponent)
    ↓
User Interface (notification icon, drawer, badge)
```

### Supported Events

Your backend should emit these Socket.io events:

```typescript
// Notification events
socket.emit('notification:created', notificationData);
socket.emit('notification:updated', notificationData);
socket.emit('notification:read', notificationData);
socket.emit('notification:all-read', {});

// Application events
socket.emit('application:created', eventData);
socket.emit('application:approved', eventData);
socket.emit('application:rejected', eventData);
socket.emit('application:updated', eventData);

// Upgrade request events
socket.emit('upgrade_request:created', eventData);
socket.emit('upgrade_request:approved', eventData);
socket.emit('upgrade_request:rejected', eventData);
socket.emit('upgrade_request:updated', eventData);

// Email events
socket.emit('email:sent', eventData);
socket.emit('email:failed', eventData);

// Status events
socket.emit('status:updated', eventData);
```

### Data Structure

Notifications should follow this structure:

```typescript
interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  data?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

## Implementation Details

### File Structure
```
src/app/
├── api-services/
│   └── notification/
│       ├── notification.service.ts          (Core service)
│       └── notification.service.spec.ts     (Tests)
├── shared/
│   ├── types/
│   │   └── notification.types.ts            (Types & enums)
│   ├── notification-drawer/
│   │   ├── notification-drawer.component.ts
│   │   ├── notification-drawer.component.html
│   │   ├── notification-drawer.component.scss
│   │   └── notification-drawer.component.spec.ts
│   └── header/
│       ├── header.component.ts              (Updated)
│       ├── header.component.html            (Updated)
│       └── header.component.scss            (Updated)
```

### Key Integration Points

#### HeaderComponent
- Initializes the notification service on app load
- Manages notification drawer visibility
- Displays unread count badge
- Shows connection status indicator

#### NotificationDrawerComponent
- Displays all notifications in a side panel
- Allows marking individual notifications as read
- Mark all as read functionality
- Clear all notifications feature
- Shows connection status

#### NotificationService
- Manages Socket.io connection
- Handles all notification events
- Provides RxJS observables for reactive components
- Auto-reconnect on connection loss
- Browser notification support

## Usage in Other Components

To use notifications in any component:

```typescript
import { Component, OnInit } from '@angular/core';
import { NotificationService } from './api-services/notification/notification.service';

@Component({...})
export class MyComponent implements OnInit {
  notifications$ = this.notificationService.getNotifications();
  unreadCount$ = this.notificationService.unreadCount$;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    // Notifications are automatically fetched
    this.notifications$.subscribe(notifications => {
      console.log('Current notifications:', notifications);
    });
  }

  handleNotification(notification: any) {
    // Do something with notification
  }
}
```

## Troubleshooting

### "Cannot connect to notification service"
- ✅ Check backend is running on configured URL
- ✅ Check CORS is enabled on backend
- ✅ Check browser console for errors
- ✅ Verify auth token is valid

### Notifications not appearing
- ✅ Check backend is emitting correct Socket.io events
- ✅ Verify event names match those in `SocketEvents` enum
- ✅ Check browser console for warnings

### Badge not updating
- ✅ Ensure notifications have `read: false` for unread
- ✅ Check NotificationService is connected

### Browser notifications not showing
- ✅ User might need to grant permission
- ✅ Check browser notification settings
- ✅ Only works on HTTPS in production

## Advanced Usage

### React to Specific Notification Events

```typescript
// In NotificationService, you can add custom handlers
// Or listen to specific types in components:

this.notifications$.pipe(
  filter(notifications => 
    notifications.some(n => n.type === 'success')
  )
).subscribe(notifications => {
  console.log('Success notifications:', notifications);
});
```

### Custom Notification Handling

Extend NotificationService for custom behavior:

```typescript
// In your service or component:
this.notificationService.on('notification:created', (data) => {
  // Custom handler
  console.log('Custom handler:', data);
});
```

### Styled Notifications

The drawer component uses SCSS with CSS variables. Customize in:
- [notification-drawer.component.scss](src/app/shared/notification-drawer/notification-drawer.component.scss)
- [header.component.scss](src/app/shared/header/header.component.scss)

## Next Steps

1. ✅ Backend should emit Socket.io notifications
2. ✅ Test connection using browser DevTools Network tab
3. ✅ Verify notifications appear in the drawer
4. ✅ Customize styles to match your branding
5. ✅ Add notification actions/interactions as needed

## Documentation Files

- 📖 Full setup guide: [NOTIFICATION_SETUP.md](../NOTIFICATION_SETUP.md)
- 📝 Type definitions: [notification.types.ts](src/app/shared/types/notification.types.ts)
- 💻 Service implementation: [notification.service.ts](src/app/api-services/notification/notification.service.ts)

---

**Need help?** Check the service tests or component code for examples!
