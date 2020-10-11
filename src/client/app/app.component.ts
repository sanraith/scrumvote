import { Component, OnInit } from '@angular/core';
import RandomNumberResponse from 'src/shared/randomNumberResponse';
import { RandomNumberService } from './services/random-number.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = 'fullstack-angular-app';
    number?: number;

    constructor(private randomNumberService: RandomNumberService) { }

    ngOnInit(): void {
        this.number = null;
        this.randomNumberService.getDiceRoll().subscribe(resp => {
            this.number = resp.number;
        });
    }
}
