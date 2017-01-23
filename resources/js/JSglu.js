var JSglu = {

     createShader: function(gl, shaderType, shaderSrc) {
          var shader = gl.createShader(shaderType);
          gl.shaderSource(shader, shaderSrc);
          gl.compileShader(shader);
          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
               var error = gl.getShaderInfoLog(shader);
               console.error(error);
          }
          return shader;
     }

};
