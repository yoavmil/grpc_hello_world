import { Injectable } from '@angular/core';
import { STLLoaderService } from '../../services/stlloader.service';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

@Injectable({
  providedIn: 'root',
})
export class STLReaderService {
  public mesh: THREE.Mesh = null;
  private scene: THREE.Scene;

  public init(scene: THREE.Scene) {
    this.scene = scene;
  }

  constructor(private stlLoader: STLLoaderService) {
    this.stlLoader
      .getCurrentFileUrlListener()
      .subscribe((url) => this.readSTL(url));
  }

  private readSTL(url: string) {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh = null;
    }

    const loader = new STLLoader();
    loader.load(url, (geometry: THREE.BufferGeometry) => {
      geometry.computeVertexNormals();
      geometry.computeBoundingBox();

      var material = new THREE.MeshStandardMaterial({
        color: 0x1234560,
        roughness: 0.5,
        metalness: 0.2,
        flatShading: true,
        emissive: 0,
        side: THREE.DoubleSide,
      });
      this.mesh = new THREE.Mesh(geometry, material);

      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;

      this.scene.add(this.mesh);
    });
  }
}