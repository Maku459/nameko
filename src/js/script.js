import _ from 'lodash';


/* === シーン準備 === */
const wrapper = document.querySelector('.canvas');
const renderer = new THREE.WebGLRenderer({ alpha: true });
wrapper.appendChild(renderer.domElement);

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.gammaOutput = true;

const scene = new THREE.Scene();

/* === カメラ・ライト === */
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0, 4, 10);
const light  = new THREE.AmbientLight(0xffffff, 1);

/* === 地面 === */
const gg = new THREE.PlaneBufferGeometry( 100, 100 );
const gm = new THREE.MeshPhongMaterial( { color: 0x7b5544 } );
const ground = new THREE.Mesh( gg, gm );
ground.rotation.x = - Math.PI / 2;
ground.position.y = -0.5;

/* === 回転付加 === */
const controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.userPan = false;
controls.userPanSpeed = 0.0;
controls.maxDistance = 5000.0;
controls.maxPolarAngle = Math.PI * 0.495;
controls.autoRotate = false;
controls.autoRotateSpeed = 1.0;

/* === なめこ生成 === */
const loader = new THREE.GLTFLoader();
const url = '/glb/nameko5.glb';

let nameko_let;
let hitcubes;

const loadNameko = () => new Promise(resolve => {
    loader.load(url, resolve);
});

const generateNameko = () => {
    const group = new THREE.Group();

    const gltf = nameko_let;
    const nameko = gltf.scene.clone();
    group.position.x = Math.random() * 10 - 4;
    group.position.y = 0.2;
    group.position.z = Math.random() * 10 - 4;
    group.rotation.y = Math.random() * 2 * Math.PI;
    group.interactive = true;
    
    nameko.scale.x = 0.5;
    nameko.scale.y = 0.5;
    nameko.scale.z = 0.5;
    nameko.name = 'nameko';
    group.add(nameko);

    const geometry = new THREE.BoxGeometry(0.8,2.0,0.8);
    const material = new THREE.MeshLambertMaterial({
        color: 0xE9546B, 
        transparent: true, 
        opacity: 0
    });
    const hitcube = new THREE.Mesh( geometry, material );
    hitcube.position.set(nameko.position.x, nameko.position.y + 0.3, nameko.position.z);
    hitcube.name = 'hitcube';
    group.add(hitcube);

    scene.add(group);
    TweenMax.from(group.scale, 2.0, {x: 0.00001, y: 0.00001, z: 0.00001, ease: Power2.easeIn, delay: 2.0});
}

/* === 初期配置のなめこ読み込み === */

loadNameko(nameko_let)
    .then(data => {
        nameko_let = data;
    })
    .then(() => {
        for (var i = 0; i < 20; i ++) {
            generateNameko();
        }
        hitcubes = _(scene.children)
            .map ((value, key, array) => value.getObjectByName('hitcube'))
            .compact()
            .value()
    })
    .then(() => {
        window.requestAnimationFrame( loop );
    });

/* === なめこ収穫 === */
const raycaster = new THREE.Raycaster();
// マウス座標管理用のベクトルを作成
const mouse = new THREE.Vector2();

function mouseMove( event ) {
    event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    intersect();
}

function intersect() {
	// レイキャスト = マウス位置からまっすぐに伸びる光線ベクトルを生成
	raycaster.setFromCamera( mouse, camera );

	// その光線とぶつかったオブジェクトを得る
    const intersects = raycaster.intersectObjects(hitcubes);
    if(intersects.length == 0) return;

    const intersect_nameko = intersects[0].object.parent;

    if(!intersect_nameko.interactive) return;

    intersect_nameko.interactive = false;

    // ぶつかったオブジェクトに対してなんかする
    if ( intersects.length > 0 ) {
        TweenMax.to(intersect_nameko.scale, 0.5, {y: 1.0, ease: Power1.easeIn});
        TweenMax.to(intersect_nameko.position, 0.5, {y: 0.8, ease: Power1.easeIn});
        TweenMax.to(intersect_nameko.scale, 0.1, {y: 0.2, delay: 0.5});
        TweenMax.to(intersect_nameko.position, 0.1, {y: 1.2, delay: 0.5});
        TweenMax.to(intersect_nameko.scale, 0.2, {y: 1.0, delay: 0.6});
        TweenMax.to(intersect_nameko.position, 0.5, {
            y: 10, 
            delay: 1.1,
            onComplete: () => {
                generateNameko();
                hitcubes = _(scene.children)
                    .map ((value, key, array) => value.getObjectByName('hitcube'))
                    .compact()
                    .value()
            }
        });
    }
}

/* === イベント === */
window.addEventListener( 'mousemove', mouseMove, false );

scene.add(light, ground);

const loop = () => {
    renderer.render( scene, camera );
    controls.update();
    window.requestAnimationFrame( loop ); 
}

window.requestAnimationFrame( loop );