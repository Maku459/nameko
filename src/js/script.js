import _ from 'lodash';

const wrapper = document.querySelector('.canvas');
const renderer = new THREE.WebGLRenderer({ alpha: true });
wrapper.appendChild(renderer.domElement);

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.gammaOutput = true;

const scene = new THREE.Scene();

//カメラ
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0, 4, 10);

//地面・座標軸
const gg = new THREE.PlaneBufferGeometry( 100, 100 );
const gm = new THREE.MeshPhongMaterial( { color: 0x7b5544 } );
const ground = new THREE.Mesh( gg, gm );
ground.rotation.x = - Math.PI / 2;
ground.position.y = -0.5;

const axis = new THREE.AxisHelper(1000);
axis.position.set(0,0,0);
scene.add(axis);

const light  = new THREE.AmbientLight(0xffffff, 1);

const loader = new THREE.GLTFLoader();
const url = '/glb/nameko5.glb';

let hitcubes;

loader.load(url, (data) => {
    for ( var i = 0; i < 20; i ++ ) {
        const group = new THREE.Group();

        const gltf = data;
        const nameko = gltf.scene.clone();
        group.position.x = _.random(-7.0, 7.0);
        group.position.y = 0.2;
        group.position.z = _.random(-3.5, 3.5);
        group.rotation.y = _.random(0, 30);
        group.interactive = true;
        nameko.scale.x = 0.5;
        nameko.scale.y = 0.5;
        nameko.scale.z = 0.5;
        nameko.name = 'nameko';
        group.add(nameko);

        const geometry = new THREE.BoxGeometry(0.7,2.0,0.7);
        const material = new THREE.MeshLambertMaterial(
            {
                color: 0xE9546B, 
                transparent: true, 
                opacity: 0.5
            });
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
});

// function generateNameko(){}

/* === 回転付加 === */
const controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.userPan = false;
controls.userPanSpeed = 0.0;
controls.maxDistance = 5000.0;
controls.maxPolarAngle = Math.PI * 0.495;
controls.autoRotate = false;
controls.autoRotateSpeed = 1.0;

/* === レイキャスティング === */
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
                console.log('complete');
            }
        });
    }
}

window.addEventListener( 'mousemove', mouseMove, false );

scene.add(light, ground);

const loop = () => {
    renderer.render( scene, camera );
    controls.update();
    window.requestAnimationFrame( loop ); 
}
window.requestAnimationFrame( loop );
