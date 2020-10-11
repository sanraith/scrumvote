import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import RandomNumberResponse from 'src/shared/randomNumberResponse';

@Injectable({
    providedIn: 'root'
})
export class RandomNumberService {
    constructor(private http: HttpClient) { }

    getDiceRoll(): Observable<RandomNumberResponse> {
        return this.http.get<RandomNumberResponse>("api/random/dice");
    }
}
