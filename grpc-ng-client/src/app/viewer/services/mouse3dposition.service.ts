import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import * as THREE from 'three';
import { MeshService } from './mesh.service';

@Injectable({
  providedIn: 'root',
})
export class Mouse3DPositionService {
  // called once at the viewer init stage
  public init(camera: THREE.Camera) {
    this.camera = camera;
  }

  // called each time the mouse moves
  public mouseMove(mousePos: THREE.Vector2) {
    this.mouse = mousePos.clone();
    this.mouseMoved = true;
  }

  // return an observable of the 3D position on the mesh
  public getMeshMousePosListener(): Observable<THREE.Vector3> {
    return this.meshMousePos.asObservable();
  }

  // called each frame
  public update() {
    if (!this.mouseMoved) return;
    if (this.mouse.x < -1 || this.mouse.x > 1) return;
    if (this.mouse.y < -1 || this.mouse.y > 1) return;
    this.mouseMoved = false;

    // create a Ray with origin at the mouse position and direction into the scene (camera direction)
    let vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 1);
    vector.unproject(this.camera);
    let ray = new THREE.Raycaster(
      this.camera.position,
      vector.sub(this.camera.position).normalize()
    );

    let intersects = ray.intersectObject(this.meshService.mesh);

    if (intersects.length > 0) {
      if (!intersects[0].point.equals(this.prevPosition)) {
        this.prevPosition = intersects[0].point;
        this.meshMousePos.next(this.prevPosition);
      }
    }
  }

  constructor(private meshService: MeshService) {}
  private meshMousePos = new Subject<THREE.Vector3>();
  private mouse: THREE.Vector2 = new THREE.Vector2();
  private camera: THREE.Camera;
  private mouseMoved: boolean = false;
  private prevPosition: THREE.Vector3 = new THREE.Vector3();
}
