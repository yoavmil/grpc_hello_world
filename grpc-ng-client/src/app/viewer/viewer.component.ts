import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLStubLoaderService } from '../services/stlstub-loader.service';
import { Mouse3DPositionService } from './services/mouse3dposition.service';
import { STLReaderService } from './services/stlreader.service';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css'],
})
export class ViewerComponent implements AfterViewInit {
  @ViewChild('viewerWrapper', { static: false })
  viewerWrapperRef: ElementRef;
  private get canvas(): HTMLDivElement {
    return this.viewerWrapperRef.nativeElement as HTMLDivElement;
  }

  renderer: THREE.WebGLRenderer;

  fps: number = 60;
  camera: THREE.PerspectiveCamera;
  cameraControls: any;
  scene: THREE.Scene;
  ambientLight: THREE.AmbientLight;
  light: THREE.DirectionalLight;
  mesh: THREE.Mesh;

  constructor(
    private stlReader: STLReaderService,
    private stlStubLoader: STLStubLoaderService,
    private mouse3dPos : Mouse3DPositionService
  ) {}

  ngAfterViewInit(): void {
    this.createRenderer();
    this.createScene();
    this.createCamera();
    this.stlReader.init(this.scene);
    this.stlStubLoader.loadStubSTL();
    this.mouse3dPos.init(this.camera);
    this.render();
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    let canvasWidth = this.canvas.clientWidth;
    let canvasHeight = this.canvas.clientHeight;
    this.renderer.setSize(canvasWidth, canvasHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.viewerWrapperRef.nativeElement.appendChild(this.renderer.domElement);
    this.renderer.setClearColor(0x543210);
    this.canvas.onmousemove = event => this.onMouseMove(event);
  }

  createCamera() {
    let ratio = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, ratio, 1, 800);
    this.camera.position.set(-100, 100, 100);
    this.camera.up.set(0, 0, 1);
    this.cameraControls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xaaaaaa);
    this.ambientLight = new THREE.AmbientLight(0x333333); // 0.2

    this.light = new THREE.DirectionalLight(0xffffff, 1.0);
    this.scene.add(this.ambientLight);
    this.scene.add(this.light);
  }

  onMouseMove(event: MouseEvent) {
    let rect = this.canvas.getBoundingClientRect();
    let mousePos: THREE.Vector2 = new THREE.Vector2();
    mousePos.x = (event.offsetX / rect.width) * 2 - 1;
    mousePos.y = -(event.offsetY / rect.height) * 2 + 1;
    this.mouse3dPos.mouseMove(mousePos);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
    this.mouse3dPos.update();

    setTimeout(() => {
      requestAnimationFrame(() => this.render());
    }, 1000 / this.fps);
  }
}
