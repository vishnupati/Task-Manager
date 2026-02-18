# Notification System Integration Guide

This guide explains how to use the Socket.io real-time notification system that has been integrated into your Task Manager application.

## Architecture Overview

The notification system consists of three main parts:

1. **NotificationService** - Core service that manages Socket.io connection and real-time updates
2. **NotificationDrawerComponent** - UI component displaying notifications as a side drawer
3. **HeaderComponent** - Updated with notification icon and badge

## Files Created/Modified

### New Files:
- `src/app/api-services/notification/notification.service.ts` - Main notification service
- `src/app/api-services/notification/notification.service.spec.ts` - Service tests
- `src/app/shared/types/notification.types.ts` - TypeScript types and enums
- `src/app/shared/notification-drawer/notification-drawer.component.ts` - Drawer component
- `src/app/shared/notification-drawer/notification-drawer.component.html` - Drawer template
- `src/app/shared/notification-drawer/notification-drawer.component.scss` - Drawer styles
- `src/app/shared/notification-drawer/notification-drawer.component.spec.ts` - Component tests

### Modified Files:
- `src/app/shared/header/header.component.ts` - Added notification icon and drawer logic
- `src/app/shared/header/header.component.html` - Added notification button UI
- `src/app/shared/header/header.component.scss` - Added notification icon styles
- `package.json` - Added socket.io-client dependency

## Installation

1. Install dependencies:
```bash
npm install
```

This will install `socket.io-client` v4.8.0 along with other required packages.

## Configuration

### Backend Connection URL

The notification service connects to your backend at:
```
http://localhost:8000
```

To change the backend URL, update the connection in [src/app/shared/header/header.component.ts](src/app/shared/header/header.component.ts#L29):

```typescript
this.notificationService.connect('http://localhost:8000', token);
```

### Authentication Token

The service uses a JWT token from localStorage:
```typescript
const token = localStorage.getItem('auth_token') || 'default-token';
```

Make sure your app stores the auth token in localStorage with the key `auth_token`.

## Features

### 1. Real-time Notifications
- Automatic connection to Socket.io server on component initialization
- Auto-reconnect with exponential backoff (max 5 attempts)
- Connection status indicator in header and drawer

### 2. Notification Types
Supported notification types with icons:
- **info** 📬 - General information
- **success** ✅ - Success messages
- **warning** ⚠️ - Warning messages
- **error** ❌ - Error messages

### 3. Socket Events Handled
The service automatically handles these backend events:

#### Notification Events:
- `notification:created` - New notification received
- `notification:updated` - Notification updated
- `notification:read` - Notification marked as read
- `notification:all-read` - All notifications marked as read

#### Application Events:
- `application:created` - Application submitted
- `application:approved` - Application approved
- `application:rejected` - Application rejected
- `application:updated` - Application updated

#### Upgrade Request Events:
- `upgrade_request:created` - Upgrade request created
- `upgrade_request:approved` - Upgrade approved
- `upgrade_request:rejected` - Upgrade rejected
- `upgrade_request:updated` - Upgrade updated

#### Email Events:
- `email:sent` - Email sent successfully
- `email:failed` - Email failed to send

#### Status Events:
- `status:updated` - Status updated

### 4. Unread Count Badge
- Displays unread notification count on notification icon
- Shows "99+" for more than 99 unread notifications
- Animates in/out when count changes

### 5. Connection Status Indicator
- Green dot (online) when connected to server
- Red dot (offline) when disconnected
- Shows connection status in drawer footer

### 6. Browser Notifications
- Requests browser notification permission on app load
- Shows native browser notifications for new messages
- Only works if user grants permission

## Usage

### Using NotificationService Directly

```typescript
import { NotificationService } from './api-services/notification/notification.service';

constructor(private notificationService: NotificationService) {}

// Connect to notification service
ngOnInit() {
  const token = localStorage.getItem('auth_token');
  this.notificationService.connect('http://localhost:8000', token);
}

// Get notifications as observable
notifications$ = this.notificationService.getNotifications();

// Get unread count
unreadCount$ = this.notificationService.unreadCount$;

// Mark notification as read
markAsRead(notificationId: string) {
  this.notificationService.markAsRead(notificationId);
}

// Mark all as read
markAllAsRead() {
  this.notificationService.markAllAsRead();
}

// Check connection status
isConnected = this.notificationService.isConnected();

// Disconnect
disconnect() {
  this.notificationService.disconnect();
}
```

### In Templates

```html
<!-- Get unread count -->
<span>{{ unreadCount$ | async }}</span>

<!-- Get notifications list -->
<div *ngFor="let notification of (notifications$ | async)">
  <h4>{{ notification.title }}</h4>
  <p>{{ notification.message }}</p>
</div>

<!-- Get connection status -->
<div *ngIf="(status$ | async) as status">
  {{ status.connected ? 'Connected' : 'Disconnected' }}
</div>
```

## Component Integration

The notification system is typically integrated into the header component:

```typescript
export class HeaderComponent implements OnInit {
  isNotificationDrawerOpen = false;
  unreadCount$: Observable<number>;
  status$: Observable<any>;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    const token = localStorage.getItem('auth_token') || 'default-token';
    this.notificationService.connect('http://localhost:8000', token);
    this.notificationService.requestNotificationPermission();
  }

  toggleNotificationDrawer() {
    this.isNotificationDrawerOpen = !this.isNotificationDrawerOpen;
  }
}
```

## Styling

The notification system uses SCSS and includes:

- **Notification Button**: Icon with badge and status indicator
- **Notification Drawer**: Side panel with smooth animations
- **Notification Items**: Unread state styling with visual indicators
- **Connection Status**: Color-coded status display
- **Responsive Design**: Works on mobile and desktop

All styles are scoped to components and won't conflict with your existing styles.

## Troubleshooting

### Connection Not Establishing

1. Check backend server is running on http://localhost:8000
2. Verify CORS is enabled on backend
3. Check auth token is stored in localStorage
4. Check browser console for error messages

### Missing Notifications

1. Verify backend is emitting Socket.io events correctly
2. Check event names match the `SocketEvents` enum in `notification.types.ts`
3. Ensure auth token is valid

### Browser Notifications Not Showing

1. May need to request permission: `Notification.requestPermission()`
2. Check browser notification settings
3. Browser notifications only work on HTTPS in production

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile Browsers: Full support with responsive UI

## Performance Considerations

- Uses RxJS Observables for efficient change detection
- Implements trackBy function for list optimization
- Automatically cleans up subscriptions on destroy
- Handles reconnection automatically

## Future Enhancements

Consider adding:
- Local storage persistence of notifications
- Sound notifications
- Notification categories/filtering
- Notification actions/interactions
- Analytics tracking
- Timezone-aware notification times
