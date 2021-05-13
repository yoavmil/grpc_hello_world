import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root',
})
export class MeshService {
  constructor() {}
  public mesh: THREE.Mesh;
}
