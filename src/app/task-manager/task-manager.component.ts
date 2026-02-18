import { CommonModule, CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { map, Observable, Subscription } from 'rxjs';
import { TaskService } from '../api-services/task/task.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-task-manager',
  imports: [NgIf, NgFor, CommonModule, RouterLink],
  templateUrl: './task-manager.component.html',
  styleUrl: './task-manager.component.scss'
})
export class TaskManagerComponent implements OnInit, OnDestroy {
  public allTaskData: any = [];
  public loading: boolean = true;

   private subscriptions: Subscription[] = [];
  constructor(
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.getAllTask();
    // this.getCounrtryList()
  }
  private getAllTask() {
    this.subscriptions.push(
      this.taskService.getTasks().subscribe((taskData: any) => {
        this.allTaskData = taskData;
        this.loading = false;
      }, (error: any) => {
        this.loading = false;
        console.log("Error", error);
      })
    );
  }

  removeTask(taskData: any) {
    this.subscriptions.push(
      this.taskService.deleteTask(taskData._id).subscribe((res: any) => {
        const index = this.allTaskData.findIndex((task: any) => task.id === taskData.id);
        if (index > -1) {
          this.allTaskData.splice(index, 1);
        }
      }, (error: any) => {
        console.log("error", error);
      })
    );
  }

  onStatusChange(event: any, taskData: any) {
    const isChecked = (event.target as HTMLInputElement).checked;
    taskData.status = isChecked ? 'Completed' : 'Pending';
    this.subscriptions.push(
      this.taskService.updateTask(taskData._id, taskData).subscribe(() => {
      }, error => {
        console.error('error', error);
      })
    );
  }

  
  ngOnDestroy(): void {
    this.subscriptions.map( subscriber => {
      subscriber.unsubscribe();
    }); 
  }

  addAudit() {
    const auditData = {
  "userId": "cmjnxihsr000008v5xxzzx96o",
  "role": "User", //e.g. "Admin", "User", "Member", "SuperAdmin"
  "eventType": "Login", //e.g. "Registration", "Login", "Approved", "Rejected", "Inactive", "Suspended", "Deleted", "Updated", "Created", "Deleted", "Updated",
  "entityType": "Users", //e.g. "Applications" , "Users", "Tiers" , "Upgrade-requests"
  "entityId": "cmjnxihsr000008v5xxzzx96o", // 
  "status": "Success", // e.g., "Success", "Failure", "Viewed", "Initiated"
  "message": "User logged in successfully", // e.g., "User logged in successfully", "Failed to log in", "Login pending",
  "source": "Frontend", //e.g. "Frontend" or "Backend"
  "ipAddress": "192.168.1.25",
  "browser": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", // e.g. Browser name
  "platform": "Browser", //e.g. OS platform 
  "deviceType": "Desktop" //e.g. "Desktop", "Mobile", "Tablet"
}
    this.taskService.addAudit(auditData).subscribe((res: any) => {
      console.log('Audit added:', res);
    }, (error: any) => {
      console.error('Error adding audit:', error);
    });
  }

  getCounrtryList() {
    this.taskService.getCountryList().subscribe((res: any) => {
      console.log('Country list:', res);
    }, (error: any) => {
      console.error('Error fetching country list:', error);
    });
  }
}
