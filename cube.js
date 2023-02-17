
"use strict";

//________________________________________________________________________
//---------------TEXTURES-------------------------------------------------
var im1, tx1;
var im2, tx2;
var im3, tx3;
const _tx = new Uint8Array([0, 0, 255, 255]);

function loadtexture(src)
{
	const tx = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tx);
	gl.texImage2D(
		gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, 
		gl.RGBA, gl.UNSIGNED_BYTE, _tx);

	const im = new Image();
	im.crossOrigin="anonymous";
	im.onload = function potat(){
		gl.bindTexture(gl.TEXTURE_2D, tx);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	};
	im.src=src;
	return tx;
}
function textureinit()
{
	im1 = loadtexture("https://sun9-81.userapi.com/impg/KZEP6UjZAHeb5ditjdcx72ceh-jSGq-fl_Vq3w/CZL_R5TnA74.jpg?size=147x133&quality=96&sign=7724bbb2cfc2ee3ce3a6d33bd16ec76e&type=album");
	im2 = loadtexture("https://sun9-2.userapi.com/impg/hVh9UOMKnea1c_OGysnJhKbhVYnhArVOxETOSw/e6W5YpFOP38.jpg?size=147x133&quality=96&sign=643c4b9c2129fba974a2e2087700d8b8&type=album");
	im3 = loadtexture("https://sun9-52.userapi.com/impg/w6SNySpkb3mCovq03ec397poLmt2ZYbt9zxlYg/U9usSMcgb4c.jpg?size=147x133&quality=96&sign=071c758a06839006709a427f2a58db47&type=album");
	tx1 = loadtexture("https://sun9-46.userapi.com/impg/MGOn643GAazxfX05szHD8a-KUg48jivskd_BwA/292681jHS3U.jpg?size=1242x1138&quality=96&sign=e82a2a0a2af9004d5ab5758e293e6e32&type=album");
	tx2 = loadtexture("https://sun9-87.userapi.com/impf/c852036/v852036598/169b9e/CulrS2RIP_I.jpg?size=251x180&quality=96&sign=1db774b012da2526887561fceb10c14c&type=album");
	tx3 = loadtexture("https://sun9-6.userapi.com/impf/c851036/v851036064/1965cf/lxRq7_Ichyg.jpg?size=280x300&quality=96&sign=99c561ad1f94dbfbf78538d1a664c879&type=album");
}

//________________________________________________________________________
//---------------PROGRAMS-------------------------------------------------

function initProgram(vssrc, fssrc, name)
{
	const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vssrc);
    gl.compileShader(vs);
	
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fssrc);
    gl.compileShader(fs);

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
	
    return {
		name: name,
        prog: prog,
		vposloc: gl.getAttribLocation(prog, '_pos'),
		vnorloc: gl.getAttribLocation(prog, '_nor'),
		vtxyloc: gl.getAttribLocation(prog, '_txy'),
		
		m4ptloc: gl.getUniformLocation(prog, 'm4pt'),
		m3ntloc: gl.getUniformLocation(prog, 'm3nt'),

		colrloc: gl.getUniformLocation(prog, 'colr'),
		lsrcloc: gl.getUniformLocation(prog, 'lsrc'),
		
		ambiloc: gl.getUniformLocation(prog, 'ambi'),
		diffloc: gl.getUniformLocation(prog, 'diff'),
		specloc: gl.getUniformLocation(prog, 'spec'),

		_tx1loc: gl.getUniformLocation(prog, '_tx1'),
		_tx2loc: gl.getUniformLocation(prog, '_tx2'),
		alphloc: gl.getUniformLocation(prog, 'alph'),
    };
}
function switchProgram(info)
{
	curinfo = info;
	h1.textContent = info.name;
}

