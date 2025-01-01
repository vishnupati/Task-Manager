import { Component, OnInit } from '@angular/core';
import {FormGroup, FormBuilder, Validators, AbstractControl, ReactiveFormsModule, FormControl} from '@angular/forms'
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TaskService } from '../api-services/task/task.service';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-add-edit-task',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-edit-task.component.html',
  styleUrl: './add-edit-task.component.scss'
})
export class AddEditTaskComponent implements OnInit {
  public taskForm: FormGroup = new FormGroup({
    title: new FormControl(),
    description: new FormControl(),
    status: new FormControl(),
    createdAt: new FormControl()
  });
  public taskData: any;
  public submitted = false;
  public loading = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private taskService: TaskService,
    private location: Location,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.activatedRoute.paramMap.subscribe(
        (params: ParamMap) => {
          const taskId = params.get('taskId');
          if (taskId) {
            console.log('inventory id ', taskId)
            this.taskService.getTaskById(taskId).subscribe((res: any) => {
              this.taskData = res;
              console.log(res)
              this.createForm();
            }, error => {
              console.error('error', error);
            });
          } else {
            this.createForm();
          }
        },
      ))
  }

  createForm() {
    this.taskForm = this.fb.group({
      title: [this.taskData?.title ? this.taskData?.title : '', Validators.required],
      description: [this.taskData?.description ? this.taskData?.description : '', ],
      status: [this.taskData?.status ? this.taskData?.status : 'Pending', [Validators.required,]],
      createdAt: [this.taskData?.createdAt ? this.taskData?.createdAt : new Date(), Validators.required],
    })
  }

  get f(): { [key: string]: AbstractControl } {
    return this.taskForm.controls;
  }

  public back() {
    this.location.back();
  }

  public addEditTask() {
    this.loading = true;
    if (this.taskForm.invalid) {
      this.submitted = true;
      this.loading = false;
      return;
    }
    if (this.taskData) {
      this.taskService.updateTask(this.taskData._id, this.taskForm.value).subscribe(() => {
        this.router.navigate(['/']);
        this.taskForm.reset();
        this.loading = false;
      }, error => {
        console.error('error', error);
      });
    } else {
      // this.taskForm.createdAt = new Date();
      this.taskService.addTask(this.taskForm.value).subscribe(res => {
        this.router.navigate(['']);
        this.taskForm.reset();
        this.loading = false;
      }, error => {
        this.loading = false;
        console.error('error', error);
      });
    }
  }
}
