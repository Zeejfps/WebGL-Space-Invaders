var canvas;
var gl;

var bullet;
var player;
var enemies = [];

var vertSrcResouce = new Resource('resources/shaders/simple.vert');
var fragSrcResouce = new Resource('resources/shaders/simple.frag');
var r_spriteSheet = new Resource('resources/images/SpriteSheet.png');
var bulletTexture = new Resource('resources/images/Bullet.png');

var r = new ResourceManager();
r.addTxtResourceToLoad(vertSrcResouce);
r.addTxtResourceToLoad(fragSrcResouce);
r.addImgResourceToLoad(r_spriteSheet);
r.addImgResourceToLoad(bulletTexture);
r.loadAllResources(function() {
     run();
});

var sprites=[];
var spriteBatch;
var mvp;
var m;
var texture;
var playerTransform;

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
     sprites = sliceSprites(r_spriteSheet.content, 2, 1, 32, 32);

     spriteBatch = new SpriteBatch(program);

     m = mat4.create();
     playerTransform = mat4.create();
     mat4.translate(playerTransform, playerTransform, [0, 32*-3.5, 0]);
     lastUpdate = Date.now();

     window.addEventListener('keydown', function(event) {
          switch (event.keyCode) {
               case 37: // Left
                    mat4.translate(playerTransform, playerTransform, [-32, 0, 0]);
                    break;

               case 39: // Right
                    mat4.translate(playerTransform, playerTransform, [32, 0, 0]);
                    break;
          }
     }, false);
}

function update(dt) {

}


function render(dt) {
     gl.clear(gl.COLOR_BUFFER_BIT);
     spriteBatch.begin(texture);
     for (i = 0; i < 10; i++) {
          spriteBatch.drawSprite(sprites[0], m);
     }
     spriteBatch.drawSprite(sprites[1], playerTransform);
     spriteBatch.end();
}

var lastUpdate;
function loop() {
     var now = Date.now();
     var dt = now - lastUpdate;
     lastUpdate = now;
     update(dt);
     render(dt);
     window.requestAnimationFrame(loop);
}
