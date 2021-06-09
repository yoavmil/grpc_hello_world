import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { ViewerMeshService } from './viewer.mesh.service';
import { MeshService } from 'src/app/services/mesh.service';

@Injectable({
  providedIn: 'root',
})
export class STLReaderService {
  private get mesh(): THREE.Mesh {
    return this.viewerMeshService.mesh;
  }
  private set mesh(m: THREE.Mesh) {
    this.viewerMeshService.mesh = m;
  }
  private scene: THREE.Scene;

  public init(scene: THREE.Scene) {
    this.scene = scene;
  }

  constructor(
    private viewerMeshService: ViewerMeshService,
    private meshService: MeshService
  ) {
    this.meshService
      .getGeometrySubjectListener()
      .subscribe((geo) => this.readGeometry(geo));
  }
  readGeometry(geometry: THREE.BufferGeometry): void {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh = null;
    }
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
  }
}
