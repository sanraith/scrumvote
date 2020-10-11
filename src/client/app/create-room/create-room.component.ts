import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CREATE_ROOM_API } from 'src/shared/paths';
import { CreateRoomRequest, CreateRoomResponse } from 'src/shared/roomResponses';

@Component({
    selector: 'app-create-room',
    templateUrl: './create-room.component.html',
    styleUrls: ['./create-room.component.scss']
})
export class CreateRoomComponent implements OnInit {
    roomName: string;
    isBusy = false;

    constructor(private router: Router, private http: HttpClient) { }

    ngOnInit(): void { }

    submit(): void {
        this.isBusy = true;
        const request = <CreateRoomRequest>{ name: this.roomName }
        this.http.post<CreateRoomResponse>(CREATE_ROOM_API, request).subscribe(resp => {
            if (resp.success) {
                this.router.navigate(["room", resp.id]);
            } else {
                alert(resp.error);
            }

            this.isBusy = false;
        });
    }
}
