import { Routes } from '@angular/router';
import { TaskManagerComponent } from './task-manager/task-manager.component';
import { AddEditTaskComponent } from './add-edit-task/add-edit-task.component';

export const routes: Routes = [
    {
        path: "", component: TaskManagerComponent
    },
    {
        path: "add-task", component: AddEditTaskComponent
    },
    {
        path: "edit-task/:taskId", component: AddEditTaskComponent
    }
];
