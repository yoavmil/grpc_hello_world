# The Purpose
The target of this project is to learn how to use gRPC. 
For that I will write an Angular Client that loads an 3D STL model, using ThreeJS.
And then send that model to the server. The server will load the model and save it in a raw form, ready for client queries.
The frontend will track the mouse movement, and sample the Z position of the mouse on the mesh and query the server for
the polygon at that Z. The client will display the polygons.
This should work with several concurrent clients, each with a different STL.
I will learn
* how to have a FE and BE project side by side in one repo.
* how to compile protos and gRPC to JS or TS
* how to use sync and async gPRC calls
* how to keep a server state alive
* how to have multiple servers alive
* how to send a blob (binary data) via Protobuf (`bytes`)

# Next Steps
* build an Angular client

  * ~~move content in `src/` to `src/be`~~
  * ~~create subfolder `src/fe` and init it with an Angular project~~
  * ~~add `ThreeJs`~~
  * ~~open mesh from disk~~
  * ~~track 3D position of the mouse~~

* gRPC STL calls

  * Add gRPC call for opening an STL blob, returning an unique ID
  * Add gRPC call for releasing that loaded mesh by unique ID.
  * Add server timeout for releasing anyways
  * Add client-server keep-alive mechanism - on that unique ID
  * upon reading new STL, release old STL (FE)

* `amlib`

  * merge and update `amlib`
  * support keeping raw data

  * support one height slice

* gRPC slice call

  * add gRPC call for slicing at height, returning polygons
  * display polygons at FE

### commands
`cmake -S . -B build -DCMAKE_TOOLCHAIN_FILE=C:/Users/User/source/repos/vcpkg/scripts/buildsystems/vcpkg.cmake`
`cmake --build build`
`.\build\src\Debug\main.exe`