import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'nullOrEmpty'
})
export class NullOrEmptyPipe implements PipeTransform {
    transform(value: string): boolean {
        return !value || value.length === 0;
    }
}
