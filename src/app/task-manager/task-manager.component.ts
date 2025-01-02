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
}
