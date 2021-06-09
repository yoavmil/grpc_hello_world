import { ThrowStmt } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { Facet, Mesh, Vec3 } from '../generated/MeshUtils_pb';
import { HostBridgeService } from './host-bridge.service';
import { STLLoaderService } from './stlloader.service';

@Injectable({
  providedIn: 'root',
})
export class MeshService {
  private meshUuid: number = -1;

  private geometrySubject = new Subject<THREE.BufferGeometry>();
  public getGeometrySubjectListener(): Observable<THREE.BufferGeometry> {
    return this.geometrySubject.asObservable();
  }

  constructor(
    private stlLoader: STLLoaderService,
    private hostBridge: HostBridgeService
  ) {
    this.stlLoader
      .getCurrentFileUrlListener()
      .subscribe((url: string) => this.readStl(url));
  }
  private readStl(url: string) {
    if (this.meshUuid != -1) {
      this.hostBridge.releaseUuid(this.meshUuid);
      this.meshUuid = -1;
    }

    const loader = new STLLoader();
    loader.load(url, (geometry: THREE.BufferGeometry) => {
      this.geometrySubject.next(geometry);
      let positions = geometry.getAttribute('position');
      let mesh: Mesh = new Mesh();
      for (var f = 0; f < positions.array.length / 9; f++) {
        let facet: Facet = new Facet();
        for (var v = 0; v < 3; v++) {
          let vertex = new Vec3();
          vertex.setX(positions.array[f * 9 + v * 3 + 0]);
          vertex.setY(positions.array[f * 9 + v * 3 + 1]);
          vertex.setZ(positions.array[f * 9 + v * 3 + 2]);
          switch (v) {
            case 0:
              facet.setV0(vertex);
              break;
            case 1:
              facet.setV1(vertex);
              break;
            case 2:
              facet.setV2(vertex);
              break;
          }
        }
        mesh.addFacets(facet);
      }
      this.hostBridge
        .uploadMesh(mesh)
        .then((meshID) => (this.meshUuid = meshID.getUuid()));
    });
  }
}
