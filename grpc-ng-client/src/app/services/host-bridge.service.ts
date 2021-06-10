import { Injectable } from '@angular/core';

import { MeshSlicerClient } from '../generated/MeshUtilsServiceClientPb';
import { Mesh, MeshID, OkReply } from '../generated/MeshUtils_pb';
@Injectable({
  providedIn: 'root',
})
export class HostBridgeService {
  constructor() {
    this.gRpcClient = new MeshSlicerClient(
      'http://' + window.location.hostname + ':8080'
    );
  }

  public releaseUuid(meshUuid: number) {
    let meshId = new MeshID();
    meshId.setUuid(meshUuid);
    this.gRpcClient.releaseMesh(meshId, {}).then((okReply) => {
      console.log(`released ${meshId}`);
    });
  }

  public uploadMesh(mesh: Mesh): Promise<MeshID> {
    return this.gRpcClient.uploadMesh(mesh, {});
  }

  keepAlive(meshUuid: number): Promise<OkReply> {
    let meshId = new MeshID();
    meshId.setUuid(meshUuid);
    return this.gRpcClient.keepAlive(meshId, {});
  }

  private gRpcClient: MeshSlicerClient;
}
