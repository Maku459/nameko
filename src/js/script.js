import _ from 'lodash';

const wrapper = document.querySelector('.canvas');
const renderer = new THREE.WebGLRenderer({ alpha: true });
wrapper.appendChild(renderer.domElement);

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.gammaOutput = true;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0, 2, 10);

const gg = new THREE.PlaneBufferGeometry( 100, 100 );
const gm = new THREE.MeshPhongMaterial( { color: 0x7b5544 } );
const ground = new THREE.Mesh( gg, gm );
ground.rotation.x = - Math.PI / 2;
ground.position.y = -0.5;

const light  = new THREE.AmbientLight(0xffffff, 1);

const loader = new THREE.GLTFLoader();
const url = '/glb/nameko5.glb';

let hitcubes;

loader.load(url, (data) => {
    for ( var i = 0; i < 20; i ++ ) {
        const group = new THREE.Group();

        const gltf = data;
        const nameko = gltf.scene.clone();
        group.position.x = Math.random() * 10 - 4;
        group.position.y = 0.2;
        group.position.z = Math.random() * 10 - 4;
        group.rotation.y = Math.random() * 2 * Math.PI;
        nameko.scale.x = 0.5;
        nameko.scale.y = 0.5;
        nameko.scale.z = 0.5;
        nameko.name = 'nameko';
        group.add(nameko);

        const geometry = new THREE.BoxGeometry(0.8,2.0,0.8);
        const material = new THREE.MeshLambertMaterial({color: 0xE9546B, transparent: true, opacity: 0.1});
        const hitcube = new THREE.Mesh( geometry, material );
        hitcube.position.set(nameko.position.x, nameko.position.y + 0.3, nameko.position.z);
        hitcube.name = 'hitcube';
        group.add(hitcube);

        scene.add(group);
    } 
    hitcubes = _(scene.children)
        .map ((value, key, array) => value.getObjectByName('hitcube'))
        .compact()
        .value()
    
    console.log(hitcubes);
});

const controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.userPan = false;
controls.userPanSpeed = 0.0;
controls.maxDistance = 5000.0;
controls.maxPolarAngle = Math.PI * 0.495;
controls.autoRotate = false;
controls.autoRotateSpeed = 1.0;

const raycaster = new THREE.Raycaster();
// マウス座標管理用のベクトルを作成
const mouse = new THREE.Vector2();

function onClick( event ) {
    event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    intersect();
}

console.log(scene.children);

function intersect() {
	// レイキャスト = マウス位置からまっすぐに伸びる光線ベクトルを生成
	raycaster.setFromCamera( mouse, camera );

	// その光線とぶつかったオブジェクトを得る
    const intersects = raycaster.intersectObjects(hitcubes);
    console.log(intersects[0]);

    const intersect_nameko = intersects[0].object.parent.getObjectByName('nameko');
    console.log(intersect_nameko);

    // ぶつかったオブジェクトに対してなんかする
    if ( intersects.length > 0 ) {
        intersect_nameko.scale.y = 1.0;
    }
}

window.addEventListener( 'mousemove', onClick, false );

scene.add(light);

const loop = () => {
    renderer.render( scene, camera );
    controls.update();
    window.requestAnimationFrame( loop ); 
}
window.requestAnimationFrame( loop );

console.log(scene.children);
