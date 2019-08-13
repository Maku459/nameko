const wrapper = document.querySelector('.canvas');
const renderer = new THREE.WebGLRenderer({ alpha: true });
wrapper.appendChild(renderer.domElement);

renderer.setSize( window.innerWidth, window.innerHeight );

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0, 1, 5);
const grid   = new THREE.GridHelper(10, 5);

const light = new THREE.DirectionalLight(0xFFFFFF);
light.intensity = 1; // 光の強さを倍に
light.position.set(1, 1, 1);

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

const controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.userPan = false;
controls.userPanSpeed = 0.0;
controls.maxDistance = 5000.0;
controls.maxPolarAngle = Math.PI * 0.495;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.0;

//マウスのグローバル変数
const mouse = { x: 0, y: 0 };  
//オブジェクト格納グローバル変数
const targetList = []; 
//マウスが押された時
window.onmousedown = function (ev){
    if (ev.target == renderer.domElement) {     
        //マウス座標2D変換
        const rect = ev.target.getBoundingClientRect();    
        mouse.x =  ev.clientX - rect.left;
        mouse.y =  ev.clientY - rect.top;
        //マウス座標3D変換 width（横）やheight（縦）は画面サイズ
        mouse.x =  (mouse.x / window.innerWidth) * 2 - 1;           
        mouse.y = -(mouse.y / window.innerHeight) * 2 + 1;
        // マウスベクトル
        const vector = new THREE.Vector3( mouse.x, mouse.y ,1);
       // vector はスクリーン座標系なので, オブジェクトの座標系に変換
        projector.unprojectVector( vector, camera );
        // 始点, 向きベクトルを渡してレイを作成
        const ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
         // クリック判定
        const obj = ray.intersectObjects( targetList );
         // クリックしていたら、alertを表示  
        if ( obj.length > 0 ){                       
          alert("click!!")
       }
    }
   };

scene.add(grid, cube, light);
targetList.push(cube);

const loop = () => {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render( scene, camera );
    renderer.gammaOutput = true;
    controls.update();
    window.requestAnimationFrame( loop ); 
}
window.requestAnimationFrame( loop );
