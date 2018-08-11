import React, { Component } from 'react';
import * as THREE from 'three';
import Dungeon from 'random-dungeon-generator';

import GameMap from './GameMap.js';
import PointerLockControls from './PointerLockControls.js';
import PointerLockSetup from './PointerLockSetup.js';

import walltexture from './assets/wall.jpg'; //http://www.sevristh.co.uk
import floortexture from './assets/floor.jpg';
import metaltexture from './assets/metal.jpg';
import gemtexture from './assets/gem.png';
import robotexture from './assets/box1.jpg';
import robot from './assets/char.png';

import './App.css';

var EffectComposer = require('three-effectcomposer')(THREE)

var ctxTexture = document.getElementById('canvas'),ctx = ctxTexture.getContext('2d');

var time = 0, plane;
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playerEnergy: 100,
      playerXP: 0,
      controls: { x: 2, y: 98 },
      playerName: 'ElectroPlexer',
      statusmsg: "",
      level: 0,
      itemList: [],
      update: false
    }
   
   this.scene = new THREE.Scene();
   /*
   this.controls;
   this.camera;   
   this.renderer;
   this.composer; 
   this.analyser;
   */
   this.clock = new THREE.Clock();
   this.listener = new THREE.AudioListener();
   this.audioLoader = new THREE.AudioLoader();
   this.sounds = {};
   
   //this.monster ;
   //this.worldMap;   
   this.monsterVelocity = new THREE.Vector3();
   //this.spotLight;

    this.items = {
      computer0: { name: "Optical Chip Reader", gainXP: 10, heart: 1, },
      computer1: { name: "Duodynetic Field Core", gainXP: 30, heart: 2, },
      computer2: { name: "Mnemonic Memory Circuit", gainXP: 50, heart: 3, },
      computer3: { name: "Thermal Integrity Filter", gainXP: 60, heart: 4, },
      computer4: { name: "Multispectral Emitter", gainXP: 80, heart: 5, },
      computer5: { name: "Subspace Phase Modulator", gainXP: 100, heart: 10, },
      computer6: { name: "Positronic Matrix", gainXP: 130, heart: 11, },
      computer7: { name: "Subprocessor Relay", gainXP: 150, heart: 12, },
      computer8: { name: "Linear Memory Crystal", gainXP: 200, heart: 21, },
      computer9: { name: "Sensor Encryption Key", gainXP: 210, heart: 22, },
      computer10: { name: "Heisenberg Decoupling Coil", gainXP: 220, heart: 23, },
      computer11: { name: "Isolinear Subprocessor", gainXP: 300, heart: 30, },
      computer12: { name: "Neurogenic Interface", gainXP: 320, heart: 32, },
      computer13: { name: "Duotronic Enhancer", gainXP: 350, heart: 33, },
      computer14: { name: "Exotic Particle Generator", gainXP: 400, heart: 40, },
      computer15: { name: "Electro Plasma System", gainXP: 450, heart: 45, },
      computer_endboss: { name: "Endboss", gainXP: 1000, heart: 100, }
    };
 
    this.worldMapConfig = {
      width: 50,
      height: 50,
      minRoomSize: 5,
      maxRoomSize: 15
    };

    var wallTexture = new THREE.TextureLoader().load(walltexture);
    var metalTexture = new THREE.TextureLoader().load(metaltexture);
    var floorTexture = new THREE.TextureLoader().load(floortexture);
    var gemTexture = new THREE.TextureLoader().load(gemtexture);
    var roboTexture = new THREE.TextureLoader().load(robotexture);

  
    floorTexture.wrapS = floorTexture.wrapT = 
    wallTexture.wrapS = wallTexture.wrapT = 
    metalTexture.wrapS = metalTexture.wrapT = 
    roboTexture.wrapS = roboTexture.wrapT = 
    THREE.RepeatWrapping;


    floorTexture.offset.set(0, 0);
    floorTexture.repeat.set(25, 25); 
    roboTexture.offset.set(0, 0);
    roboTexture.repeat.set(1, 1);
    
    this.materials = {
      shadermaterial: new THREE.ShaderMaterial(
        {
          uniforms: {
            "time" : {
              value : time
            }
          }, 
          fragmentShader: 
            [                          
             "const float PI = 3.14159265;",
             "varying vec2 vUv;",
             "uniform float time;",
              "void main() {",
              "vec2 uvCustom = -1.0 + 2.0 *vUv;",
              "vec2 p = abs(gl_FragCoord.xy / uvCustom.xy/1000.0);",
              "float mov1 = p.y / 0.9 +  time;",
              "float mov2 = p.x / 0.2;",
              "float c1 = 0.1;",
              "float c3	= abs(sin(c1+cos(mov1+mov2+c1)+cos(mov1)+sin(p.x/500.)));"	,
              "gl_FragColor = vec4(c1,c1,c3,1);              ",
              "}"
            ].join("\n"),
            vertexShader: 
            [
              "uniform float time;",
              "varying vec2 vUv;",
              "void main() {",
                "vUv = uv;",
                "vec3 offset = vec3(",
                  "sin(position.x * 1.0 + time) * 0.5,",
                  "sin(position.y * 1.0 + time ) * 0.5,",
                  "sin(position.z * 1.0 + time ) * 0.5",
              ");",
              "vec3 pos = position + offset;",
              "vec4 worldPosition = modelMatrix * vec4(pos, 1.0);",
                "gl_Position = projectionMatrix * viewMatrix * worldPosition;",
              "}"        
            ].join("\n"),
            //side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        }),

      red: new THREE.MeshPhongMaterial({
        color: 0x313230,
        map: metalTexture,
        
        shininess: 1,
        specular: 0x336699,
      }),
      health: new THREE.MeshPhongMaterial({
        color: 0xfffddd,
        shininess: 30,
        map: gemTexture,
      }),
 
      terminal: new THREE.MeshPhongMaterial({
        map: roboTexture,
        bumpMap: new THREE.CanvasTexture(ctxTexture),
        //specular: 0x336699,
        shininess: 30,
      }),

      floor: new THREE.MeshPhongMaterial({
        map: floorTexture,
        lightMap: floorTexture,
        color: 0xfffddd,
        shininess: 30,
      }),

      wall: new THREE.MeshStandardMaterial({
        map: wallTexture,
      }),
    };
  }

  countAliveNeighbours(map, x, y) {
    var count = 0;
    for (var i = -1; i < 2; i++) {
      for (var j = -1; j < 2; j++) {
        var nb_x = i + x;
        var nb_y = j + y;
        if (i === 0 && j === 0) { } 
        else if (nb_x < 0 || nb_y < 0 || nb_x >= map.length || nb_y >= map[0].length) {
          count = count + 1;
        } else if (map[nb_x][nb_y] === 1) {
          count = count + 1;
        }
      }
    }
    return count;
  }
  placeItems(item, tcountlimit) {
    var tcount = 0;
    var treasureHiddenLimit = 2;
    for (var x = 0; x < this.worldMapConfig.width; x++) {
      for (var y = 0; y < this.worldMapConfig.height; y++) {
        if (this.worldMap[x][y] > 1) {
          var nbs = this.countAliveNeighbours(this.worldMap, x, y);
          if (nbs >= treasureHiddenLimit) {
            tcount++;
            if (tcount >= tcountlimit) {
              this.worldMap[x][y] = item;
              tcount = 0;
            }
          }
        }
      }
    }
  }
/*

function placeTreasure()
{
  //How hidden does a spot need to be for treasure?
  //I find 5 or 6 is good. 6 for very rare treasure.
  var treasureHiddenLimit = 5;
  for (var x=0; x < worldWidth; x++)
  {
    for (var y=0; y < worldHeight; y++)
    {
        if(world[x][y] == 0){
          var nbs = countAliveNeighbours(world, x, y);
          if(nbs >= treasureHiddenLimit){
            world[x][y] = 2;
          }
        }
    }
  }   
  redraw();
}

*/
  setPlayerName = (event) =>{
    this.setState({ playerName: event.target.value });
  }

  buildLevel() {

    this.worldMap = new Dungeon(this.worldMapConfig);
    
    this.setState({ update: !this.state.update });
    this.placeItems("X", 10); // health
    this.placeItems("N", 35); // computers
    this.placeItems("G", 20); // UselessThingies = unnütz herumstehendes zeug

    var geometry = new THREE.BoxGeometry(1000, 1000,2);
    geometry.rotateX(- Math.PI / 2);
    plane = new THREE.Mesh(geometry, this.materials.wall);
    plane.receiveShadow = true;
    plane.castShadow = true;
    plane.position.set(440, -9, 440);
    this.scene.add(plane);

    var geometry2 = new THREE.BoxGeometry(1000, 1000,2);
    geometry2.rotateX(- Math.PI / 2);
    var deckel = new THREE.Mesh(geometry2, this.materials.floor);
    deckel.recieveShadow = true;
    deckel.castShadow = true;
    deckel.position.set(440, 13, 440);
    this.scene.add(deckel);

    var length = 2, width = 1;
    var shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, width);
    shape.lineTo(length, width);
    shape.lineTo(length, 0);
    shape.lineTo(2, 8);
    shape.lineTo(0, 0);

    var extrudeSettings = {
      steps: 5,
      depth: 15,
      bevelEnabled: true,
      bevelThickness: 2,
      bevelSize: Math.random()*20,
      bevelSegments: 15
    };

    var computercounter = 0;
    
    var wall_geometry = new THREE.CubeGeometry(20, 20, 20, 1, 1, 1);

    for (let y = 0; y < this.worldMap.length; y++) {
      for (let x = 0; x < this.worldMap[y].length; x++) {
        if (this.worldMap[x][y] === 1) {
          this.worldMap[x][y] = new THREE.Mesh(wall_geometry, this.materials.wall);
          this.worldMap[x][y].recieveShadow = true;
          this.worldMap[x][y].castShadow = true;
          this.worldMap[x][y].name = "wall";
          this.worldMap[x][y].position.set(x * 20 - 50, 2, y * 20 - 50);
          this.scene.add(this.worldMap[x][y]);
        }
        if (this.worldMap[x][y] === "G") { //placeUselessThingie
          var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
          this.worldMap[x][y] = new THREE.Mesh(geometry, this.materials.red);
          this.worldMap[x][y].castShadow = true;
          this.worldMap[x][y].recieveShadow = true;
          this.worldMap[x][y].position.set(x * 20 - 50, 2, y * 20 - 50);
          this.worldMap[x][y].translateY(-8);
          this.worldMap[x][y].name = "G";
          this.scene.add(this.worldMap[x][y]);          
        }
        if (this.worldMap[x][y] === "X") { //placeTreasure
          this.worldMap[x][y] = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 10, 32), this.materials.health);
          this.worldMap[x][y].recieveShadow = true;
          this.worldMap[x][y].castShadow = true;
          this.worldMap[x][y].position.set(x * 20 - 50, 2, y * 20 - 50);
          this.worldMap[x][y].translateY(-4);
          this.worldMap[x][y].name = "X";
          this.scene.add(this.worldMap[x][y]);
        }
        if (this.worldMap[x][y] === "N") { //placecomputer

          this.worldMap[x][y] = new THREE.Mesh(new THREE.CubeGeometry(20, 20, 20, 1, 1, 1), this.materials.terminal);
          this.worldMap[x][y].castShadow = true;
          this.worldMap[x][y].recieveShadow = true;
          this.worldMap[x][y].position.set(x * 20 - 50, 2, y * 20 - 50);
          this.worldMap[x][y].name = "computer" + computercounter;
          this.sounds[this.worldMap[x][y].name] = (new THREE.PositionalAudio( this.listener ));
     
          this.audioLoader.load( 'https://raw.githubusercontent.com/d-subat/spaceshipmaze/master/public/assets/machine.mp3', ( buffer ) =>{
            if ( this.sounds[this.worldMap[x][y].name]) {
              this.sounds[this.worldMap[x][y].name].setLoop(true);
              this.sounds[this.worldMap[x][y].name].setBuffer( buffer );
              this.sounds[this.worldMap[x][y].name].setRefDistance( 25 );
              this.sounds[this.worldMap[x][y].name].setMaxDistance( 900 );
              this.sounds[this.worldMap[x][y].name].setRolloffFactor (0.5)
              this.sounds[this.worldMap[x][y].name].play();
              this.analyser = new THREE.AudioAnalyser( this.sounds[this.worldMap[x][y].name], 32 );
              this.worldMap[x][y].add( this.sounds[this.worldMap[x][y].name]);
            }                         
          });
          this.scene.add(this.worldMap[x][y]);
          computercounter++;
        }
      }
    }

    var endboss = new THREE.Mesh(new THREE.CubeGeometry(20, 20, 20, 1, 1, 1), this.materials.terminal);
    endboss.position.set(898, 2, 2);
    endboss.name = "computer_endboss";
    endboss.scale.set(3, 2, 2);
    
    this.sounds[endboss.name] = (new THREE.PositionalAudio( this.listener ));
    
    this.audioLoader.load( 'https://raw.githubusercontent.com/d-subat/spaceshipmaze/master/public/assets/machine.mp3', ( buffer ) =>{
      if ( this.sounds[endboss.name]) {
        this.sounds[endboss.name].setLoop(true);
        this.sounds[endboss.name].setBuffer( buffer );
        this.sounds[endboss.name].setRefDistance( 5 );
        this.sounds[endboss.name].setMaxDistance( 900 );
        this.sounds[endboss.name].setRolloffFactor (0.5)
        this.sounds[endboss.name].play();}
       
    });
    this.scene.add(endboss);
    
       var geometry = new THREE.SphereGeometry( 3, 8 );               
       this.monster = new THREE.Mesh(geometry,  this.materials.shadermaterial);
       this.monster.recieveShadow = true;
       this.monster.castShadow = true;
       this.monster.position.set( 16, 3, 894 );

       var pointLight2 = new THREE.PointLight(0x6699ff, 1, 20,1 );
       pointLight2.power = 3000;
       pointLight2.castShadow = true;      
       pointLight2.shadow.camera.near = 1;
       pointLight2.shadow.camera.far = 2000;
       pointLight2.shadow.camera.fov = 3;
       this.monster.add(pointLight2);       
       this.monster.add(pointLight2.target);
       this.monster.name = "monster";
       this.scene.add(this.monster);
       
       this.sounds.monster = new THREE.PositionalAudio( this.listener );
       var oscillator = this.listener.context.createOscillator();
				oscillator.type = 'sine';
				oscillator.frequency.setValueAtTime( 250, this.sounds.monster.context.currentTime );
				oscillator.start( 0 );
	      this.sounds.monster.setNodeSource( oscillator );
        this.sounds.monster.setRefDistance(25 );
        this.sounds.monster.setMaxDistance( 500 );
				this.sounds.monster.setVolume( 0.75 );
        this.monster.add( this.sounds.monster);

        this.sounds.repair = (new THREE.Audio( this.listener ));
        this.audioLoader.load( 'https://raw.githubusercontent.com/d-subat/spaceshipmaze/master/public/assets/repair.mp3', ( buffer ) =>{
          this.sounds.repair.setBuffer( buffer );          
          this.sounds.repair.setVolume( 0.5 );
        });

        this.sounds.health = (new THREE.Audio( this.listener ));
        this.audioLoader.load( 'https://raw.githubusercontent.com/d-subat/spaceshipmaze/master/public/assets/x.mp3', ( buffer ) =>{
          this.sounds.health.setBuffer( buffer );          
          this.sounds.health.setVolume( 0.5 );
        });

        this.sounds.unhealth = (new THREE.Audio( this.listener ));
        this.audioLoader.load( 'https://raw.githubusercontent.com/d-subat/spaceshipmaze/master/public/assets/o.mp3', ( buffer ) =>{
          this.sounds.unhealth.setBuffer( buffer );          
          this.sounds.unhealth.setVolume( 0.5 );
        });
  }

  changeCanvas(str) {
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, ctxTexture.width, ctxTexture.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(10, 10, ctxTexture.width - 20, ctxTexture.height - 20);
    
    var bootMsg = [
          "...",           "UAF-I-RDBADDMSGU, identifier [000"+Math.round(Math.random()*200)+"]",          "...",          "Authorization: DECUS-DE-BBX",          "...",          "Model: VAXserver 3900 Series",          "System device: RA"+Math.round(Math.random()*200)+" - _DUA0:",          "Free Blocks: " + Math.round(Math.random()*20000),          "CPU type: 10-01",          "...",          "o OpenVMS Management Station - "+Math.round(Math.random()*2500)+" blocks",          "o DECwindows base support - "+Math.round(Math.random()*500)+" blocks",          "o DECnet Phase IV networking - "+Math.round(Math.random()*1000)+" blocks",          "...",             "Now configuring HSC, RF, and MSCP-served devices ",          "...",          "set rq0 ra92",          "set rq1 ra92",          "set rq2 ra92",          "KA"+Math.round(Math.random()*5000)+"-B V5.3, VMB 2.7",          "Performing normal system tests.",          "40..39..38..37..36..35..34..33..32..31..30..29..28..27..26..25..",          "24..23..22..21..20..19..18..17..16..15..14..13..12..11..10..09..",          "08..07..06..05..04..03..",          "...",          "...",          "Tests completed.",           "...",           "...",           "..."
        ]
        bootMsg.unshift(str);
        
        ctx.font = '14px sans-serif';
        var cursorY = 0;
        const lineHeight = 12;
        const padding = 25;
        var j = 0;
        const height = ctxTexture.height*0.67
        var _inter = setInterval(() => {
    
          ctx.fillStyle = 'white';
          ctx.shadowBlur=10;
          ctx.shadowColor="white";

     if (cursorY >= height-(padding+10)) {
        var imgData=ctx.getImageData(0,10,ctxTexture.width,height-20);
        ctx.putImageData(imgData,0, -lineHeight+2,0,padding,ctxTexture.width,height-(padding*2) );
        ctx.fillStyle = 'black';
        ctx.fillRect(0, height - 35,  ctxTexture.width, padding );            
        ctx.fillStyle = 'white';
        ctx.fillText(bootMsg[j],  padding, height-padding);
      } else {
        ctx.fillText(bootMsg[j],  padding, cursorY+padding);
         cursorY += lineHeight;        
      }
      j++;
        if (j === bootMsg.length) {
          ctx.fillStyle = 'red';
            ctx.fillRect(0, 0, ctxTexture.width, ctxTexture.height);
            ctx.fillStyle = 'white';
            ctx.fillRect(padding*2, padding*2, ctxTexture.width - 100, ctxTexture.height - 100);      
            clearInterval(_inter)
          }
          this.materials.terminal.bumpMap.needsUpdate = true;
    }, 250);
  }

  componentDidMount() {

    this.scene.fog = new THREE.FogExp2(0x222, 0.008);

    this.camera = this.createCamera(45, -50, -50, 0, this.scene);
    this.camera.add(this.listener );

    this.flashLight = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 7, 20), new THREE.MeshPhongMaterial({ color: 0x000000 }));
    this.flashLight.rotateX(Math.PI / 2);
    this.camera.add(this.flashLight);

    var spotLight = new THREE.SpotLight(0xffffff, 1, 1000, Math.PI / 8, 1);
    spotLight.power = 4000;
    spotLight.angle = 0.5;
    spotLight.decay = 2;
    spotLight.penumbra = 0.1;
    spotLight.distance = 200;
    spotLight.castShadow = true;
    spotLight.rotateX(Math.PI / 2);

    var spotLight2 = new THREE.SpotLight(0xffffff, 1, 1000, Math.PI / 8, 1);
    spotLight2.power = 2000;
    spotLight2.angle = 0.55;
    spotLight2.decay = 2;
    spotLight2.penumbra = 0.1;
    spotLight2.distance = 200;
    spotLight2.castShadow = true;
    spotLight2.rotateX(Math.PI / 2);

    var spotLight3 = new THREE.SpotLight(0xffffff, 1, 1000, Math.PI / 8, 1); //new THREE.SpotLight(0xffffff, 0.5, 150);
    spotLight3.power =2000;
    spotLight3.angle = 0.8;
    spotLight3.decay = 2.5;
    spotLight3.penumbra = 0.1;
    spotLight3.distance = 200;
    spotLight3.castShadow = true;
    spotLight3.rotateX(Math.PI / 2);

    this.flashLight.add(spotLight);
    this.flashLight.add(spotLight.target);
    this.flashLight.add(spotLight2);
    this.flashLight.add(spotLight2.target);
    this.flashLight.add(spotLight3);
    this.flashLight.add(spotLight3.target);

    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 0.5;
    spotLight.shadow.camera.far = 200;
    spotLight.shadow.camera.fov = 3;

    this.renderer = this.createRenderer(0x666666)
    //this.buildLevel();
    const handleWindowResize = this.onWindowResize(this.camera, this.renderer);
    handleWindowResize();
    window.addEventListener('resize', handleWindowResize, false);
    
    var VerticalTiltShiftShader = {
      uniforms: {
        "tDiffuse": { value: null },
        "v":        { value: 5.0 / 512.0 },
        "r":        { value: 0.35 }
      }, 
      vertexShader: [
        "varying vec2 vUv;",
        "void main() {",
          "vUv = uv;",
          "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"
      ].join( "\n" ),
      fragmentShader: [
        "uniform sampler2D tDiffuse;",
        "uniform float v;",
        "uniform float r;",
        "varying vec2 vUv;",
        "void main() {",
          "vec4 sum = vec4( 0.0 );",
          "float vv = v * abs( r - vUv.y );",
          "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * vv ) ) * 0.051;",
          "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * vv ) ) * 0.0918;",
          "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * vv ) ) * 0.12245;",
          "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * vv ) ) * 0.1531;",
          "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;",
          "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * vv ) ) * 0.1531;",
          "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * vv ) ) * 0.12245;",
          "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * vv ) ) * 0.0918;",
          "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * vv ) ) * 0.051;",
          "gl_FragColor = sum;",
        "}"
      ].join( "\n" )
    };

    this.composer = new EffectComposer( this.renderer );
    this.composer.addPass( new EffectComposer.RenderPass( this.scene, this.camera ) );
    var effect = new EffectComposer.ShaderPass(  VerticalTiltShiftShader );
    effect.renderToScreen = true;
    this.composer.addPass( effect );

    this.animate(this.renderer, this.scene, this.camera)
  }

  createCamera(fov, x = 0, y = 0, z = 0, scene) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(fov, width / height, 1, 1000)
    this.controls = new PointerLockControls(this.camera);
    var controlsSetup = new PointerLockSetup(this.controls);
    this.controls.enabled = false;
    this.scene.add(this.controls.getObject());
    this.controls.getObject().position.z = 900;
    return this.camera
  }
  onWindowResize(camera, renderer) {
    return event => {
      const width = window.innerWidth - 4;
      const height = window.innerHeight - 4;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
  }
  createRenderer(clearColor = 0x000000) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas: this.canvas
    })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    this.renderer.autoClear = false;
    this.renderer.setClearColor(clearColor, 0)
    this.renderer.physicallyCorrectLights = true;
    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    return this.renderer
  }

  collisionDetection(controls, delta) {

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

    var position = this.controls.getObject().position;

    for (var index = 0; index < rays.length; index += 1) {
      var bounceSize = 0.1;
      rays[index].bounceDistance = {
        x: rays[index].x * bounceSize,
        y: rays[index].y * bounceSize,
        z: rays[index].z * bounceSize
      };
      var raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, - 1, 0), 0, 10);
      raycaster.set(position, rays[index]);
      var intersections = raycaster.intersectObjects(this.scene.children, true);

      if (intersections.length > 0 && intersections[0].distance <= 6 ) {
        this.controls.isOnObject(true);
        if (/computer*/i.test(intersections[0].object.name)) {
          if (this.scene.getObjectByName(intersections[0].object.name).position.y === 2) {
            if (this.items[intersections[0].object.name]) {
              this.changeCanvas(this.items[intersections[0].object.name].name + " restarting");              
              intersections[0].object.translateY(-8);
              this.displayText(this.items[intersections[0].object.name].name);
              console.log([intersections[0].object.name]);
              this.sounds[intersections[0].object.name].setVolume ( 0);
            
              this.setState({
                playerEnergy: this.state.playerEnergy - this.items[intersections[0].object.name].heart * 2,
                playerXP: this.state.playerXP + this.items[intersections[0].object.name].gainXP * 10
              });
              this.setState({
                level: Math.round((this.state.playerXP - 500) / 1000),
                itemList: [...this.state.itemList, this.items[intersections[0].object.name].name]
              });
              this.scene.getObjectByName(intersections[0].object.name).name = "computer_done";              
              this.sounds.repair.play();              
            }
          }
        } else if (intersections[0].object.name === "X") {
          this.scene.remove(intersections[0].object);
          this.setState({ playerEnergy: this.state.playerEnergy + 25 });
          this.sounds.health.play();
        }
        else if (intersections[0].object.name === "monster") {
          this.setState({ playerEnergy: this.state.playerEnergy - 10 });
          this.sounds.unhealth.play();
        }
        bounceBack(position, rays[index]);
      }
    }
    return false;
  }

  moveMonster(delta) { 
   if (this.monster) {
    this.monsterVelocity.x -= this.monsterVelocity.x * 10.0 * delta;
      this.monsterVelocity.z -= this.monsterVelocity.z * 10.0 * delta;
//console.log(this.monster.position)
  if (this.monsterCollision() === false) {
    this.monsterVelocity.z += 400 * delta;
      this.monster.translateZ(this.monsterVelocity.z * delta);
  } else {
      var directions = [-1, 1, 2];
      this.monsterVelocity.z += 400 * delta;
      this.monster.rotation.y += (90 * directions[Math.floor(Math.random() *directions.length)])* Math.PI / 180;
  }
}
}

