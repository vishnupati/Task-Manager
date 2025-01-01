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
  public allTaskData: any = [
    {
      title: "name",
      description: 'sdlkjskdfjlskdf',
      status: 'pending',
      createdAt: '1-1-2025',
      id: 1
    },
    {
      title: "name",
      description: 'sdlkjskdfjlskdf',
      status: 'pending',
      createdAt: '1-1-2025',
      id: 2
    },
    {
      title: "name",
      description: 'sdlkjskdfjlskdf',
      status: 'pending',
      createdAt: '1-1-2025',
      id: 3
    },
    {
      title: "name",
      description: 'sdlkjskdfjlskdf',
      status: 'pending',
      createdAt: '1-1-2025',
      id:4
    },
  ];;

  constructor(
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    alert();
    this.getAllTask();
  }
  private getAllTask() {
    this.taskService.getTasks().subscribe((taskData: any) => {
      this.allTaskData = [
        {
          title: "name",
          description: 'sdlkjskdfjlskdf',
          status: 'pending',
          createdAt: '1-1-2025'
        },
        {
          title: "name",
          description: 'sdlkjskdfjlskdf',
          status: 'pending',
          createdAt: '1-1-2025'
        },
        {
          title: "name",
          description: 'sdlkjskdfjlskdf',
          status: 'pending',
          createdAt: '1-1-2025'
        },
        {
          title: "name",
          description: 'sdlkjskdfjlskdf',
          status: 'pending',
          createdAt: '1-1-2025'
        },
      ];
    });
  }

  removeTask(taskData: any) {
    this.taskService.deleteTask(taskData.id).subscribe((res: any) => {
      const index = this.allTaskData.findIndex((task: any) => task.id === taskData.id);
      if (index > -1) {
        this.allTaskData.splice(index, 1);
      }
    }, (error: any)=> {
      console.log("error", error);
    });
  }
}
