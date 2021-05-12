import { Component, OnInit } from '@angular/core';
import { STLLoaderService } from '../services/stlloader.service';

@Component({
  selector: 'app-viewer-wrapper',
  templateUrl: './viewer-wrapper.component.html',
  styleUrls: ['./viewer-wrapper.component.css'],
})
export class ViewerWrapperComponent implements OnInit {
  constructor(private stlLoader: STLLoaderService) {}

  ngOnInit(): void {}

  onStlPicked(e: Event) {
    const file: File = (e.target as HTMLInputElement).files[0];
    if (file)
      // undefined in case the user clicked cancel
      this.stlLoader.load(file);
    (e.target as any).value = ''; // clear input cache, to avoid ignoring same file load
    // https://stackoverflow.com/a/54633061/2378218
  }
}