//-----------program--1----------------phooonk
{
	//---------------guro-------------
	var info_1g;
	var vssrc_1g = 
	`#version 300 es
	in vec4 _pos;
	in vec3 _nor;
	in vec2 _txy;
	out vec2 txy;
	out float _l;

	uniform mat4 m4pt;
	uniform mat3 m3nt;

	uniform vec4 lsrc;
	uniform float ambi;
	uniform float diff;
	uniform float spec;

	void main() {
		txy = _txy;
		vec4 pos = _pos * m4pt;
		gl_Position = pos;
		vec3 nor = _nor * m3nt;
		
		vec3 dpos = pos.xyz - lsrc.xyz;
		vec3 ldir = normalize(dpos);
		
		float p = lsrc.w / length(dpos);
		float _diff = max(0.0, -dot(nor, ldir)) * diff;

		vec3 dir = normalize(-pos.xyz);
		vec3 ref = reflect(ldir, nor);
		float _spec = pow(max(0.0, dot(ref, dir)), spec);

		_l = (ambi+_diff+_spec) * p;
	}
	`;

	var fssrc_1g = 
	`#version 300 es
	precision mediump float;

	in float _l;
	in vec2 txy;
	out vec4 _col;

	uniform vec4 colr;
	uniform float alph;
	uniform sampler2D _tx1;
	uniform sampler2D _tx2;

	void main() {
		vec4 t1 = texture(_tx1, txy); 
		vec4 t2 = texture(_tx2, txy);
		vec4 t = t1 * alph + colr * (1.0 - alph);
		t.r *= t2.r;
		t.g *= t2.g;
		t.b *= t2.b;
		_col = vec4(t.r*_l, t.g*_l, t.b*_l, t.a);
	}
	`;

	//---------------phong-------------
	var info_1p;
	var vssrc_1p = 
	`#version 300 es
	in vec4 _pos;
	in vec3 _nor;
	in vec2 _txy;

	uniform mat4 m4pt;
	uniform mat3 m3nt;

	out vec4 pos;
	out vec3 nor;
	out vec2 txy;

	void main() {
		txy=_txy;
		vec4 p = _pos * m4pt;
		gl_Position = p;
		pos = p;
		nor = _nor * m3nt;
	}
	`;
	var fssrc_1p = 
	`#version 300 es
	precision mediump float;

	uniform vec4 lsrc;
	uniform float ambi;
	uniform float diff;
	uniform float spec;

	uniform vec4 colr;
	uniform float alph;
	uniform sampler2D _tx1;
	uniform sampler2D _tx2;

	in vec4 pos;
	in vec3 nor;
	in vec2 txy;
	out vec4 _col;

	void main() {
		vec3 dpos = pos.xyz - lsrc.xyz;
		vec3 ldir = normalize(dpos);
		
		float p = lsrc.w / length(dpos);
		float _diff = max(0.0, -dot(nor, ldir)) * diff;

		vec3 dir = normalize(-pos.xyz);
		vec3 ref = reflect(ldir, nor);
		float _spec = pow(max(0.0, dot(ref, dir)), spec);

		float _l = (ambi+_diff+_spec) * p;
		vec4 t1 = texture(_tx1, txy); 
		vec4 t2 = texture(_tx2, txy);
		vec4 t = t1 * alph + colr * (1.0 - alph);
		t.r *= t2.r;
		t.g *= t2.g;
		t.b *= t2.b;
		_col = vec4(t.r*_l, t.g*_l, t.b*_l, t.a);
	}
	`;
}
//-----------program--2----------------lompperd
{
	//---------------guro-------------
	var info_2g;
	var vssrc_2g = 
	`#version 300 es
	in vec4 _pos;
	in vec3 _nor;
	in vec2 _txy;
	out vec2 txy;
	out float _l;

	uniform mat4 m4pt;
	uniform mat3 m3nt;

	uniform vec4 lsrc;
	uniform float diff;

	void main() {
		txy = _txy;
		vec4 pos = _pos * m4pt;
		gl_Position = pos;
		vec3 nor = _nor * m3nt;

		vec3 dpos = lsrc.xyz - pos.xyz;

		float d = length(dpos);
		float dotm = max(0.0, dot(nor, normalize(dpos)));
		_l = dotm * lsrc.w / d * diff;
	}
	`;

	var fssrc_2g = 
	`#version 300 es
	precision mediump float;

	in vec2 txy;
	in float _l;
	out vec4 _col;
	
	uniform vec4 colr;
	uniform float alph;
	uniform sampler2D _tx1;
	uniform sampler2D _tx2;

	void main() {
		vec4 t1 = texture(_tx1, txy); 
		vec4 t2 = texture(_tx2, txy);
		vec4 t = t1 * alph + colr * (1.0 - alph);
		t.r *= t2.r;
		t.g *= t2.g;
		t.b *= t2.b;
		_col = vec4(t.r*_l, t.g*_l, t.b*_l, t.a);
	}
	`;

	//---------------phong-------------
	var info_2p;
	var vssrc_2p = 
	`#version 300 es
	in vec4 _pos;
	in vec3 _nor;
	in vec2 _txy;

	uniform mat4 m4pt;
	uniform mat3 m3nt;

	out vec4 pos;
	out vec3 nor;
	out vec2 txy;

	void main() {
		txy = _txy;
		vec4 p = _pos * m4pt;
		gl_Position = p;
		pos = p;
		nor = _nor * m3nt;
	}
	`;

	var fssrc_2p = 
	`#version 300 es
	precision mediump float;

	in vec4 pos;
	in vec3 nor;
	in vec2 txy;
	out vec4 _col;

	uniform vec4 lsrc;
	uniform float diff;

	uniform vec4 colr;
	uniform float alph;
	uniform sampler2D _tx1;
	uniform sampler2D _tx2;

	void main() {
		vec3 dpos = lsrc.xyz - pos.xyz; 

		float d = length(dpos);
		float dotm = max(0.0, dot(nor, normalize(dpos)));
		float _l = dotm * lsrc.w / d * diff;

		vec4 t1 = texture(_tx1, txy); 
		vec4 t2 = texture(_tx2, txy);
		vec4 t = t1 * alph + colr * (1.0 - alph);
		t.r *= t2.r;
		t.g *= t2.g;
		t.b *= t2.b;
		_col = vec4(t.r*_l, t.g*_l, t.b*_l, t.a);
	}
	`;
}
//-----------program--3----------------blini
{
	//---------------guro-------------
	var info_3g;
	var vssrc_3g = 
	`#version 300 es
	in vec4 _pos;
	in vec3 _nor;
	in vec2 _txy;
	out vec2 txy;
	out float _l;

	uniform mat4 m4pt;
	uniform mat3 m3nt;

	uniform vec4 lsrc;
	uniform float ambi;
	uniform float diff;
	uniform float spec;

	void main() {
		txy = _txy;
		vec4 pos = _pos * m4pt;
		gl_Position = pos;
		vec3 nor = _nor * m3nt;

		vec3 dpos = pos.xyz - lsrc.xyz;
		vec3 ldir = normalize(dpos);
		
		float p = lsrc.w / length(dpos);
		float _diff = max(0.0, -dot(nor, ldir)) * diff;

		vec3 dir = normalize(pos.xyz);
		vec3 ref = normalize(dir+ldir);
		float _spec = pow(max(0.0, -dot(ref, nor)), spec);

		_l = (ambi+_diff+_spec) * p;
	}
	`;

	var fssrc_3g = 
	`#version 300 es
	precision mediump float;

	in vec2 txy;
	in float _l;
	out vec4 _col;
	
	uniform vec4 colr;
	uniform float alph;
	uniform sampler2D _tx1;
	uniform sampler2D _tx2;

	void main() {
		vec4 t1 = texture(_tx1, txy); 
		vec4 t2 = texture(_tx2, txy);
		vec4 t = t1 * alph + colr * (1.0 - alph);
		t.r *= t2.r;
		t.g *= t2.g;
		t.b *= t2.b;
		_col = vec4(t.r*_l, t.g*_l, t.b*_l, t.a);
	}
	`;

	//---------------phong-------------
	var info_3p;
	var vssrc_3p = 
	`#version 300 es
	in vec4 _pos;
	in vec3 _nor;
	in vec2 _txy;

	uniform mat4 m4pt;
	uniform mat3 m3nt;

	out vec4 pos;
	out vec3 nor;
	out vec2 txy;

	void main() {
		txy = _txy;
		vec4 p = _pos * m4pt;
		gl_Position = p;
		pos = p;
		nor = _nor * m3nt;
	}
	`;

	var fssrc_3p = 
	`#version 300 es
	precision mediump float;

	in vec4 pos;
	in vec3 nor;
	in vec2 txy;
	out vec4 _col;
	
	uniform vec4 lsrc;
	uniform float ambi;
	uniform float diff;
	uniform float spec;

	uniform vec4 colr;
	uniform float alph;
	uniform sampler2D _tx1;
	uniform sampler2D _tx2;

	void main() {
		vec3 dpos = pos.xyz - lsrc.xyz;
		vec3 ldir = normalize(dpos);
		
		float p = lsrc.w / length(dpos);
		float _diff = max(0.0, -dot(nor, ldir)) * diff;

		vec3 dir = normalize(pos.xyz);
		vec3 ref = normalize(dir+ldir);
		float _spec = pow(max(0.0, -dot(ref, nor)), spec);

		float _l = (ambi+_diff+_spec) * p;
		vec4 t1 = texture(_tx1, txy); 
		vec4 t2 = texture(_tx2, txy);
		vec4 t = t1 * alph + colr * (1.0 - alph);
		t.r *= t2.r;
		t.g *= t2.g;
		t.b *= t2.b;
		_col = vec4(t.r*_l, t.g*_l, t.b*_l, t.a);
	}
	`;
}
//-----------program--4----------------spiderman
{
	//---------------guro-------------
	var info_4g;
	var vssrc_4g = 
	`#version 300 es
	in vec4 _pos;
	in vec3 _nor;
	in vec2 _txy;
	out vec2 txy;
	out float _l;

	uniform mat4 m4pt;
	uniform mat3 m3nt;
	
	uniform vec4 lsrc;
	uniform float diff;
	uniform float spec;

	void main() {
		txy = _txy;
		vec4 pos = _pos * m4pt;
		gl_Position = pos;
		vec3 nor = _nor * m3nt;
		
		vec3 dpos = lsrc.xyz - pos.xyz;

		float d = length(dpos);
		float dotm = max(0.0, dot(nor, normalize(dpos)));
		float l = dotm * lsrc.w / d * diff;

		float k=1.0+spec;
		_l = floor(l*k)/k;
	}
	`;

	var fssrc_4g = 
	`#version 300 es
	precision mediump float;

	in vec2 txy;
	in float _l;
	out vec4 _col;
	
	uniform vec4 colr;
	uniform float alph;
	uniform sampler2D _tx1;
	uniform sampler2D _tx2;

	void main() {
		vec4 t1 = texture(_tx1, txy); 
		vec4 t2 = texture(_tx2, txy);
		vec4 t = t1 * alph + colr * (1.0 - alph);
		t.r *= t2.r;
		t.g *= t2.g;
		t.b *= t2.b;
		_col = vec4(t.r*_l, t.g*_l, t.b*_l, t.a);
	}
	`;
	
	//---------------phong-------------
	var info_4p;
	var vssrc_4p = 
	`#version 300 es
	in vec4 _pos;
	in vec3 _nor;
	in vec2 _txy;

	uniform mat4 m4pt;
	uniform mat3 m3nt;

	out vec4 pos;
	out vec3 nor;
	out vec2 txy;

	void main() {
		txy = _txy;
		vec4 p = _pos * m4pt;
		gl_Position = p;
		pos = p;
		nor = _nor * m3nt;
	}
	`;

	var fssrc_4p = 
	`#version 300 es
	precision mediump float;

	in vec4 pos;
	in vec3 nor;
	in vec2 txy;
	out vec4 _col;
	
	uniform vec4 lsrc;
	uniform float diff;
	uniform float spec;
	
	uniform vec4 colr;
	uniform float alph;
	uniform sampler2D _tx1;
	uniform sampler2D _tx2;

	void main() {
		vec3 dpos = lsrc.xyz - pos.xyz;

		float d = length(dpos);
		float dotm = max(0.0, dot(nor, normalize(dpos)));
		float l = dotm * lsrc.w / d * diff;

		float k=1.0+spec;
		float _l = floor(l*k)/k;
		vec4 t1 = texture(_tx1, txy); 
		vec4 t2 = texture(_tx2, txy);
		vec4 t = t1 * alph + colr * (1.0 - alph);
		t.r *= t2.r;
		t.g *= t2.g;
		t.b *= t2.b;
		_col = vec4(t.r*_l, t.g*_l, t.b*_l, t.a);
	}
	`;
}