monsterCollision() {
  var matrix = new THREE.Matrix4();
  matrix.extractRotation(this.monster.matrix);
  var directionFront = new THREE.Vector3(0, 0, 1);
  directionFront.applyMatrix4(matrix);
  var rayCasterF = new THREE.Raycaster(this.monster.position, directionFront);
  var intersects = rayCasterF.intersectObjects(this.scene.children,true);
      for (var i = 0; i < intersects.length; i++) {
          if (intersects[i].distance < 15) {
              return true;
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
    var delta = this.clock.getDelta()
    requestAnimationFrame(() => {
      this.animate(this.renderer, this.scene, this.camera);
    })
    this.controls.isOnObject(false);
    this.moveMonster(delta);
    this.collisionDetection(this.controls, delta);
    this.controls.update();
    if(this.analyser)
    {    this.materials.terminal.emissive.b = this.analyser.getAverageFrequency() /  256;}
    /*
    if (this.state.level === 10) {
      this.restart(true);
    }
    */

   time += 0.1;
   if(this.monster) {
   this.monster.position.y = Math.sin(time * 0.5) * 5;
   this.monster.material.uniforms.time.value = time;
  }
    if (this.state.playerEnergy <= 0) {
      document.getElementById('blocker').style.display = 'flex';
      document.getElementById('gameover').style.display = 'flex';
      document.exitPointerLock();
    }

    this.setState({ controls: this.controls.getObject().position });
    this.flashLight.position.copy(this.camera.position);
    this.flashLight.position.x += 2;
    this.flashLight.position.y -= 3;
    this.flashLight.position.z -= 1;
    //this.renderer.render(this.scene, this.camera);
  
    


    this.composer.render();
  }

  restart = (newLevel) => {    
   this.sounds = {}
    if (newLevel) {
      this.setState({
        playerXP: 0,
        level: 0,
        playerEnergy: 100,
        itemList: []
      });
    }

    this.controls.getObject().position.set(0, 10, 900);
    var sceneRemove = [];
    this.scene.traverse((child) => {
      if (child.name === "wall" || child.name === "X" || child.name === "monster" || child.name === "G" || /computer*/i.test(child.name))
        sceneRemove.push(child);
    })
    for (var i = 0; i < sceneRemove.length; i++) {
      this.scene.remove(sceneRemove[i]);
    }

    this.buildLevel();
    
  }

  render() {
    return (<div className="App">
      <div id="blocker">
        <div className="logo">Space Ship Maze</div>
        <div id="gameover">Game Over</div>
        <p>Collect batteries to repair the broken computer terminals. Beware of the Shader.</p>
        <p>Use WASD to move, Space to jump. R to repair</p>
        <select value={this.state.value} onChange={this.setPlayerName}>
          <option >Choose your Android</option>
          <option value="ElectroPlexer">ElectroPlexer</option>
          <option value="IonicTech">IonicTech</option>
        </select>
        {this.state.playerEnergy > 0 && this.state.playerXP > 0 ? <div id="instructions">Continue</div> : ""}
        <div onClick={() => this.restart(true)} id="instructions">Start New Game</div>
      </div>
      <div ref={c => this.statusmsg = c} id="status">
        <div className="msg"><div className="lds-ripple"><div></div><div></div></div>Repairing this machine.<br />You found a {this.state.statusmsg}.</div></div>
      <header id="header" className="gameHUD " >
        <GameMap dungeon={this.worldMap} controls={this.state.controls} />
        <div className="titleHUD ">
          <div className="playerName" >
          <div className="playerHead">
            {this.state.playerName==="ElectroPlexer"? 
               <svg  viewBox="-30 -210 2570 2248">
               <g transform="matrix(1 0 0 -1 0 1638)">
                <path fill="currentColor"
             d="M1950 1441l-91 -347q276 -167 399 -367q61 -100 92 -216.5t31 -253.5q0 -45 -1 -73t-3 -40q-28 -48 -186 -97q-80 -24 -183.5 -45t-234.5 -38q-130 -17 -249 -25t-231 -8q-132 0 -268 6t-279 20q-72 7 -139 17.5t-132 26.5q-129 32 -214 68.5t-135 91.5q-3 20 -5 45.5
             t-2 59.5q0 125 37 242.5t112 232.5q151 230 397 358l-113 335l-4 26q0 33 23 58t59 25q23 0 45.5 -14.5t30.5 -40.5l108 -320q89 33 191.5 49t220.5 16q115 0 237.5 -13t245.5 -59l83 321q8 28 30 45t50 17q36 0 58 -25t22 -57zM1766 640q23 0 43.5 9t36 25t24.5 38t9 47
             q0 28 -9.5 53t-26 43.5t-38.5 29.5t-47 11q-24 0 -44.5 -10.5t-35.5 -27.5t-23.5 -39.5t-8.5 -47.5q0 -26 9.5 -50t25.5 -42t38 -28.5t47 -10.5zM1240 54q193 0 335 56q141 55 209 163q70 109 70 224q-40 -8 -109.5 -17t-169.5 -18t-188 -14t-168 -5q-137 0 -265 13t-251 33
             l-56 10l-1 -30q-3 -61 16 -116t55 -105q72 -97 206 -145.5t317 -48.5zM746 894q-51 0 -89 -41q-37 -40 -37 -93q0 -26 9 -48t25 -38t37 -25t44 -9q25 0 46.5 10.5t38 28.5t26 42.5t9.5 52.5q0 24 -8 45.5t-22 38t-34 26.5t-45 10z" />
               </g>
             </svg>
              :
              <svg viewBox="-30 -210 2570 2248">
                <g transform="matrix(1 0 0 -1 0 1638)">
                 <path fill="currentColor"
              d="M2381 257q0 -45 -1 -73t-3 -40q-28 -48 -186 -97q-80 -24 -183.5 -45t-234.5 -38q-130 -17 -249 -25t-231 -8q-132 0 -268 6t-279 20q-72 7 -139 17.5t-132 26.5q-129 32 -214 68.5t-135 91.5q-3 20 -5 45.5t-2 59.5q0 61 8.5 118t26.5 113t45 113.5t63 120.5
              q10 17 28.5 43.5t46.5 60.5t61.5 68.5t73.5 68t87.5 65.5t105.5 62l-113 335l-4 26q0 33 23 58t59 25q23 0 45.5 -14.5t30.5 -40.5l108 -320q89 33 191.5 49t220.5 16q115 0 237.5 -13t245.5 -59l83 321q8 28 30 45t50 17q36 0 58 -25t22 -57l-2 -21l-91 -347l14 -7
              q31 -16 67.5 -40.5t75.5 -56t79.5 -68.5t79.5 -78q78 -81 141 -233q65 -151 65 -354zM1226 83h19q109 0 209 6.5t193 19.5t169 32.5t135 41.5t99.5 43.5t62.5 38.5l20 16l-71 71q-3 -3 -21.5 -16.5t-57.5 -32.5t-100.5 -40t-151.5 -39t-210 -29.5t-276 -11.5h-18
              q-164 0 -292 15t-230 44q-50 13 -94 30t-78.5 35t-58 36t-33.5 33l-82 -54q25 -46 100.5 -89t189.5 -76.5t261 -53.5t316 -20zM619 766q0 -25 8.5 -47.5t23.5 -39.5t36 -27t45 -10t46.5 10.5t39 29.5t26.5 43.5t10 53.5q0 25 -8.5 47.5t-23 39.5t-35 27.5t-44.5 10.5
              q-52 0 -89 -43q-35 -41 -35 -95zM1645 768q0 -29 10 -53t26.5 -41.5t38.5 -27.5t46 -10q25 0 45.5 10t35.5 26.5t23.5 39t8.5 47.5q0 27 -9.5 52t-26 44t-38.5 30.5t-47 11.5q-24 0 -45 -10t-36 -27.5t-23.5 -41t-8.5 -50.5z" />
                </g>              
              </svg>              
               } </div>{this.state.playerName}
          </div>
          <div > Level {this.state.level} </div>
          <div > {this.state.playerXP} XP</div>
          <div >&#x2665;  {this.state.playerEnergy} </div>
          <div className="titleHUD inventory" ><h5>Inventory:</h5>
            {this.state.itemList.map((item,i) => { return (<div key={i}> {item.split("").map((letter) => { return (letter.match(/[A-Z]/)) })}</div>) })}
          </div>
        </div>
      </header>
      <div id="robot">
      <img src={robot}  alt="" />
      </div>
      <canvas ref={c => this.canvas = c}      />
    </div>
    );
  }
}

export default App;
