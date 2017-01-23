// Assuming we have acces to the gloab GL veriable...
// Not sure how to do this properly in Javascript...

var indices = new Uint16Array([
     0, 1, 2,
     2, 3, 0,
]);

function Sprite (texture) {

     this.texture = texture;

     this.halfWidth = this.texture.width / 2;
     this.halfHeight = this.texture.height / 2;

     this.vertices = new Float32Array([
          -this.halfWidth, -this.halfHeight, -1.0,    0.0, 0.0,
          -this.halfWidth, +this.halfHeight, -1.0,    0.0, 1.0,
          +this.halfWidth, +this.halfHeight, -1.0,    1.0, 1.0,
          +this.halfWidth, -this.halfHeight, -1.0,    1.0, 0.0,
     ]);

     this.transform = mat4.create();

     this.texID = gl.createTexture();
     gl.bindTexture(gl.TEXTURE_2D, this.texID);
     gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.texture);
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

     // Set up out vertex data buffers
     this.vbo = gl.createBuffer(); // WTF openGL uses genBuffers()
     gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
     gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
     gl.enableVertexAttribArray(0);
     gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 5*4, 0);
     gl.enableVertexAttribArray(1);
     gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 5*4, 3*4);
     gl.bindBuffer(gl.ARRAY_BUFFER, null);

     this.ibo = gl.createBuffer();
     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

     // Create our vertex and fragment shaders
     var vertShader = JSglu.createShader(
          gl, gl.VERTEX_SHADER, vertSrcResouce.content);
     var fragShader = JSglu.createShader(
          gl, gl.FRAGMENT_SHADER, fragSrcResouce.content);

     // Create our program
     this.program = gl.createProgram();
     gl.attachShader(this.program, vertShader);
     gl.attachShader(this.program, fragShader);
     gl.linkProgram(this.program);
     gl.detachShader(this.program, vertShader);
     gl.detachShader(this.program, fragShader);

     gl.deleteShader(vertShader);
     gl.deleteShader(fragShader);

}

Sprite.prototype.render = function() {
     gl.bindTexture(gl.TEXTURE_2D, this.texID);
     gl.useProgram(this.program);
     var uniform = gl.getUniformLocation(this.program, "mvp");
     var mvp = mat4.multiply(mat4.create(), viewProjection, this.transform);

     gl.uniformMatrix4fv(uniform, false, mvp);
     gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);

     gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

     //gl.bindBuffer(gl.ARRAY_BUFFER, null);
     //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
     //gl.useProgram(null);
}