//_____________________________________________________________________
//---------------MAIN--------------------------------------------------

var gl;
var curinfo;
var infoarr;
var info_index;
var mode_offset;
var h1, h2ambi, h2diff, h2spec;
window.onload = function main() 
{
	h1 = document.querySelector("#oof");
	h2ambi = document.querySelector("#ambi");
	h2diff = document.querySelector("#diff");
	h2spec = document.querySelector("#spec");
    gl = document.querySelector("#canvas1").getContext("webgl2");

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
	
	infoarr = [];
    info_1p = initProgram(vssrc_1p, fssrc_1p, "1P PHHHHHHOOOOOOOOOOONKK");	infoarr.push(info_1p);
    info_1g = initProgram(vssrc_1g, fssrc_1g, "1G PHHHHHHOOOOOOOOOOONKK");	infoarr.push(info_1g);
    info_2p = initProgram(vssrc_2p, fssrc_2p, "2P LABMEEEEEEEEEEEEERRRT");	infoarr.push(info_2p);
    info_2g = initProgram(vssrc_2g, fssrc_2g, "2G LABMEEEEEEEEEEEEERRRT");	infoarr.push(info_2g);
    info_3p = initProgram(vssrc_3p, fssrc_3p, "3P BLINI PHOOOOOOONGAAAA");	infoarr.push(info_3p);
    info_3g = initProgram(vssrc_3g, fssrc_3g, "3G BLINI PHOOOOOOONGAAAA");	infoarr.push(info_3g);
    info_4p = initProgram(vssrc_4p, fssrc_4p, "4P CEEEEL-SHAAAADEEEEEER");	infoarr.push(info_4p);
    info_4g = initProgram(vssrc_4g, fssrc_4g, "4G CEEEEL-SHAAAADEEEEEER");	infoarr.push(info_4g);
    

	textureinit();
    buffers = initBuffer();
	space = initSpace();
    
	h2ambi.textContent = "ZX ambi: "+ambi;
	h2diff.textContent = "CV diff: "+diff;
	h2spec.textContent = "BN spec: "+spec;

	info_index = 1;
	mode_offset = 1;
	switchProgram(infoarr[info_index]);

	update();
}


