import React, { Component } from 'react';
import * as THREE from 'three';
import NewDungeon from 'random-dungeon-generator';

import GameMap from './GameMap.js';
import PointerLockControls from './PointerLockControls.js';
import PointerLockSetup from './PointerLockSetup.js';

import logo from './assets/logo.png';
import walltexture from './assets/new_wall_basic_3_tech.jpg'; //http://www.sevristh.co.uk
import floortexture from './assets/new_floor_01_512_dstar2.jpg';
import metaltexture from './assets/metal.jpg';
import gemtexture from './assets/gem.png';
import robotexture from './assets/box.jpg';
import robot from './assets/robot.png';
import pling from './assets/x.mp3';
import repair from './assets/repair.mp3';
import './App.css';

var controls, scene, camera, raycaster,renderer;
var spotLight;
var audio = new Audio;
var audio1 = new Audio;
var npcVelocity = new THREE.Vector3(0, 0, 0);
var prevTime, npcs = [];
const dungeonConfig = {
  width: 50,
  height: 50,
  minRoomSize: 5,
  maxRoomSize: 15
};
var dungeon = [];
var new_map = [];

function countAliveNeighbours(map, x, y) {
  var count = 0;
  for (var i = -1; i < 2; i++) {
    for (var j = -1; j < 2; j++) {
      var nb_x = i + x;
      var nb_y = j + y;
      if (i == 0 && j == 0) { } else if (nb_x < 0 || nb_y < 0 ||
        nb_x >= map.length ||
        nb_y >= map[0].length) {
        count = count + 1;
      } else if (map[nb_x][nb_y] == 1) {
        count = count + 1;
      }
    }
  }
  return count;
}
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function placeItems(item, tcountlimit) {
  var tcount = 0;
  var treasureHiddenLimit = 2;
  for (var x = 0; x < dungeonConfig.width; x++) {
    for (var y = 0; y < dungeonConfig.height; y++) {
      if (dungeon[x][y] > 1) {
        var nbs = countAliveNeighbours(dungeon, x, y);
        if (nbs >= treasureHiddenLimit) {
          tcount++;
          if (tcount >= tcountlimit) {
            dungeon[x][y] = item;
            tcount = 0;
          }
        }
      }
    }
  }
}

dungeon = NewDungeon(dungeonConfig);
new_map = dungeon;
placeItems("X", 10); // health
placeItems("N", 35); // npcs


