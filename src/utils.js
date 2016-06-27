//Matthew Shotton, R&D User Experience,© BBC 2015

/*
* Utility function to compile a WebGL Vertex or Fragment shader.
* 
* @param {WebGLRenderingContext} gl - the webgl context fo which to build the shader.
* @param {String} shaderSource - A string of shader code to compile.
* @param {number} shaderType - Shader type, either WebGLRenderingContext.VERTEX_SHADER or WebGLRenderingContext.FRAGMENT_SHADER.
*
* @return {WebGLShader} A compiled shader.
*
*/
export function compileShader(gl, shaderSource, shaderType) {
    let shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        throw "could not compile shader:" + gl.getShaderInfoLog(shader);
    }
    return shader;
}

/*
* Create a shader program from a passed vertex and fragment shader source string.
* 
* @param {WebGLRenderingContext} gl - the webgl context fo which to build the shader.
* @param {String} vertexShaderSource - A string of vertex shader code to compile.
* @param {String} fragmentShaderSource - A string of fragment shader code to compile.
*
* @return {WebGLProgram} A compiled & linkde shader program.
*/
export function createShaderProgram(gl, vertexShaderSource, fragmentShaderSource){
    let vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    let fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    let program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
   
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)){
        throw {"error":4,"msg":"Can't link shader program for track", toString:function(){return this.msg;}};
    }
    return program;
}

export function createElementTexutre(gl, type=new Uint8Array([0,0,0,0]), width=1, height=1){
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    //Initialise the texture untit to clear.
    //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, type);

    return texture;
}

export function updateTexture(gl, texture, element){
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, element);
}

export function clearTexture(gl, texture){
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,0,0,0]));
}

export function createControlFormForNode(node, nodeName){
    let rootDiv = document.createElement("div");
    
    if (nodeName !== undefined){
        var title = document.createElement("h2");
        title.innerHTML = nodeName;
        rootDiv.appendChild(title);
    }

    for(let propertyName in node._properties){
        let propertyParagraph = document.createElement("p");
        let propertyTitleHeader = document.createElement("h3");
        propertyTitleHeader.innerHTML = propertyName;
        propertyParagraph.appendChild(propertyTitleHeader);

        let propertyValue = node._properties[propertyName].value;
        if (typeof propertyValue === "number"){
            let range = document.createElement("input");
            range.setAttribute("type", "range");
            range.setAttribute("min", "0");
            range.setAttribute("max", "1");
            range.setAttribute("step", "0.01");
            range.setAttribute("value", propertyValue,toString());
            
            let number = document.createElement("input");
            number.setAttribute("type", "number");
            number.setAttribute("min", "0");
            number.setAttribute("max", "1");
            number.setAttribute("step", "0.01");
            number.setAttribute("value", propertyValue,toString());

            let mouseDown = false;
            range.onmousedown =function(){mouseDown=true;};
            range.onmouseup =function(){mouseDown=false;};
            range.onmousemove = function(){
                if(mouseDown){
                    node[propertyName] = parseFloat(range.value);
                    number.value = range.value;
                }
            };
            range.onchange = function(){
                node[propertyName] = parseFloat(range.value); 
                number.value = range.value;     
            };
            number.onchange =function(){
                node[propertyName] = parseFloat(number.value); 
                range.value = number.value;
            }
            propertyParagraph.appendChild(range);
            propertyParagraph.appendChild(number);
        }
        else if(Object.prototype.toString.call(propertyValue) === '[object Array]'){
            for (var i = 0; i < propertyValue.length; i++) {
                let range = document.createElement("input");
                range.setAttribute("type", "range");
                range.setAttribute("min", "0");
                range.setAttribute("max", "1");
                range.setAttribute("step", "0.01");
                range.setAttribute("value", propertyValue[i],toString());

                let number = document.createElement("input");
                number.setAttribute("type", "number");
                number.setAttribute("min", "0");
                number.setAttribute("max", "1");
                number.setAttribute("step", "0.01");
                number.setAttribute("value", propertyValue,toString());

                let index = i;
                let mouseDown = false;
                range.onmousedown =function(){mouseDown=true;};
                range.onmouseup =function(){mouseDown=false;};
                range.onmousemove = function(){
                    if(mouseDown){
                        node[propertyName][index] = parseFloat(range.value);
                        number.value = range.value;
                    }
                };
                range.onchange = function(){
                    node[propertyName][index] = parseFloat(range.value);
                    number.value = range.value;
                };

                number.onchange = function(){
                    node[propertyName][index] = parseFloat(number.value); 
                    range.value = number.value;
                }
                propertyParagraph.appendChild(range);
                propertyParagraph.appendChild(number);
            }
        }else{

        }


        rootDiv.appendChild(propertyParagraph);
    }
    return rootDiv;
}