function update()
{
	drawScene();
	requestAnimationFrame(update);
}

//_________________________________________________________________________
//---------------CONTROLS--------------------------------------------------
var roty0;
var roty1;

function rotateCube(cub, roty)
{
	const pt = cub.m4pt;
	const x = pt[3];	pt[3]=0;
	const y = pt[7];	pt[7]=0;
	const z = pt[11];	pt[11]=0;

	mat4.multiply(pt, pt, roty);
	pt[3]=x; pt[7]=y; pt[11]=z;

	const nt = cub.m3nt;
	mat3.normalFromMat4(nt, pt);
}
function rotateCubes(roty)
{
	const mat0 = space[1].m4pt;
	const x = mat0[3];
	const y = mat0[7];
	const z = mat0[11];
	for(var i=0; i<space.length; i++)
	{
		const pt = space[i].m4pt;
		pt[3]-=x; pt[7]-=y; pt[11]-=z;
		mat4.multiply(pt, pt, roty);
		pt[3]+=x; pt[7]+=y; pt[11]+=z;

		const nt = space[i].m3nt;
		mat3.normalFromMat4(nt, pt);
	}
}
function rotateStallone(roty)
{
	for(var i=0; i<space.length; i++)
	{
		const pt = space[i].m4pt;
		mat4.multiply(pt, pt, roty);
		
		const nt = space[i].m3nt;
		mat3.normalFromMat4(nt, pt);
	}
}
window.onkeydown = function kot_blini(event)
{
	if(event.code == "Digit1") { rotateCube(space[0], roty0); }
	if(event.code == "Digit2") { rotateCube(space[0], roty1); }
	if(event.code == "Digit3") { rotateCube(space[1], roty0); }
	if(event.code == "Digit4") { rotateCube(space[1], roty1); }
	if(event.code == "Digit5") { rotateCube(space[2], roty0); }
	if(event.code == "Digit6") { rotateCube(space[2], roty1); }
	if(event.code == "Digit7") { rotateCube(space[3], roty0); }
	if(event.code == "Digit8") { rotateCube(space[3], roty1); }
	
	if(event.code == "Numpad7") 	{ rotateCubes(roty0); }
	if(event.code == "Numpad9") 	{ rotateCubes(roty1); }
	if(event.code == "Numpad1")		{ rotateStallone(roty0); }
	if(event.code == "Numpad3")		{ rotateStallone(roty1); }

	if(event.code=="Numpad8")	{ alph+=(1-alph)*0.1; }
	if(event.code=="Numpad2")	{ alph*=0.9; }
	if(event.code=="KeyZ")		{ ambi*=1.1; }
	if(event.code=="KeyX")		{ ambi/=1.1; }
	if(event.code=="KeyC")		{ diff*=1.1; }
	if(event.code=="KeyV")		{ diff/=1.1; }
	if(event.code=="KeyB")		{ spec*=1.1; }
	if(event.code=="KeyN")		{ spec/=1.1; }

	if(event.code=="ControlLeft") 
	{ 
		mode_offset = 1 - mode_offset;
		if(mode_offset==0)	info_index-=1; else info_index+=1;
	}
	if(event.code=="KeyA") { info_index = 0 + mode_offset; }
	if(event.code=="KeyS") { info_index = 2 + mode_offset; }
	if(event.code=="KeyD") { info_index = 4 + mode_offset; }
	if(event.code=="KeyF") { info_index = 6 + mode_offset; }
	switchProgram(infoarr[info_index]);


	h2ambi.textContent = "ZX ambi: "+ambi;
	h2diff.textContent = "CV diff: "+diff;
	h2spec.textContent = "BN spec: "+spec;
}


