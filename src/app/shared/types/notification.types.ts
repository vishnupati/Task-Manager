export interface Notification {
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

export interface ConnectionStatus {
    connected: boolean;
    shouldReconnect: boolean;
    error?: string;
}

export enum SocketEvents {
    NOTIFICATION_CREATED = 'notification:created',
    NOTIFICATION_UPDATED = 'notification:updated',
    NOTIFICATION_READ = 'notification:read',
    NOTIFICATION_ALL_READ = 'notification:all-read',
    APPLICATION_CREATED = 'application:created',
    APPLICATION_APPROVED = 'application:approved',
    APPLICATION_REJECTED = 'application:rejected',
    APPLICATION_UPDATED = 'application:updated',
    UPGRADE_REQUEST_CREATED = 'upgrade_request:created',
    UPGRADE_REQUEST_APPROVED = 'upgrade_request:approved',
    UPGRADE_REQUEST_REJECTED = 'upgrade_request:rejected',
    UPGRADE_REQUEST_UPDATED = 'upgrade_request:updated',
    EMAIL_SENT = 'email:sent',
    EMAIL_FAILED = 'email:failed',
    STATUS_UPDATED = 'status:updated',
    MEMBERSHIP_APPROVED = 'membership:approved',
}
