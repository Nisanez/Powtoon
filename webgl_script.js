"use strict";


function create_shader( gl, type, source )
{
    var shader = gl.createShader( type );
    gl.shaderSource( shader, source );
    gl.compileShader( shader );
    var success = gl.getShaderParameter( shader, gl.COMPILE_STATUS );
    if( !success )
    {
        var message= gl.getShaderInfoLog(shader)
         console.log( "problem with creating shader type: " + type + " " + message );  
    }
    else
      return shader;
}

function create_shader_program( gl, vertex_shader, fragment_shader )
{
    var program = gl.createProgram();
    gl.attachShader( program, vertex_shader );
    gl.attachShader( program, fragment_shader );
    gl.linkProgram( program );

    var success = gl.getProgramParameter(program, gl.LINK_STATUS );
    if( !success )
    {
      var message= gl.getProgramInfoLog(program);
      console.log( "problem with creating shader type: " + type + " " + message ); 
    }
    else
    {
        return program;
    }
}

function setRectangle(gl, x, y, width, height, clickX, clickY )
 {
    var x0 = x;
    var x1 = x + width;
    var y0 = y;
    var y1 = y + height;
    var mid_x = x1 * clickX;
    var mid_y = y1 * clickY;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      x0, y1,
      x0, y0,
      mid_x, mid_y, // Triangle 1
      x0, y0,
      x1, y0,
      mid_x, mid_y, // Triangle 2
      x1, y0,
      x1, y1,
      mid_x, mid_y, // Triangle 3
      x1, y1,
      x0, y1,
      mid_x, mid_y, // Triangle 4
    ]), gl.STATIC_DRAW);
}

function render( image )
{
  var canvas = document.getElementById( "my_canvas" );
  var gl     = canvas.getContext( "webgl" );
  if( gl == null )
  {
      window.alert( "cant find opengl context!!" );
      return;
  }

  canvas.width = image.width;
  canvas.height = image.height;

  var vertex_shader_source   = document.getElementById( "vertex_shader").text;
  var fragment_shader_source = document.getElementById( "fragment_shader" ).text;

  var vertex_shader  = create_shader( gl, gl.VERTEX_SHADER,    vertex_shader_source );
  var fragment_shader = create_shader( gl, gl.FRAGMENT_SHADER, fragment_shader_source );

  var program = create_shader_program( gl, vertex_shader, fragment_shader );

  var position_attr_location = gl.getAttribLocation( program, "a_position" );
  var texture_attr_location  = gl.getAttribLocation( program, "a_tex_coord" );

  
  var position_buffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, position_buffer );

  setRectangle(gl, 0, 0, image.width, image.height, 0.5, 0.5 );

  var tex_coord_buffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, tex_coord_buffer );

  setRectangle( gl, 0,0, image.width, image.height, 0.5, 0.5 );

  var texture = gl.createTexture();

  gl.bindTexture( gl.TEXTURE_2D, texture );
    
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image );

  var resolution_location = gl.getUniformLocation(program, "u_resolution" );
  
  
  //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( position ), gl.STATIC_DRAW );


  gl.viewport( 0, 0, canvas.width, canvas.height );

  gl.clearColor( 0, 0, 0, 0 );

  gl.clear( gl.COLOR_BUFFER_BIT );

  gl.useProgram(program);

  gl.enableVertexAttribArray( position_attr_location );

  gl.bindBuffer( gl.ARRAY_BUFFER, position_buffer );

  gl.vertexAttribPointer( position_attr_location, 2, gl.FLOAT, false, 0, 0 );

  gl.enableVertexAttribArray( texture_attr_location );

  gl.bindBuffer( gl.ARRAY_BUFFER, tex_coord_buffer );

  gl.vertexAttribPointer( texture_attr_location, 2, gl.FLOAT, false, 0, 0 );

  gl.uniform2f( resolution_location, gl.canvas.width, gl.canvas.height );

  var number_of_verts = 12; // we are now creating 4 triangles.
  gl.drawArrays(gl.TRIANGLES, 0, number_of_verts );
}

function main()
{
  var image = new Image();
  image.crossOrigin = "anonymous";
  //image.src = "https://images.unsplash.com/photo-1561072750-bd444241e933?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80";
  image.src = "nissim.jpg";

  image.onload = function()
  {
    render( image );     
  };
}



main();