//_____________________________________________________________________
//---------------INIT--------------------------------------------------
var buffers;
var space;

var lsrc;
var ambi;
var diff;
var spec;

var alph = 0.5;

function initBuffer() 
{
	var a = 0.1;
	// vertex pos
    const p000 = [-a, -a, -a];
    const p001 = [-a, -a, +a];
    const p010 = [-a, +a, -a];
    const p011 = [-a, +a, +a];
    const p100 = [+a, -a, -a];
    const p101 = [+a, -a, +a];
    const p110 = [+a, +a, -a];
    const p111 = [+a, +a, +a];

	// side normals
	const nx0 = [-1, 0, 0], nx1 = [1, 0, 0];
	const ny0 = [0, -1, 0], ny1 = [0, 1, 0];
	const nz0 = [0, 0, -1], nz1 = [0, 0, 1];
	
	// side texel coords
	const tx00 = [1, 0], tx01 = [0, 0];
	const tx10 = [1, 1], tx11 = [0, 1];
	const tx0 = [tx00, tx10, tx11];
	const tx1 = [tx00, tx11, tx01];
	
	//	   000-------100
	//	   /|        /|
	//	  / |       / |
	//	001-------101 |
	//	 | 010-----|-110
	//	 | /       | /
	//	 |/        |/
	//	011-------111
    const pos = [
        [p000, p010, p011], [p000, p011, p001], // -x
        [p101, p001, p000], [p100, p101, p000], // -y
        [p000, p010, p110], [p000, p110, p100], // -z
        [p110, p111, p101], [p110, p101, p100], // +x
        [p011, p010, p110], [p011, p110, p111], // +y
        [p001, p011, p111], [p001, p111, p101], // +z
    ].flat(2);
    const nor = [
        [nx0, nx0, nx0], 	[nx0, nx0, nx0],	// -x
        [ny0, ny0, ny0], 	[ny0, ny0, ny0],	// -y
        [nz0, nz0, nz0], 	[nz0, nz0, nz0],	// -z
        [nx1, nx1, nx1], 	[nx1, nx1, nx1],	// +x
        [ny1, ny1, ny1], 	[ny1, ny1, ny1],	// +y
        [nz1, nz1, nz1], 	[nz1, nz1, nz1],	// +z
	].flat(2);
	const txy = [
		tx0, tx1,	// -x
		tx0, tx1,	// -y
		tx0, tx1,	// -z
		tx0, tx1,	// +x
		tx0, tx1,	// +y
		tx0, tx1,	// +z
	].flat(2);


	const posbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posbuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
	const norbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, norbuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(nor), gl.STATIC_DRAW);
	const txybuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, txybuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(txy), gl.STATIC_DRAW);

    return {
        pos: posbuf,
        nor: norbuf,
		txy: txybuf,
        size: pos.length,
    };
}
function createCube(x, y, z, col, im, tx)
{
	const m4pt = mat4.create();
	m4pt[3]=x; m4pt[7]=y; m4pt[11]=z;

	const m3nt = mat3.create();
	return {
		m4pt: m4pt,
		m3nt: m3nt,
		col: col,
		im: im,
		tx: tx,
	};
}
function initSpace()
{
	// projection transform
	const proj = mat4.create();
	mat4.rotateX(proj, proj, 0.5);
	mat4.rotateY(proj, proj, 0.5);
	const invp = mat4.create();
	mat4.invert(invp, proj);

	// projected y-rotation
	roty0 = mat4.create();
	mat4.multiply(roty0, roty0, invp);
	mat4.rotateY(roty0, roty0, +0.2);
	mat4.multiply(roty0, roty0, proj);
	roty1 = mat4.create();
	mat4.multiply(roty1, roty1, invp);
	mat4.rotateY(roty1, roty1, -0.2);
	mat4.multiply(roty1, roty1, proj);

	// light source (xyz + power)
	lsrc = [0, 0, 0, 1];
	ambi = 0.2;
	diff = 0.2;
	spec = 16.0;
	

	// cube placement
	const d = 0.2;
	const x = 0, y = -0.2, z = 0.8;
	const c1 = createCube(x-d,	y-d,	z, [1, 0, 0, 1], im1, tx1);
	const c2 = createCube(x,	y-d,	z, [0, 1, 0, 1], im2, tx2);
	const c3 = createCube(x+d,	y-d,	z, [0, 0, 1, 1], im3, tx3);
	const c4 = createCube(x,	y,		z, [1, 1, 0, 1], im2, tx2);

	// cube projection
	mat4.multiply(c1.m4pt, c1.m4pt, proj); 
	mat4.multiply(c2.m4pt, c2.m4pt, proj); 
	mat4.multiply(c3.m4pt, c3.m4pt, proj); 
	mat4.multiply(c4.m4pt, c4.m4pt, proj); 

	mat3.normalFromMat4(c1.m3nt, c1.m4pt);
	mat3.normalFromMat4(c2.m3nt, c2.m4pt);
	mat3.normalFromMat4(c3.m3nt, c3.m4pt);
	mat3.normalFromMat4(c4.m3nt, c4.m4pt);


	const cubs = [];
	cubs.push(c1);
	cubs.push(c2);
	cubs.push(c3);
	cubs.push(c4);
	return cubs;
}