function calculateNodeDepthFromDestination(videoContext){
    let destination = videoContext.destination;
    let depthMap= new Map();
    depthMap.set(destination, 0);

    function itterateBackwards(node, depth=0){
        for (let n of node.inputs){
            let d = depth + 1;
            if (depthMap.has(n)){
                if (d > depthMap.get(n)){
                    depthMap.set(n, d);
                }
            } else{
                depthMap.set(n,d);
            }
            itterateBackwards(n, depthMap.get(n));
        }
    }

    itterateBackwards(destination);
    return depthMap;
}




export function visualiseVideoContextGraph(videoContext, canvas){
    let ctx = canvas.getContext('2d');
    let w = canvas.width;
    let h = canvas.height;
    let renderNodes = [];
    ctx.clearRect(0,0,w,h);

    let nodeDepths = calculateNodeDepthFromDestination(videoContext);
    let depths = nodeDepths.values();
    depths = Array.from(depths).sort(function(a, b){return b-a;});
    let maxDepth = depths[0];

    let xStep = w / (maxDepth+1);

    let nodeHeight = (h / videoContext._sourceNodes.length)/3;
    let nodeWidth = nodeHeight * 1.618;


    function calculateNodePos(node, nodeDepths, xStep, nodeHeight){
        let depth = nodeDepths.get(node);
        nodeDepths.values();
  
        let count = 0;
        for(let nodeDepth of nodeDepths){
            if (nodeDepth[0] === node) break;
            if (nodeDepth[1] === depth) count += 1;
        }
        return {x:(xStep*nodeDepths.get(node)), y:nodeHeight*1.5*count + 50};
    }


    // "video":["#572A72", "#3C1255"],
    // "image":["#7D9F35", "#577714"],
    // "canvas":["#AA9639", "#806D15"]

    for (let i = 0; i < videoContext._renderGraph.connections.length; i++) {
        let conn = videoContext._renderGraph.connections[i];
        let source = calculateNodePos(conn.source, nodeDepths, xStep, nodeHeight);
        let destination = calculateNodePos(conn.destination, nodeDepths, xStep, nodeHeight);
        if (source !== undefined && destination !== undefined){
            ctx.beginPath();
            //ctx.moveTo(source.x + nodeWidth/2, source.y + nodeHeight/2);
            let x1 = source.x + nodeWidth/2;
            let y1 = source.y + nodeHeight/2;
            let x2 = destination.x + nodeWidth/2;
            let y2 = destination.y + nodeHeight/2;
            let dx = x2 - x1;
            let dy = y2 - y1;

            let angle = Math.PI/2 - Math.atan2(dx,dy); 

            let distance = Math.sqrt(Math.pow(x1-x2,2) + Math.pow(y1-y2,2))

            let midX = Math.min(x1, x2) + (Math.max(x1,x2) - Math.min(x1, x2))/2;
            let midY = Math.min(y1, y2) + (Math.max(y1,y2) - Math.min(y1, y2))/2;

            let testX = (Math.cos(angle + Math.PI/2))*distance/1.5 + midX;
            let testY = (Math.sin(angle + Math.PI/2))*distance/1.5 + midY;
            // console.log(testX, testY);

            ctx.arc(testX, testY, distance/1.2, angle-Math.PI+0.95, angle-0.95);

            //ctx.arcTo(source.x + nodeWidth/2 ,source.y + nodeHeight/2,destination.x + nodeWidth/2,destination.y + nodeHeight/2,100);
            //ctx.lineTo(midX, midY);
            ctx.stroke();
            //ctx.endPath();
        }
    }


    for(let node of nodeDepths.keys()){
        let depth = nodeDepths.get(node);
        let pos = calculateNodePos(node, nodeDepths, xStep, nodeHeight);
        let color = "#AA9639";
        let text = "";
        if (node.constructor.name === "CompositingNode"){
            color = "#000000";
        }
        if (node.constructor.name === "DestinationNode"){
            color = "#7D9F35";
            text="Output";
        }
        if (node.constructor.name === "VideoNode"){
            color = "#572A72";
            text = "Video"
        }
        if (node.constructor.name === "CanvasNode"){
            color = "#572A72";
            text = "Canvas"; 
        }
        if (node.constructor.name === "ImageNode"){
            color = "#572A72";
            text = "Image";
        }
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.fillRect(pos.x, pos.y, nodeWidth, nodeHeight);
        ctx.fill();


        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.font = "10px Arial";
        ctx.fillText(text,pos.x+nodeWidth/2, pos.y+nodeHeight/2+2.5);
        ctx.fill();
    }

    return;
}




