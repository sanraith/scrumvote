import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateRoomComponent } from './create-room/create-room.component';
import { RoomComponent } from './room/room.component';
import { UsernameComponent } from './username/username.component';


const routes: Routes = [
    { path: 'user', component: UsernameComponent },
    { path: 'createRoom', component: CreateRoomComponent },
    { path: 'room/:id', component: RoomComponent },
    { path: '', redirectTo: '/home', pathMatch: 'full' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
