function Sprite(texture, uvs) {
     this.texture = texture;
     this.uvs = uvs;
}

function SpriteBatch(program) {
     this._vbo = gl.createBuffer();
     this._ibo = gl.createBuffer();
     this._vertices = [];
     this._indices = [];
     this._program = program;
     this._vertCount = 0;

     gl.useProgram(this._program);
     gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
     gl.bufferData(gl.ARRAY_BUFFER, 64*128, gl.DYNAMIC_DRAW);
     gl.enableVertexAttribArray(0);
     gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 5*4, 0);
     gl.enableVertexAttribArray(1);
     gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 5*4, 3*4);

     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._ibo);
     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, 16*128, gl.STATIC_DRAW);

     gl.bindBuffer(gl.ARRAY_BUFFER, null);
     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
     gl.useProgram(this.null);
}

SpriteBatch.prototype.begin = function(texture) {
     this._vertices = [];
     this._indices = [];
     this._vertCount = 0;
     gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._ibo);
     gl.useProgram(this._program);
     var uniform = gl.getUniformLocation(this._program, "mvp");
     gl.uniformMatrix4fv(uniform, false, mvp);
     gl.bindTexture(gl.TEXTURE_2D, texture);
}

SpriteBatch.prototype.drawSprite = function(sprite, mat) {

     var u = sprite.uvs[0];
     var v = sprite.uvs[1];
     var du = sprite.uvs[2];
     var dv = sprite.uvs[3];

     var halfWidth = sprite.texture.width / 2 * du;
     var halfHeight = sprite.texture.height / 2 * dv;

     var botL = vec3.fromValues(-halfWidth, -halfHeight, -1);
     var topL = vec3.fromValues(-halfWidth, +halfHeight, -1);
     var topR = vec3.fromValues(+halfWidth, +halfHeight, -1);
     var botR = vec3.fromValues(+halfWidth, -halfHeight, -1);

     vec3.transformMat4(botL, botL, mat);
     vec3.transformMat4(topL, topL, mat);
     vec3.transformMat4(topR, topR, mat);
     vec3.transformMat4(botR, botR, mat);

     this._vertices = this._vertices.concat([
          botL[0], botL[1], botL[2],    u,        v,
          topL[0], topL[1], topL[2],    u,        v + dv,
          topR[0], topR[1], topR[2],    u + du,   v + dv,
          botR[0], botR[1], botR[2],    u + du,   v,
     ]);

     var i = this._vertCount;
     this._indices = this._indices.concat([
          i+0, i+1, i+2,
          i+3, i+0, i+2,
     ]);
     this._vertCount += 4;
}

SpriteBatch.prototype.end = function() {
     // Upload vertices
     gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this._vertices));

     // Upload indices
     gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, new Uint16Array(this._indices));

     // Render sprites
     gl.drawElements(gl.TRIANGLES, this._indices.length, gl.UNSIGNED_SHORT, 0);

     // Clean up
     gl.bindBuffer(gl.ARRAY_BUFFER, null);
     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
     gl.useProgram(null);
     gl.bindTexture(gl.TEXTURE_2D, null);
}

function sliceSprites(spritesheet, xSprites, ySprites, cellWidth, cellHeight) {
     var sprites = [];
     var du = cellWidth / spritesheet.width;
     var dv = cellHeight / spritesheet.height;

     var v = 0;
     for (i = 0; i < ySprites; i++) {
          var u = 0;
          for (j = 0; j < xSprites; j++) {
               var uvs = vec4.fromValues(u, v, du, dv);
               sprites.push(new Sprite(spritesheet, uvs));
               u+=du;
          }
          v+=dv;
     }

     return sprites;
}
