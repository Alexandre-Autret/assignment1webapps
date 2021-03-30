let border="2px"; //default values
let figsize="40px";
let figsize2="40px";
let x=0;
let y=0;
let figArray=[];
let wholeCanvas = [];
const canvas = document.getElementById('myCanvas');
const c = canvas.getContext('2d');
let isDrawing = false;

function drawLine(x1, y1, x2, y2,send=false) { //draws a line between 2 given points
    c.beginPath();
    c.strokeStyle = document.getElementsByTagName("input")[1].value;
    c.fillStyle = document.getElementsByTagName("input")[0].value;
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
    c.closePath();
    if(send){
        sendLine("Line",c,[x1,y1],x2,y2,true);
    }
}

addEventListener('load', () => { //triggered on load: computes width and height of window
    canvas.width = innerWidth;
    canvas.height = innerHeight;
})

canvas.addEventListener('mousedown', function(e) { //triggered on click
    const rect = canvas.getBoundingClientRect()
    x = e.clientX - rect.left
    y = e.clientY - rect.top
    console.log("x: " + x + " y: " + y)
    isDrawing=true
})

canvas.addEventListener('mousemove', e => { //triggered on mouse move
    if (isDrawing === true) {
        drawLine(x, y, e.offsetX, e.offsetY,true);
        x = e.offsetX;
        y = e.offsetY;
    }
});

window.addEventListener('mouseup', e => { //triggered on release
    if (isDrawing === true) {
        drawLine(x, y, e.offsetX, e.offsetY);
        x = 0;
        y = 0;
        isDrawing = false;
    }
});


let socket = io(); //builds io websocket


socket.on('drawing', function(msg) { //reads drawings done by other users
    readData(msg);
});

let name = null;
document.getElementsByTagName("canvas")[0].style.border="solid black 6px";

const SetFigSize = (size) => { //sets figure size
    figsize = size;
    document.getElementById("figuresize").innerText="Figure size: "+size;
}
const SetMargin = (size) => { //sets figure border size
    document.getElementById("Thickness").innerText="Border thickness: "+size;
    border = size;
}

const SetFigType = (type) =>{ //sets figure shape
    document.getElementById("figtype").innerText=type;
}

const Draw = (copying=false) => { //draws shape
    if (name == null) return null;
    const canvas = document.getElementById('myCanvas')
    const c = canvas.getContext('2d')
    c.strokeStyle = document.getElementsByTagName("input")[1].value;
    c.fillStyle = document.getElementsByTagName("input")[0].value;
    c.lineWidth = parseInt(border.slice(0,-2))
    c.beginPath();
    let intercept = GetNonOverlappingStart(canvas.width, canvas.height)

    if(document.getElementById("figtype").innerText==="Triangle"){
        DrawTriangle(c,intercept)
    }else if(document.getElementById("figtype").innerText==="Square"){
        DrawSquare(c,intercept);
    }else{
        DrawCircle(c,intercept);
    }
    if(!copying){
        sendObject(document.getElementById("figtype").innerText,c,intercept)
        console.log(figArray);
    }
}

const GetNonOverlappingStart = (width, heigth) => { //tries to fit the shape in an empty area
    let overlap = false;
    let startPos = getRandomStart(width,heigth);
    do{
        startPos = getRandomStart(width, heigth)
        overlap = false;
        console.log("starting")
        for(const figure of wholeCanvas){
            const fig = parseInt(figsize.slice(0,-2))
            console.log(figure)
            if(figure[0] < startPos[0] + fig && figure[0] + parseInt(figure[2].slice(0,-2))> startPos[0] && figure[1] < startPos[1] + fig && figure[1] + parseInt(figure[2].slice(0,-2)) > startPos[1]){
                overlap = true
                console.log("failed")
            }
        }

    }while(overlap)
    return(startPos);
}

const DrawSquare = (c,intercept,getexternalfig = false) => { //draws a square
    let fig = "";
    if(getexternalfig){
        fig = parseInt(figsize2.slice(0,-2))
    }else{
        fig = parseInt(figsize.slice(0,-2))
    }
    c.rect(intercept[0],intercept[1],fig,fig)
    c.stroke();
    c.fill();
}

