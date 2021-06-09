import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root',
})
export class ViewerMeshService {
  constructor() {}
  public mesh: THREE.Mesh;
}
