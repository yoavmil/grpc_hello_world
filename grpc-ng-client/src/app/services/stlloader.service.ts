import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class STLLoaderService {
  constructor() {}

  private meshUrlSubject = new Subject<string>();
  public getCurrentFileUrlListener(): Observable<string> {
    return this.meshUrlSubject.asObservable();
  }

  public load(file: File) {
    if (this.stlURL) {
      URL.revokeObjectURL(this.stlURL);
    }
    this.stlURL = URL.createObjectURL(file);
    this.meshUrlSubject.next(this.stlURL);
  }

  private stlURL: string;
}
