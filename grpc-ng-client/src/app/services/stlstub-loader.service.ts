import { Injectable } from '@angular/core';
import { STLLoaderService } from './stlloader.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class STLStubLoaderService {
  constructor(private stlLoader: STLLoaderService, private http: HttpClient) {}

  public loadStubSTL() {
    // the STL is in the assets, and it is loaded and converted to a File
    this.http
      .get(this.stlStubURL, {
        responseType: 'arraybuffer',
      })
      .subscribe({
        next: (data) => {
          let blob: Blob = new Blob([data], { type: 'arraybuffer' });
          (blob as any).name = 'heart.stl';
          this.stlLoader.load(blob as File);
        },
        error: (error) => {
          console.error('There was an error!', error.message);
        },
      });
  }

  private readonly stlStubURL: string = 'assets/heart.stl';
}