export function createSigmaGraphDataFromRenderGraph(videoContext){

    function idForNode(node){
        if (videoContext._sourceNodes.indexOf(node) !== -1){
            let id = "source " + node.constructor.name+ " "+videoContext._sourceNodes.indexOf(node);
            return id;    
        }
        let id = "processor " + node.constructor.name + " "+videoContext._processingNodes.indexOf(node);
        return id;
    }

    let graph = {
        nodes:[
        {
            id: idForNode(videoContext.destination),
            label:"Destination Node",
            x:2.5,
            y:0.5,
            size:2,
            node: videoContext.destination
        }],
        edges:[]
    };

    for (let i = 0; i < videoContext._sourceNodes.length; i++) {
        let sourceNode = videoContext._sourceNodes[i];
        let y = i * (1.0 / videoContext._sourceNodes.length);
        graph.nodes.push({
            id: idForNode(sourceNode),
            label:"Source "+ i.toString(),
            x:0,
            y: y,
            size:2,
            color:"#572A72",
            node:sourceNode
        });
    }
    for (let i = 0; i < videoContext._processingNodes.length; i++) {
        let processingNode = videoContext._processingNodes[i];
        graph.nodes.push({
            id: idForNode(processingNode),
            x: Math.random() *2.5,
            y: Math.random(),
            size:2,
            node: processingNode
        });
    }

    for (let i = 0; i < videoContext._renderGraph.connections.length; i++) {
        let conn = videoContext._renderGraph.connections[i];
        graph.edges.push({
            "id":"e"+i.toString(),
            "source": idForNode(conn.source),
            "target": idForNode(conn.destination)
        });
    }



    return graph;
}

export function visualiseVideoContextTimeline(videoContext, canvas, currentTime){
        let ctx = canvas.getContext('2d');
        let w = canvas.width;
        let h = canvas.height;
        let trackHeight = h / videoContext._sourceNodes.length;
        let playlistDuration = videoContext.duration;
        if (videoContext.duration === Infinity){playlistDuration = 1+videoContext.currentTime;}
        let pixelsPerSecond = w / playlistDuration;
        let mediaSourceStyle = {
            "video":["#572A72", "#3C1255"],
            "image":["#7D9F35", "#577714"],
            "canvas":["#AA9639", "#806D15"]
        };


        ctx.clearRect(0,0,w,h);
        ctx.fillStyle = "#999";
        
        for(let node of videoContext._processingNodes){
            if (node.constructor.name !== "TransitionNode") continue;
            for(let propertyName in node._transitions){
                for(let transition of node._transitions[propertyName]){
                    let tW = (transition.end - transition.start) * pixelsPerSecond;
                    let tH = h;
                    let tX = transition.start * pixelsPerSecond;
                    let tY = 0;
                    ctx.fillStyle = "rgba(0,0,0, 0.3)";
                    ctx.fillRect(tX, tY, tW, tH);
                    ctx.fill();
                }
            }
        }


        for (let i = 0; i < videoContext._sourceNodes.length; i++) {
            let sourceNode = videoContext._sourceNodes[i];
            let duration = sourceNode._stopTime - sourceNode._startTime;
            if(duration=== Infinity) duration = videoContext.currentTime;
            console.log(duration);
            let start = sourceNode._startTime;

            let msW = duration * pixelsPerSecond;
            let msH = trackHeight;
            let msX = start * pixelsPerSecond;
            let msY = trackHeight * i;
            ctx.fillStyle = mediaSourceStyle.video[i%mediaSourceStyle.video.length];


            ctx.fillRect(msX,msY,msW,msH);
            ctx.fill();
        }

        

        if (currentTime !== undefined){
            ctx.fillStyle = "#000";
            ctx.fillRect(currentTime*pixelsPerSecond, 0, 1, h);
        }
    }