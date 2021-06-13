import { Injectable } from '@angular/core';
import { MeshService } from 'src/app/services/mesh.service';
import { Mouse3DPositionService } from './mouse3dposition.service';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root',
})
export class ContourRetrieverService {
  private scene: THREE.Scene;
  constructor(
    private mouseService: Mouse3DPositionService,
    private meshService: MeshService
  ) {
    this.meshService
      .onContourChanged()
      .subscribe((polys) => this.addPolys(polys));

    this.mouseService.getMeshMousePosListener().subscribe((xyz) => {
      if (xyz.z != this.lastZ) {
        this.meshService.mousePosChanged(xyz);
        this.lastZ = xyz.z;
      }
    });
  }

  addPolys(polys: THREE.Vec2[][]): void {
    if (!!this.polygonsMesh) this.scene.remove(this.polygonsMesh);
    let points = [];
    polys.forEach((poly) => {
      for (let i = 0; i < poly.length; i++) {
        points.push(poly[i]);
        points.push(poly[(i + 1) % poly.length]);
      }
    });
    let geometry = new THREE.BufferGeometry().setFromPoints(points);
    geometry.translate(0, 0, this.lastZ);
    let material = new THREE.MeshBasicMaterial({
      color: 0x4a3d1b,
    });
    this.polygonsMesh = new THREE.LineSegments(geometry, material);
    this.scene.add(this.polygonsMesh);
  }

  public init(scene: THREE.Scene) {
    this.scene = scene;
  }

  private lastZ: number = -1;
  private polygonsMesh: THREE.LineSegments;
}
