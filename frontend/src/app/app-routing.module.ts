import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { UserComponent } from './pages/user/user.component';
import { TodoComponent } from './pages/todo/todo.component';
import { UsersComponent } from './pages/users/users.component';
import { TodosComponent } from './pages/todos/todos.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'users', component: UsersComponent, children: [
      { path: ':id', component: UserComponent },
    ]
  },
  { path: 'todos', component: TodosComponent },
  { path: 'todo', component: TodoComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
