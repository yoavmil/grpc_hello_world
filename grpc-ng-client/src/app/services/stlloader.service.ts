import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
// import { Facet } from '../generated/helloworld_pb';
// import { MeshSlicerClient } from '../generated/HelloworldServiceClientPb';
// import { Mesh } from '../generated/helloworld_pb';

@Injectable({
  providedIn: 'root',
})
export class STLLoaderService {
  constructor() {}

  private meshUrlSubject = new Subject<string>();
  public getCurrentFileUrlListener(): Observable<string> {
    return this.meshUrlSubject.asObservable();
  }

  public load(file: File) {
    if (this.stlURL) {
      URL.revokeObjectURL(this.stlURL);
    }
    this.stlURL = URL.createObjectURL(file);
    this.meshUrlSubject.next(this.stlURL);

    // this.uploadStl(file);
  }

  // private uploadStl(file: File) {
  //   // TODO store uuid
  //   let meshSlicerClient: MeshSlicerClient = new MeshSlicerClient(
  //     'http://' + window.location.hostname + ':8080'
  //   );
  //   let mesh: Mesh = new Mesh();
  //   mesh.addFacets(new Facet());
  //   meshSlicerClient.uploadMesh(mesh, {}, (err, response) => {
  //     if (err) console.error(err.message);
  //     else console.log(response.getUuid());
  //   });
  // }

  private stlURL: string;
}
