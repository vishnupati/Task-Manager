import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { ConnectionStatus, SocketEvents } from '../../shared/types/notification.types';
import type { Notification } from '../../shared/types/notification.types';
import path from 'node:path';

@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    private socket: Socket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    private notificationsSubject = new BehaviorSubject<Notification[]>([]);
    public notifications$ = this.notificationsSubject.asObservable();

    private statusSubject = new BehaviorSubject<ConnectionStatus>({
        connected: false,
        shouldReconnect: true,
    });
    public status$ = this.statusSubject.asObservable();

    private unreadCountSubject = new BehaviorSubject<number>(0);
    public unreadCount$ = this.unreadCountSubject.asObservable();

    constructor() { }

    /**
     * Initialize socket connection with authentication
     */
    connect(serverUrl: string, token: string): void {
        console.log('🔌 Connecting to notification service...', serverUrl, token);
        if (this.socket?.connected) {
            return;
        }

        try {
            // If serverUrl contains a path (for example: http://host/api/v1/notifications),
            // socket.io-client will interpret that path as the *namespace* which causes
            // "Invalid namespace" when the server doesn't register it. Detect a pathname
            // and use the engine.io `path` option instead while connecting to the base URL.
            let urlToUse = serverUrl;
            let socketPath: string | undefined;

            try {
                const parsed = new URL(serverUrl);
                if (parsed.pathname && parsed.pathname !== '/') {
                    urlToUse = `${parsed.protocol}//${parsed.host}`;
                    socketPath = parsed.pathname.endsWith('/')
                        ? `${parsed.pathname}socket.io`
                        : `${parsed.pathname}/socket.io`;
                }
            } catch (e) {
                // serverUrl might be a host-only string — ignore URL parsing errors
            }

            const opts: any = {
                // path: "/api/v1/notifications",
                auth: { token },
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: this.maxReconnectAttempts,
                transports: [ 'websocket', 'polling' ],
            };

            if (socketPath) {
                opts.path = socketPath;
                console.log('Using proxied socket path:', socketPath);
            }

            console.log('Socket.IO connect ->', urlToUse, opts);
            this.socket = io(urlToUse, opts);

            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to initialize socket connection:', error);
            this.statusSubject.next({
                connected: false,
                shouldReconnect: true,
                error: 'Failed to initialize connection',
            });
        }
    }
    /**
     * Initialize socket connection with authentication
     */
    Userconnect(serverUrl: string, token: string): void {
        // Backwards-compatible alias — reuse `connect` implementation so path handling
        // and logging remain consistent.
        this.connect(serverUrl, token);
    }

    /**
     * Setup all Socket.io event listeners
     */
    private setupEventListeners(): void {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', this.onConnect.bind(this));
        this.socket.on('disconnect', this.onDisconnect.bind(this));
        this.socket.on('connect_error', this.onConnectError.bind(this));

        // Notification events
        this.socket.on(SocketEvents.NOTIFICATION_CREATED, this.onNotificationCreated.bind(this));

        // Application events
        this.socket.on(SocketEvents.APPLICATION_CREATED, this.onApplicationCreated.bind(this));
        this.socket.on(SocketEvents.APPLICATION_APPROVED, this.onApplicationApproved.bind(this));
        this.socket.on(SocketEvents.APPLICATION_REJECTED, this.onApplicationRejected.bind(this));
        this.socket.on(SocketEvents.APPLICATION_UPDATED, this.onApplicationUpdated.bind(this));

        // Upgrade request events
        this.socket.on(SocketEvents.UPGRADE_REQUEST_CREATED, this.onUpgradeRequestCreated.bind(this));
        this.socket.on(
            SocketEvents.UPGRADE_REQUEST_APPROVED,
            this.onUpgradeRequestApproved.bind(this)
        );
        this.socket.on(
            SocketEvents.UPGRADE_REQUEST_REJECTED,
            this.onUpgradeRequestRejected.bind(this)
        );
        this.socket.on(
            SocketEvents.UPGRADE_REQUEST_UPDATED,
            this.onUpgradeRequestUpdated.bind(this)
        );

        // Status events
        this.socket.on(SocketEvents.STATUS_UPDATED, this.onStatusUpdated.bind(this));

        // membership Approved
        this.socket.on(SocketEvents.MEMBERSHIP_APPROVED, this.onMembershipApproved.bind(this));
    }

    // ========== Connection Handlers ==========

    private onConnect(): void {
        console.log('✅ Connected to notification service');
        this.reconnectAttempts = 0;
        this.statusSubject.next({
            connected: true,
            shouldReconnect: true,
        });
    }

    private onDisconnect(reason: string): void {
        console.warn('❌ Disconnected from notification service:', reason);
        this.statusSubject.next({
            connected: false,
            shouldReconnect: true,
        });
    }

    private onConnectError(error: any): void {
        console.error('❌ Connection error:', error);
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            this.statusSubject.next({
                connected: false,
                shouldReconnect: false,
                error: 'Could not connect to notification service',
            });
        }
    }

    // ========== Notification Event Handlers ==========

    private onNotificationCreated(notification: Notification): void {
        console.log('📬 New notification:', notification);
        const current = this.notificationsSubject.value;
        this.notificationsSubject.next([ notification, ...current ]);
        this.updateUnreadCount();
        this.showBrowserNotification(notification.title, notification.message);
    }

    private onNotificationUpdated(notification: Notification): void {
        console.log('✏️ Notification updated:', notification);
        const current = this.notificationsSubject.value;
        const updated = current.map((n) => (n.id === notification.id ? notification : n));
        this.notificationsSubject.next(updated);
        this.updateUnreadCount();
    }

    private onNotificationRead(notification: Notification): void {
        console.log('👁️ Notification marked as read:', notification);
        const current = this.notificationsSubject.value;
        const updated = current.map((n) => (n.id === notification.id ? notification : n));
        this.notificationsSubject.next(updated);
        this.updateUnreadCount();
    }

    private onAllNotificationsRead(): void {
        console.log('👁️ All notifications marked as read');
        const current = this.notificationsSubject.value;
        const updated = current.map((n) => ({ ...n, read: true }));
        this.notificationsSubject.next(updated);
        this.updateUnreadCount();
    }

    // ========== Application Event Handlers ==========

    private onApplicationCreated(event: any): void {
        console.log('📄 Application created:', event);
        this.addNotification({
            id: event.id,
            userId: event.userId,
            title: 'New Application',
            message: event.message,
            type: 'info',
            read: false,
            data: event,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    private onApplicationApproved(event: any): void {
        console.log('✅ Application approved:', event);
        this.addNotification({
            id: event.id,
            userId: event.userId,
            title: 'Application Approved',
            message: event.message,
            type: 'success',
            read: false,
            data: event,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    private onApplicationRejected(event: any): void {
        console.log('❌ Application rejected:', event);
        this.addNotification({
            id: event.id,
            userId: event.userId,
            title: 'Application Rejected',
            message: event.message,
            type: 'error',
            read: false,
            data: event,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    private onApplicationUpdated(event: any): void {
        console.log('✏️ Application updated:', event);
    }

    // ========== Upgrade Request Event Handlers ==========

    private onUpgradeRequestCreated(event: any): void {
        console.log('📈 Upgrade request created:', event);
        this.addNotification({
            id: event.id,
            userId: event.userId,
            title: 'New Upgrade Request',
            message: event.message,
            type: 'info',
            read: false,
            data: event,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    private onUpgradeRequestApproved(event: any): void {
        console.log('✅ Upgrade request approved:', event);
        this.addNotification({
            id: event.id,
            userId: event.userId,
            title: 'Upgrade Approved',
            message: event.message,
            type: 'success',
            read: false,
            data: event,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    private onUpgradeRequestRejected(event: any): void {
        console.log('❌ Upgrade request rejected:', event);
        this.addNotification({
            id: event.id,
            userId: event.userId,
            title: 'Upgrade Rejected',
            message: event.message,
            type: 'error',
            read: false,
            data: event,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    private onUpgradeRequestUpdated(event: any): void {
        console.log('✏️ Upgrade request updated:', event);
    }

    // ========== Email Event Handlers ==========

    private onEmailSent(event: any): void {
        console.log('📧 Email sent:', event);
        this.addNotification({
            id: event.id,
            userId: event.userId,
            title: 'Email Sent',
            message: `Email sent to ${event.recipientEmail}`,
            type: 'success',
            read: false,
            data: event,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    private onEmailFailed(event: any): void {
        console.log('📧❌ Email failed:', event);
        this.addNotification({
            id: event.id,
            userId: event.userId,
            title: 'Email Failed',
            message: `Failed to send email to ${event.recipientEmail}`,
            type: 'error',
            read: false,
            data: event,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    // ========== Status Event Handlers ==========

    private onStatusUpdated(event: any): void {
        console.log('🔄 Status updated:', event);
    }
    // ========== Status Event Handlers ==========

    private onMembershipApproved(event: any): void {
        console.log('🔄 Status updated:', event);
        localStorage.setItem("token", event.tokens)
    }

    // ========== Public Methods ==========

    /**
     * Add notification to the list
     */
    private addNotification(notification: Notification): void {
        const current = this.notificationsSubject.value;
        this.notificationsSubject.next([ notification, ...current ]);
        this.updateUnreadCount();
        this.showBrowserNotification(notification.title, notification.message);
    }

    /**
     * Mark notification as read
     */
    markAsRead(notificationId: string): void {
        const current = this.notificationsSubject.value;
        const updated = current.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
        );
        this.notificationsSubject.next(updated);
        this.updateUnreadCount();

        // Emit to backend if needed
        if (this.socket) {
            this.socket.emit('notification:mark-read', { id: notificationId });
        }
    }

    /**
     * Mark all notifications as read
     */
    markAllAsRead(): void {
        const current = this.notificationsSubject.value;
        const updated = current.map((n) => ({ ...n, read: true }));
        this.notificationsSubject.next(updated);
        this.updateUnreadCount();

        // Emit to backend if needed
        if (this.socket) {
            this.socket.emit('notification:mark-all-read');
        }
    }

    /**
     * Clear all notifications
     */
    clearAll(): void {
        this.notificationsSubject.next([]);
        this.updateUnreadCount();
    }

    /**
     * Get unread count
     */
    getUnreadCount(): number {
        return this.notificationsSubject.value.filter((n) => !n.read).length;
    }

    /**
     * Update unread count subject
     */
    private updateUnreadCount(): void {
        const count = this.getUnreadCount();
        this.unreadCountSubject.next(count);
    }

    /**
     * Show browser notification
     */
    private showBrowserNotification(title: string, message: string): void {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: '/notification-icon.png',
            });
        }
    }

    /**
     * Request browser notification permission
     */
    requestNotificationPermission(): void {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    /**
     * Disconnect from socket
     */
    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    /**
     * Get current connection status
     */
    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }

    /**
     * Get notifications as observable
     */
    getNotifications(): Observable<Notification[]> {
        return this.notifications$;
    }

    /**
     * Get current notifications
     */
    getCurrentNotifications(): Notification[] {
        return this.notificationsSubject.value;
    }
}