//_______________________________________________________________________
//---------------RENDER--------------------------------------------------

function render(cub)
{
	const info = curinfo;
	//----------------attributes--------------
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.pos);
    gl.vertexAttribPointer(info.vposloc, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(info.vposloc);

	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.nor);
    gl.vertexAttribPointer(info.vnorloc, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(info.vnorloc);

	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.txy);
    gl.vertexAttribPointer(info.vtxyloc, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(info.vtxyloc);


	//----------------uniforms--------------
    gl.useProgram(info.prog);
	gl.uniformMatrix4fv(info.m4ptloc, false, cub.m4pt);
	gl.uniformMatrix3fv(info.m3ntloc, false, cub.m3nt);
	
	gl.uniform4fv(info.colrloc, cub.col);
	gl.uniform4fv(info.lsrcloc, lsrc);
	gl.uniform1f(info.ambiloc, ambi);
	gl.uniform1f(info.diffloc, diff);
	gl.uniform1f(info.specloc, spec);

	gl.uniform1f(info.alphloc, alph);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, cub.tx);
	gl.uniform1i(info._tx1loc, 0);

	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, cub.im);
	gl.uniform1i(info._tx2loc, 1);

	

    gl.drawArrays(gl.TRIANGLES, 0, buffers.size);
}

function drawScene() 
{
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	for(var i=0; i<space.length; i++)
		render(space[i]);
}