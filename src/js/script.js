const wrapper = document.querySelector('.canvas');
const renderer = new THREE.WebGLRenderer({ alpha: true });
wrapper.appendChild(renderer.domElement);

renderer.setSize( window.innerWidth, window.innerHeight );

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0, 1, 5);
const grid   = new THREE.GridHelper(10, 5);

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );

const loader = new THREE.GLTFLoader();
const url = '/glb/kari.glb';
loader.load(url, (data) => {
    const gltf = data;
    const object = gltf.scene;
    scene.add(object);
});

scene.add(grid, cube);

const loop = () => {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render( scene, camera );
    window.requestAnimationFrame( loop ); 
}
window.requestAnimationFrame( loop );
