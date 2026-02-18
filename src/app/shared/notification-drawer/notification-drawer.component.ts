import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../api-services/notification/notification.service';
import { Notification, ConnectionStatus } from '../../shared/types/notification.types';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-notification-drawer',
    standalone: true,
    imports: [ CommonModule ],
    templateUrl: './notification-drawer.component.html',
    styleUrls: [ './notification-drawer.component.scss' ],
})
export class NotificationDrawerComponent implements OnInit {
    @Input() isOpen = false;
    @Output() closeDrawer = new EventEmitter<void>();

    notifications$: Observable<Notification[]>;
    status$: Observable<ConnectionStatus>;
    unreadCount$: Observable<number>;

    constructor(private notificationService: NotificationService) {
        this.notifications$ = this.notificationService.getNotifications();
        this.status$ = this.notificationService.status$;
        this.unreadCount$ = this.notificationService.unreadCount$;
    }

    ngOnInit(): void { }

    /**
     * Close the drawer
     */
    close(): void {
        this.closeDrawer.emit();
    }

    /**
     * Mark notification as read
     */
    markAsRead(notification: Notification): void {
        if (!notification.read) {
            this.notificationService.markAsRead(notification.id);
        }
    }

    /**
     * Mark all as read
     */
    markAllAsRead(): void {
        this.notificationService.markAllAsRead();
    }

    /**
     * Clear all notifications
     */
    clearAll(): void {
        this.notificationService.clearAll();
    }

    /**
     * Get notification icon based on type
     */
    getNotificationIcon(type: string): string {
        const icons: { [ key: string ]: string } = {
            info: '📬',
            success: '✅',
            warning: '⚠️',
            error: '❌',
        };
        return icons[ type ] || '🔔';
    }

    /**
     * Track by function for ngFor optimization
     */
    trackByNotificationId(_index: number, notification: Notification): string {
        return notification.id;
    }
}
