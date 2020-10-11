import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsernameComponent } from './username/username.component';


const routes: Routes = [
    { path: 'user', component: UsernameComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
