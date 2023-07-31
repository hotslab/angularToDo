import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ApiService } from 'src/app/services/api';

@Component({
  selector: 'app-todos',
  template: `
  <div class="container-fluid m-0 p-0 w-full d-flex justify-content-center align-items-center flex-wrap">
    <div *ngFor="let toDo of toDos; let i = index" class="card m-3" style="width: 400px; height: 200px">
      <div class="row g-0">
        <div class="col-md-4" id="image-style" style="background-image: url('../../assets/images/coin.jpg');">
          <!-- <img src="../../assets/images/coin.jpg" class="img-fluid rounded-start" alt="..."> -->
        </div>
        <div class="col-md-8">
          <div class="card-body">
            <h5 class="card-title">{{toDo.title}}</h5>
            <p class="card-text">{{toDo.content}}</p>
            <p class="card-text"><small class="text-body-secondary">Due - {{toDo.due_date | date : 'YYYY-MM-dd HH:mm:ss'}}</small></p>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    #image-style
      height: 200px
      background-size: 100%
      background-size: cover 
      background-position: center
      background-repeat: no-repeat 
  `]
})

export class TodosComponent implements OnInit {

  constructor(
    private http: ApiService,
    private readonly store: Store,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  userId: string | null = null
  toDos: any[] = []
  loading: boolean = false

  getToDos() {
    this.loading = true
    this.http.getRequest({ url: `todo/${this.userId}`, data: null }).subscribe({
      next: (response: any) => {
        this.toDos = response.toDos
        this.loading = false
      },
      error: (error: any) => {
        console.log('Error', error.message)
        this.loading = false
      }
    })
  }

  ngOnInit(): void {
    /* this.route.paramMap.subscribe((params: ParamMap) => {
      this.userId = params.get('id')
    }) */
    this.userId = this.route.snapshot.paramMap.get('id')
    this.getToDos()
  }
}
