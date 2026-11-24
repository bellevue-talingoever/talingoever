import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const box=document.getElementById('site3d');
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1;
box.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color('#dcebf5');
const camera=new THREE.PerspectiveCamera(42,1,.1,3000);
const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.maxPolarAngle=Math.PI/2-.03;
controls.minDistance=12;controls.maxDistance=400;
scene.add(new THREE.HemisphereLight(0xffffff,0x798363,2));
const sun=new THREE.DirectionalLight(0xfff3dd,2.5);sun.position.set(-20,70,30);scene.add(sun);
let pending=false;
function need(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;if(controls.update())need();renderer.render(scene,camera);});}
controls.addEventListener('change',need);
function resize(){const w=box.clientWidth,h=box.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();need();}
new ResizeObserver(resize).observe(box);resize();
// The source model uses metres, with the five project homes along x=0..71.
const target=new THREE.Vector3(35,2,10);
function setCam(view){
 const offsets={vogel:[-60,60,80],water:[0,36,-45],boven:[0,110,.1]};
 const offset=new THREE.Vector3(...offsets[view]);
 offset.multiplyScalar(Math.max(1,.95/camera.aspect));
 camera.position.copy(target).add(offset);controls.target.copy(target);controls.update();need();
 document.querySelectorAll('[data-camera]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.camera===view)));
}
document.querySelectorAll('[data-camera]').forEach(b=>b.onclick=()=>setCam(b.dataset.camera));
function zoom(f){const offset=camera.position.clone().sub(controls.target);offset.setLength(THREE.MathUtils.clamp(offset.length()*f,controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(offset);controls.update();need();}
document.querySelector('[data-zoom-in]').onclick=()=>zoom(.82);
document.querySelector('[data-zoom-out]').onclick=()=>zoom(1.22);
renderer.domElement.setAttribute('aria-label','3D-model van woningen en omgeving; sleep om te draaien en gebruik de zoomknoppen om te zoomen');
renderer.domElement.tabIndex=0;
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();window.ZT3DFailed();});
setCam('vogel');
new GLTFLoader().load('./project.glb',gltf=>{
 scene.add(gltf.scene);
 document.getElementById('loading3d')?.remove();
 window.ZT3D={loaded:true,camera:setCam};need();
},e=>{if(e.lengthComputable)document.getElementById('loading3d').textContent=`Het 3D-model wordt geladen… ${Math.round(e.loaded/e.total*100)}%`;},()=>window.ZT3DFailed());

