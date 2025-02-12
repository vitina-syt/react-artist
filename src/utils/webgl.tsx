// 工具函数：编译着色器
export function compileShader(gl:WebGLRenderingContext, type:number, source:string): WebGLShader {
    const shader = gl.createShader(type);
    if (!shader) {
        throw new Error('Failed to create shader');
      }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
    throw new Error('Shader compile failed');
    }
    return shader;
  }
  
  // 工具函数：创建程序
  export function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) : WebGLProgram{
    const program = gl.createProgram();
    if (!program) {
        throw new Error('Failed to create program');
      }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
    throw new Error('Program link failed');
    }
    return program;
  }