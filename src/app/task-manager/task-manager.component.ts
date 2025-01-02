import { CommonModule, CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { TaskService } from '../api-services/task/task.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-task-manager',
  imports: [NgIf, NgFor, CommonModule, RouterLink],
  templateUrl: './task-manager.component.html',
  styleUrl: './task-manager.component.scss'
})
export class TaskManagerComponent implements OnInit {
  public allTaskData: any = [];
  public loading: boolean = true;

  constructor(
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.getAllTask();
  }
  private getAllTask() {
    this.taskService.getTasks().subscribe((taskData: any) => {
      this.allTaskData = taskData;
      this.loading = false;
    }, (error: any) => {
      this.loading = false;
      console.log("Error", error);
    });
  }

  removeTask(taskData: any) {
    this.taskService.deleteTask(taskData._id).subscribe((res: any) => {
      const index = this.allTaskData.findIndex((task: any) => task.id === taskData.id);
      if (index > -1) {
        this.allTaskData.splice(index, 1);
      }
    }, (error: any)=> {
      console.log("error", error);
    });
  }
}
