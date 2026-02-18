import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../api-services/notification/notification.service';
import { NotificationDrawerComponent } from '../notification-drawer/notification-drawer.component';
import { environment } from '../../../environments/environment';
import { Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ CommonModule, NotificationDrawerComponent ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit, OnDestroy {
  isNotificationDrawerOpen = false;
  unreadCount$: Observable<number>;
  status$: Observable<any>;
  private destroy$ = new Subject<void>();

  constructor(private notificationService: NotificationService) {
    this.unreadCount$ = this.notificationService.unreadCount$;
    this.status$ = this.notificationService.status$;
  }

  ngOnInit(): void {
    // Initialize notification connection
    const token = localStorage.getItem('auth_token') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtbGplb2ZpaTAwMDBuY3Y1b2J6aGczN28iLCJmdWxsTmFtZSI6IlN1cGVyIEFkbWluIiwiZW1haWwiOiJsaWZyaWNhbHRkQGdtYWlsLmNvbSIsInJvbGUiOiJTdXBlckFkbWluIiwiY291bnRyeUNvZGUiOiI5MSIsImlhdCI6MTc3MTQyMDA5MSwiZXhwIjoxNzcxNTA2NDkxLCJ0eXBlIjoiYWNjZXNzIn0.NoPoVeOGnKBYwkxR_pyhCraWQ6dd8ALBkUbdkPuc9XE';
    this.notificationService.connect(environment.notificationServiceUrl, token);
    // `Userconnect` kept for backward-compatibility; prefer `connect` with the notifications URL.
    this.notificationService.Userconnect(environment.userserviceLiveUrl, token);
    this.notificationService.requestNotificationPermission();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Toggle notification drawer
   */
  toggleNotificationDrawer(): void {
    this.isNotificationDrawerOpen = !this.isNotificationDrawerOpen;
  }

  /**
   * Close notification drawer
   */
  closeNotificationDrawer(): void {
    this.isNotificationDrawerOpen = false;
  }
}