const DrawCircle = (c,intercept, getexternalfig = false) => { //draws a circle
    let fig = "";
    if(getexternalfig){
        fig = parseInt(figsize2.slice(0,-2))
    }else{
        fig = parseInt(figsize.slice(0,-2))
    }
    c.arc(intercept[0]+fig/2,intercept[1]+fig/2,fig/2,0, Math.PI*2)
    c.closePath()
    c.stroke();
    c.fill();
}
const DrawTriangle = (c,intercept, getexternalfig = false) => { //draws a triangle
    let fig = "";
    if(getexternalfig){
        fig = parseInt(figsize2.slice(0,-2))
    }else{
        fig = parseInt(figsize.slice(0,-2))
    }
    c.beginPath()
    c.moveTo(intercept[0], intercept[1]);
    c.lineTo(intercept[0]+fig, intercept[1]);
    c.lineTo(intercept[0]+(fig/2), intercept[1]+(fig));
    c.closePath();
    c.stroke();
    c.fill();
}


const getRandomStart = (width, height) => { //places a figure in a random spot

    const swidth = width-parseInt(figsize.slice(0,-2));
    const sheight = height-parseInt(figsize.slice(0,-2));
    return[Math.floor(swidth*Math.random()),Math.floor(sheight*Math.random())]
}

const DrawTenFigure = (copying=false) => { //draws 10 figures with random shapes
    if (name == null) return null;
    console.log("10")
    const canvas = document.getElementById('myCanvas')
    const c = canvas.getContext('2d')
    c.strokeStyle = document.getElementsByTagName("input")[1].value;
    c.fillStyle = document.getElementsByTagName("input")[0].value;
    c.lineWidth = parseInt(border.slice(0,-2))

    for(i=0; i < 10 ; i++){
        c.beginPath()
        const num = Math.random()
        const start = getRandomStart(canvas.width, canvas.height)
        let figure2 = ""
        if(num < 0.33){
            DrawCircle(c,start)
            figure2 = "Circle"
        }else if(num < 0.66){
            DrawTriangle(c,start)
            figure2 = "Triangle"
        }else{
            DrawSquare(c,start)
            figure2 = "Square"
        }

        if(!copying){
            sendObject(figure2,c,start)
        }
    }
}

const readData = async (packet) => { //draws data draws by other users
    const objects = JSON.parse(packet).data


    console.log(objects)
    for(const elem of [objects]){

        console.log(elem)
        const x = elem[0];
        const y = elem[1];
        figsize2 = elem[2];
        const border2 = elem[3];
        const bg = elem[5];
        const bd = elem[4];
        const figure = elem[6];
        if(figure=="Line"){
            drawLine(x,y,elem[7],elem[8])
            return null;
        }

        const canvas = document.getElementById('myCanvas')
        const c = canvas.getContext('2d')
        c.strokeStyle = bd;
        c.fillStyle = bg;
        c.lineWidth = parseInt(border2.slice(0,-2))
        c.beginPath();

        if(figure==="Triangle"){
            DrawTriangle(c,[x,y],true)
        }else if(figure==="Square"){
            DrawSquare(c,[x,y],true);
        }else{
            DrawCircle(c,[x,y],true);
        }
    }
}



const sendObject = async (figure, c, intercept) =>{ //sends drawing to server
    const data = [intercept[0],intercept[1],figsize,border,document.getElementsByTagName("input")[1].value, document.getElementsByTagName("input")[0].value , figure]
    const doc = {data: data, user:document.getElementById("name").value}
    socket.emit("drawing",JSON.stringify(doc))
}

const sendLine = async (figure, c, intercept,x2,y2) =>{ //send live line to server
    console.log("coucou")
    const data = [intercept[0],intercept[1],figsize,border,document.getElementsByTagName("input")[1].value, document.getElementsByTagName("input")[0].value , figure,x2,y2]
    const doc = {data: data, user:document.getElementById("name").value}
    console.log(data)
    socket.emit("drawing",JSON.stringify(doc))
}

const Submit = () => { //reads username
    name = document.getElementById("name").value
    console.log(name)
}

function SaveAsImg(){ //saves canvas as img
	var myC = document.getElementById("myCanvas");
	var dataURL = myC.toDataURL("image/png"); //turns the canvas into a dataURL
	var img = new Image(); //creates an image from it
    img.src = dataURL;
	var w = window.open(""); //opens a new tab and inserts it there
    w.document.write(img.outerHTML);
	w.document.location = "#"; //for some reason, Chrome requires the tab to have a hard-coded location to enable saving the image
	w.document.close();
}