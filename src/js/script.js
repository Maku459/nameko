import _ from 'lodash';

/* === シーン準備 === */
const wrapper = document.querySelector('.canvas');
const renderer = new THREE.WebGLRenderer({ alpha: true });
wrapper.appendChild(renderer.domElement);

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.gammaOutput = true;

const scene = new THREE.Scene();

let score = 0;
const ui = document.querySelector('.ui');
const p = document.createElement('p');
p.textContent = score;
ui.appendChild(p);

const score_monitor = document.querySelector('.ui');
score_monitor.appendChild(p);

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

/* === 回転付加（開発者用） === */
const controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.userPan = false;
controls.maxDistance = 5000.0;
controls.maxPolarAngle = Math.PI * 0.495;
controls.autoRotate = false;
controls.autoRotateSpeed = 1.0;

/* === なめこ生成 === */
const loader = new THREE.GLTFLoader();
const url_normal = '/glb/nameko5.glb';
const url_rare = '/glb/nameko_rare.glb';

let normal_gltf;
let rare_gltf;
let hitcubes;

const loadGLTF = (url) => new Promise(resolve => {
    loader.load(url, resolve);
});

const generateNameko = (gltf) => {
    const group = new THREE.Group();

    const nameko = gltf.scene.clone();
    group.position.x = _.random(-7.0, 7.0);
    group.position.y = 0.2;
    group.position.z = _.random(-3.5, 3.5);
    group.rotation.y = _.random(-1.0, 1.0); //ラジアン
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

Promise.all([
    loadGLTF(url_normal),
    loadGLTF(url_rare)
]).then(data => {
        normal_gltf = data[0];
        rare_gltf = data[1];
    })
    .then(() => {
        for (var i = 0; i < 20; i ++) {
            if(_.random(100) === 0){
                generateNameko(rare_gltf);
            }else{
                generateNameko(normal_gltf);
            }
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
        score ++;
        p.textContent = score;
        TweenMax.to(".ui", 0.1, {fontSize: 70});
        TweenMax.to(".ui", 0.1, {fontSize: 50, delay: 0.1});
        TweenMax.to(intersect_nameko.scale, 0.5, {y: 1.0, ease: Power1.easeIn});
        TweenMax.to(intersect_nameko.position, 0.5, {y: 0.8, ease: Power1.easeIn});
        TweenMax.to(intersect_nameko.scale, 0.1, {y: 0.2, delay: 0.5});
        TweenMax.to(intersect_nameko.position, 0.1, {y: 1.2, delay: 0.5});
        TweenMax.to(intersect_nameko.scale, 0.2, {y: 1.0, delay: 0.6});
        TweenMax.to(intersect_nameko.position, 0.5, {
            y: 10, 
            delay: 1.1,
            onComplete: () => {
                scene.remove(intersect_nameko);
                if(_.random(50) === 0){
                    generateNameko(rare_gltf);
                }else{
                    generateNameko(normal_gltf);
                }
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