var items = {
  npc0: { name: "Optical Chip Reader", gainXP: 10, heart: 1, },
  npc1: { name: "Duodynetic Field Core", gainXP: 30, heart: 2, },
  npc2: { name: "Mnemonic Memory Circuit", gainXP: 50, heart: 3, },
  npc3: { name: "Thermal Integrity Filter", gainXP: 60, heart: 4, },
  npc4: { name: "Multispectral Emitter", gainXP: 80, heart: 5, },
  npc5: { name: "Subspace Phase Modulator", gainXP: 100, heart: 10, },
  npc6: { name: "Positronic Matrix", gainXP: 130, heart: 11, },
  npc7: { name: "Subprocessor Relay", gainXP: 150, heart: 12, },
  npc8: { name: "Linear Memory Crystal", gainXP: 200, heart: 21, },
  npc9: { name: "Sensor Encryption Key", gainXP: 210, heart: 22, },
  npc10: { name: "Heisenberg Decoupling Coil", gainXP: 220, heart: 23, },
  npc11: { name: "Isolinear Subprocessor", gainXP: 300, heart: 30, },
  npc12: { name: "Neurogenic Interface", gainXP: 320, heart: 32, },
  npc13: { name: "Duotronic Enhancer", gainXP: 350, heart: 33, },
  npc14: { name: "Exotic Particle Generator", gainXP: 400, heart: 40, },
  npc15: { name: "Electro Plasma System", gainXP: 450, heart: 45, },
  npc_endboss: { name: "Endboss", gainXP: 1000, heart: 50, }
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playerEnergy: 100,
      playerXP: 0,
      controls: { x: 2, y: 98 },
      playerName: 'Synthetic Digital Prototype',
      statusmsg: ""
    }
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ playerName: event.target.value });
  }

  buildLevel() {

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x222, 0.008);

    camera = this.createCamera(45, -50, -50, 0, scene);

    renderer = this.createRenderer(0x666666)

    raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, - 1, 0), 0, 10);

    spotLight = new THREE.SpotLight(0xffffff, 175, 175, 0.6, 0.5, 1);
    scene.add(spotLight);
    camera.add(spotLight.target);
    spotLight.target.position.set(0, 0, -1);
    var geometry = new THREE.SphereGeometry(1,25,25);
    var mesh = new THREE.Mesh(geometry, this.materials.robo);
    mesh.position.set(0,-3,-6);
    camera.add(mesh);

    var geometry = new THREE.PlaneGeometry(1000, 1000);
    geometry.rotateX(- Math.PI / 2);
    var plane = new THREE.Mesh(geometry, this.materials.floor);
    plane.receiveShadow = true;
    scene.add(plane);
    plane.position.set(440, -8, 440);

    var geometry = new THREE.CubeGeometry(1000, 1000, 2, 1, 1, 1);
    geometry.rotateX(- Math.PI / 2);
    var deckel = new THREE.Mesh(geometry, this.materials.floor);
    scene.add(deckel);
    deckel.position.set(440, 13, 440);

    var length = 2, width = 2;
    var shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, width);
    shape.lineTo(length, width);
    shape.lineTo(length, 0);
    shape.lineTo(2, 3);
    shape.lineTo(0, 0);

    var extrudeSettings = {
      steps: 2,
      amount: 12,
      bevelEnabled: true,
      bevelThickness: 2,
      bevelSize: 2,
      bevelSegments: 1
    };

    var npccounter = 0;
    var wall_geometry = new THREE.CubeGeometry(20, 20, 20, 1, 1, 1);

    for (let y = 0; y < dungeon.length; y++) {
      for (let x = 0; x < dungeon[y].length; x++) {
        if (dungeon[x][y] === 1) {
          new_map[x][y] = new THREE.Mesh(wall_geometry, this.materials.grey);
          new_map[x][y].castShadow = true;
          new_map[x][y].recieveShadow = true;
          new_map[x][y].position.set(x * 20 - 50, 2, y * 20 - 50);
          scene.add(new_map[x][y]);
        }
        if (dungeon[x][y] === "X") { //placeTreasure
          new_map[x][y] = new THREE.Mesh(new THREE.OctahedronGeometry(10), this.materials.orange);
          new_map[x][y].castShadow = true;
          new_map[x][y].position.set(x * 20 - 50, 2, y * 20 - 50);
          new_map[x][y].name = "X";
          scene.add(new_map[x][y]);
        }
        if (dungeon[x][y] === "N") { //placenpc
          var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
          new_map[x][y] = new THREE.Mesh(geometry, this.materials.red);
          new_map[x][y].position.set(x * 20 - 50, 2, y * 20 - 50);
          new_map[x][y].name = "npc" + npccounter;
          npcs.push(new_map[x][y].name);
          scene.add(new_map[x][y]);
          npccounter++;
        }
      }
    }

    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    var endboss = new THREE.Mesh(geometry, this.materials.red);
    endboss.position.set(898,2, 2);
    endboss.name = "npc_endboss";
    endboss.scale.set(3, 2, 2);
    npcs.push(endboss.name);
    scene.add(endboss);
    
    
  }
  componentDidMount() {
    audio.src = repair;
    audio1.src = pling;
    var wallTexture = new THREE.TextureLoader().load(walltexture);
    var metalTexture = new THREE.TextureLoader().load(metaltexture);
    var floorTexture = new THREE.TextureLoader().load(floortexture);
    var gemTexture = new THREE.TextureLoader().load(gemtexture);
    var roboTexture = new THREE.TextureLoader().load(robotexture);
    var robot3rd = new THREE.TextureLoader().load(robot);
    // instantiate a loader

    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.offset.set(0, 0);
    floorTexture.repeat.set(25, 25);

    wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
    metalTexture.wrapS = metalTexture.wrapT = THREE.RepeatWrapping;
    robot3rd.wrapS = robot3rd.wrapT = THREE.RepeatWrapping;
    robot3rd.offset.set(0, 0);
    robot3rd.repeat.set(0.2, 0.2);

    roboTexture.wrapS = roboTexture.wrapT = THREE.RepeatWrapping;
    roboTexture.offset.set(0, 0);
    roboTexture.repeat.set(0.1, 0.1);

    this.materials = {
      grey: new THREE.MeshStandardMaterial({
        displacementMap: metalTexture,
        map: wallTexture,
        bumpScale: 2,
        color: 0xffffff,
        //specular: 0x222,

        shininess: 10,
        //   shading: THREE.FlatShading
      }),
      red: new THREE.MeshPhongMaterial({
        color: 0xf182f0,
        ambient: 0xf182f0,
        specular: 0xfffeee,
        map: roboTexture,
        shininess: 30,
        lineWidth: 1
      }),
      orange: new THREE.MeshPhongMaterial({
        color: 0xfffddd,
        specular: 0xfffeee,
        shininess: 30,
        map: gemTexture,
        emissive: 0x111166
      }),
      robo: new THREE.MeshPhongMaterial({
        //specular: '#a9fcff',
        map: robot3rd,
        color: '#00abb1',
        //emissive: '#006063',
        shininess: 10
      }),
      floor: new THREE.MeshStandardMaterial({
        //  color: 0xf28211,
        displacementMap: metalTexture,
        specular: 0x220000,
        shininess: 1,
        map: floorTexture,
        bumpScale: 2,
        side: THREE.DoubleSide,

      })
    };
    this.buildLevel();
    const handleWindowResize = this.onWindowResize(camera, renderer);
    handleWindowResize();
    window.addEventListener('resize', handleWindowResize, false);
    
    this.animate(renderer, scene, camera)
  }

  createCamera(fov, x = 0, y = 0, z = 0, scene) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const camera = new THREE.PerspectiveCamera(fov, width / height, 1, 1000)
    controls = new PointerLockControls(camera);
    var controlsSetup = new PointerLockSetup(controls);
    controls.enabled = false;
    scene.add(controls.getObject());
    controls.getObject().position.z = 900;
    return camera
  }
  onWindowResize(camera, renderer) {
    return event => {
      const width = window.innerWidth - 4;
      const height = window.innerHeight - 4;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
  }
  createRenderer(clearColor = 0x000000) {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas: this.canvas
    })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.autoClear = false
    renderer.setClearColor(clearColor, 0)
    renderer.physicallyCorrectLights = true;
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    return renderer
  }

  collisionDetection(controls,delta) {
    function bounceBack(position, ray) {
      position.x -= ray.bounceDistance.x;
      position.y -= ray.bounceDistance.y;
      position.z -= ray.bounceDistance.z;
    }

    var rays = [
      //   Time    Degrees      words
      new THREE.Vector3(0, 0, 1),  // 0 12:00,   0 degrees,  deep
      new THREE.Vector3(1, 0, 1),  // 1  1:30,  45 degrees,  right deep
      new THREE.Vector3(1, 0, 0),  // 2  3:00,  90 degress,  right
      new THREE.Vector3(1, 0, -1), // 3  4:30, 135 degrees,  right near
      new THREE.Vector3(0, 0, -1), // 4  6:00  180 degress,  near
      new THREE.Vector3(-1, 0, -1),// 5  7:30  225 degrees,  left near
      new THREE.Vector3(-1, 0, 0), // 6  9:00  270 degrees,  left
      new THREE.Vector3(-1, 0, 1)  // 7 11:30  315 degrees,  left deep
    ];

    var position = controls.getObject().position;
    var rayHits = [];
    for (var index = 0; index < rays.length; index += 1) {
      var bounceSize = 0.1;
      rays[index].bounceDistance = {
        x: rays[index].x * bounceSize,
        y: rays[index].y * bounceSize,
        z: rays[index].z * bounceSize
      };
      raycaster.set(position, rays[index]);
      var intersections = raycaster.intersectObjects(scene.children, true);

      if (intersections.length > 0 && intersections[0].distance <= 6) {
        controls.isOnObject(true);
        if ( /npc*/i.test(intersections[0].object.name)) {
          intersections[0].object.translateY(2);       
          intersections[0].object.rotation.x += 0.02;
          this.displayText(items[intersections[0].object.name].name);  
          this.setState({ playerEnergy: this.state.playerEnergy - items[intersections[0].object.name].heart });        
          this.setState({ playerXP: this.state.playerXP + items[intersections[0].object.name].gainXP }); 
          audio.play();                    
        } else if (intersections[0].object.name === "X") {
          scene.remove(intersections[0].object);
          this.setState({ playerEnergy: this.state.playerEnergy + 25 });
          audio1.play();
        } 
        
        bounceBack(position, rays[index]);
      } else {
        if (!isNaN(delta)) {
          this.moveAI(delta);
        }
      }
    }
    return false;
  }

  displayText(text) {
    this.statusmsg.style.display = "flex";
    this.setState({ statusmsg: text });
    setTimeout(() => {
      this.statusmsg.style.display = "none";
    }, 3000);
  }
 
  animate(renderer, scene, camera) {
    var time = performance.now();
    var delta = (time - prevTime) / 1000;
    requestAnimationFrame(() => {
      this.animate(renderer, scene, camera);
    })
    controls.isOnObject(false);
    this.collisionDetection(controls,delta);
    controls.update();
    if (this.state.playerEnergy <= 0) {
       document.getElementById('blocker').style.display = 'flex';
       document.getElementById('gameover').style.display = 'flex';
       document.exitPointerLock();
    }
    this.setState({ controls: controls.getObject().position });
    spotLight.position.copy(controls.getObject().position);
    renderer.render(scene, camera);
    prevTime = time;
  }

  moveAI(delta) {
    npcs.map( (item) => {
      var npc = scene.getObjectByName(item);
      npc.rotation.y += 0.02;
      /*
      npcVelocity.x -= npcVelocity.x * 10.0 * delta;
      npcVelocity.z -= npcVelocity.z * 10.0 * delta;
      if (this.collisionNPC(npc) == false) {
        npcVelocity.z += 400.0 * delta;
        npc.translateZ(npcVelocity.z * delta);
      } else {
        var directionMultiples = [-1, 1, 2];
        var randomIndex = getRandomInt(0, 2);
        var randomDirection = 90 * directionMultiples[randomIndex] * Math.PI / 180;
        npcVelocity.z += 400.0 * delta;
        npc.rotation.y += randomDirection;
      }
      */
    });
  }
  /*
  collisionNPC(npc) {
    var matrix = new THREE.Matrix4();
    matrix.extractRotation(npc.matrix);
    var directionFront = new THREE.Vector3(0, 0, 1);
    directionFront.applyMatrix4(matrix);
    var rayCasterF = new THREE.Raycaster(npc.position, directionFront);
    if (this.rayIntersect(rayCasterF, 200))
      return true;
    else
      return false;
  }

  rayIntersect(ray, distance) {
    var intersects = ray.intersectObjects(scene.children);
    for (var i = 0; i < intersects.length; i++) {
      if (intersects[i].distance < distance) {
        return true;
      }
    }
    return false;
  }
*/
  render() {
    return (<div className="App">
      <div id="blocker">
        <img src={logo} />
        <div id="gameover">Game Over</div>
        <p>Use WASD to move, SPACE to jump. F to fight.</p>
        <select value={this.state.value} onChange={this.handleChange}>
          <option >Choose your Android</option>
          <option value="Synthetic Digital Prototype">Synthetic Digital Prototype</option>
          <option value="Holographic Pulse Juggernaut">Holographic Pulse Juggernaut</option>
          <option value="Bionic Protection  Emulator">Bionic Protection  Emulator</option>
          <option value="Electromagnetic Multiplexer Facsimile">Electromagnetic Multiplexer Facsimile</option>
          <option value="Ionic Exploration Technician">Ionic Exploration Technician</option>
        </select>
        <div id="instructions">Start New Game</div>
      </div>
      <div ref={c => this.statusmsg = c} id="status">
        <div className="msg"><div class="lds-ripple"><div></div><div></div></div>Repairing this machine.<br />You found a {this.state.statusmsg}.</div></div>
      <header className="gameHUD" >
        <GameMap dungeon={dungeon} controls={this.state.controls} />
        <h1 className="titleHUD playerName" > {this.state.playerName} </h1>
        <h1 className="titleHUD playerName" > {this.state.statusmsg} </h1>
        <h1 className="titleHUD playerName" > Level 1</h1>
        <h1 className="titleHUD playerName" > {this.state.playerXP} </h1>
        <h1 className="titleHUD playerEnergy" >&#x2665;  {this.state.playerEnergy} </h1>
      </header>

      <canvas
        ref={
          c => this.canvas = c
        }
      />
    </div>
    );
  }
}

export default App;
