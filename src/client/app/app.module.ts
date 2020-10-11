import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { UsernameComponent } from './username/username.component';
import { FormsModule } from '@angular/forms';
import { CreateRoomComponent } from './create-room/create-room.component';
import { RoomComponent } from './room/room.component';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';

const config: SocketIoConfig = { url: '', options: { autoConnect: false } };

@NgModule({
    declarations: [
        AppComponent,
        UsernameComponent,
        CreateRoomComponent,
        RoomComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        HttpClientModule,
        SocketIoModule.forRoot(config),
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
