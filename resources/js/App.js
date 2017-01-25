var Buttons = {
     LEFT: 65,
     RIGHT: 68,
     FIRE: 32
};

var Input = new function() {

     var MAX_KEYS = 256;
     var prevKeys = initArray();
     var currKeys = initArray();

     this.update = function() {
          for (i = 0; i < MAX_KEYS; i++) {
               prevKeys[i] = currKeys[i];
          }
     }

     this.setKey = function(code, value) {
          currKeys[code] = value;
     }

     this.isButtonDown = function(code) {
          return currKeys[code]
     }

     this.wasButtonPressed = function(code) {
          return !prevKeys[code] && currKeys[code];
     }

     this.wasButtonReleased = function(code) {
          return prevKeys[code] && !currKeys[code];
     }

     function initArray() {
          var keys = [];
          for (i = 0; i < MAX_KEYS; i++) {
               keys.push(false);
          }
          return keys;
     }
}

function Resource(url) {
     this.url = url;
     this.content = undefined;
}

var canvas;
var gl;

var bullet;
var player;
var enemies = [];

var vertSrcResouce = new Resource('resources/shaders/simple.vert');
var fragSrcResouce = new Resource('resources/shaders/simple.frag');
var r_spriteSheet = new Resource('resources/images/SpriteSheet.png');

var r = new ResourceManager();
r.addTxtResourceToLoad(vertSrcResouce);
r.addTxtResourceToLoad(fragSrcResouce);
r.addImgResourceToLoad(r_spriteSheet);
r.loadAllResources(function() {
     run();
});

var sprites=[];
var spriteBatch;
var mvp;
var texture;

function run() {
     canvas = document.getElementById('OpenGL-Canvas');
     gl = canvas.getContext('webgl');
     if (!gl) {
          console.error("No WebGL Supported");
     }
     init();
     loop();
}

function init() {
     gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
     gl.clearColor(0, 0, 0, 1);
     gl.enable(gl.BLEND);
     gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

     // Create our vertex and fragment shaders
     var vertShader = JSglu.createShader(
          gl, gl.VERTEX_SHADER, vertSrcResouce.content);
     var fragShader = JSglu.createShader(
          gl, gl.FRAGMENT_SHADER, fragSrcResouce.content);

     // Create our program
     var program = gl.createProgram();
     gl.attachShader(program, vertShader);
     gl.attachShader(program, fragShader);
     gl.linkProgram(program);
     gl.detachShader(program, vertShader);
     gl.detachShader(program, fragShader);

     gl.deleteShader(vertShader);
     gl.deleteShader(fragShader);

     texture = gl.createTexture();
     gl.bindTexture(gl.TEXTURE_2D, texture);
     gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, r_spriteSheet.content);
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
     gl.bindTexture(gl.TEXTURE_2D, null);

     mvp = mat4.ortho(mat4.create(), -128, 128, -128, 128, 0.1, 10);
     sprites = sliceSprites(r_spriteSheet.content, 2, 2, 32, 32);

     spriteBatch = new SpriteBatch(program);

     lastUpdate = Date.now();

     player = new GameObject(sprites[1]);
     bullet = new GameObject(sprites[2]);
     for (i = 1; i < 4; i++) {
          for (j = -3; j < 3; j++) {
               var enemy = new GameObject(sprites[0]);
               enemy.move(j*32, i*32);
               enemies.push(enemy);
          }
     }
     player.move(0, 32*-3.5);

     window.addEventListener('keydown', function(event) {
          Input.setKey(event.keyCode, true);
     }, false);

     window.addEventListener('keyup', function(event) {
          Input.setKey(event.keyCode, false);
     }, false);
}

var passed = 0;
var dir = 0;
function update(dt) {
     passed += dt;
     if (passed >= 1500) {
          for (i = 0; i < enemies.length; i++) {
               if (dir == 0 || dir == 2) {
                    enemies[i].move(0, -16);
               }
               else if (dir == 1){
                    enemies[i].move(32, 0);
               }
               else {
                    enemies[i].move(-32, 0);
               }
          }
          dir = (dir+1)%4;
          passed = 0;
     }
     if (Input.wasButtonPressed(Buttons.LEFT)) {
          player.move(-32, 0);
     }
     else
     if (Input.wasButtonPressed(Buttons.RIGHT)) {
          player.move(32, 0);
     }
     if (Input.wasButtonPressed(Buttons.FIRE)) {
          console.log("FIRE!");
     }
     bullet.move(0, 0.2*dt);
}

function render(dt) {
     gl.clear(gl.COLOR_BUFFER_BIT);
     spriteBatch.begin(texture);
     for (i = 0; i < enemies.length; i++) {
          spriteBatch.drawSprite(enemies[i].sprite, enemies[i].transform);
     }
     spriteBatch.drawSprite(bullet.sprite, bullet.transform);
     spriteBatch.drawSprite(player.sprite, player.transform);
     spriteBatch.end();
}

var lastUpdate;
function loop() {
     var now = Date.now();
     var dt = now - lastUpdate;
     lastUpdate = now;
     update(dt);
     render(dt);
     Input.update();
     window.requestAnimationFrame(loop);
}

function GameObject (sprite) {
     this.sprite = sprite;
     this.transform = mat4.create();
}

GameObject.prototype.move = function(x, y) {
     mat4.translate(this.transform, this.transform, [x, y, 0]);
}
