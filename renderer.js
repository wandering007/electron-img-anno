// definition
window.$ = window.jQuery = require('jquery');
var fs = require('fs');
//const electronLocalshortcut = require('electron-localshortcut');

var draw_region = document.getElementById('drawing');
var canvas = document.getElementById("canvasImg");
var context = canvas.getContext('2d');
const pathRoot = 'E:/box_img';
var pathArr = [];


/*
findFile = function (dir) {
    fs.readdirSync(dir).forEach(function (file) {
        var stat = fs.statSync(dir + "/" + file);
        if (stat.isDirectory()) {
            return findFile(dir + "/" + file);
        }
        else if (file.split('.').pop().toLowerCase() == 'jpg') {
            return pathArr.push(dir + "/" + file);
        }
    })
}
findFile(pathRoot);

var writeFile = fs.createWriteStream('path.txt');
writeFile.on('error', function(err) {
    alert('error when creating writing stream for path.txt')
})
pathArr.forEach(function(s) {
    writeFile.write(s + '\n');
})
writeFile.end();
*/
if (!fs.existsSync('path.txt')) {
    alert('path file not existed!');
}
else {
    pathArr = fs.readFileSync('path.txt').toString().split("\n");
    pathArr = pathArr.slice(0, -1);
}

current_id = 0;
if (fs.existsSync('anno.txt')) {
    saved = fs.readFileSync('anno.txt').toString().split("\n");
    //console.log(saved);
    last_anno_img_path = saved[saved.length - 2];
    if (last_anno_img_path.length > 0) {
        last_anno_img_path = last_anno_img_path.split('|')[0];
        while (pathArr[current_id++] != last_anno_img_path);
    }
}

var currentImg = new Image();
var loaded = false;
currentImg.onload = function () {
    if (this.naturalWidth > this.naturalHeight) { // use this, and natural
        context.drawImage(this, 0, 0, canvas.width, canvas.height);
    }
    else { // 旋转90度
        var center_cood = {x: canvas.width / 2, y: canvas.height / 2};
        context.translate(center_cood.x, center_cood.y);
        context.rotate(90 * Math.PI / 180);
        context.drawImage(this, -center_cood.y, -center_cood.x, canvas.height, canvas.width);
        context.rotate(-90 * Math.PI / 180);
        context.translate(-center_cood.x, -center_cood.y);
    }
    $('#imagePath').text(pathArr[current_id] 
        + ' (' + (current_id + 1) + '/' + pathArr.length + ')');
    $('.rectangle').remove(); // remove rectangle after loading
    loaded = true;
    //$('#finish').show();
}
currentImg.onerror = function () { 
    alert(pathArr[current_id] + ' loading failed!');
};
currentImg.src = pathArr[current_id]; // take care of the order

window.onload = function () {
    initDraw(draw_region);
}

var initPos = { x: draw_region.offsetLeft, y: draw_region.offsetTop };

function initDraw(draw_region) {
    function setMousePosition(e) {
        var ev = e || window.event;
        mouse.x = ev.pageX;
        mouse.y = ev.pageY;
        // pageX/Y coordinates are relative to the top left corner of the whole rendered page (including parts hidden by scrolling)
    };

    var mouse = {
        x: 0,
        y: 0,
        startX: 0,
        startY: 0
    };
    var element = null;

    draw_region.onmousemove = function (e) {
        setMousePosition(e);
        if (element != null) {
            element.style.width = Math.abs(mouse.x - mouse.startX) + 'px';
            element.style.height = Math.abs(mouse.y - mouse.startY) + 'px';
            element.style.left = ((mouse.x - mouse.startX < 0) ? mouse.x : mouse.startX) - initPos.x + 'px';
            element.style.top = ((mouse.y - mouse.startY < 0) ? mouse.y : mouse.startY) - initPos.y + 'px';
        }
    }

    draw_region.onclick = function (e) {
        if (element != null) {
            element = null;
            draw_region.style.cursor = 'default';
            console.log('finished');
        }
        else {
            console.log('begin');
            mouse.startX = mouse.x;
            mouse.startY = mouse.y;
            element = document.createElement('div');
            element.className = 'rectangle';
            element.style.left = mouse.x - initPos.left + 'px';
            element.style.top = mouse.y - initPos.top + 'px';
            draw_region.appendChild(element);
            draw_region.style.cursor = 'crosshair';
        }
    }
}

$('#finish').click(function () {
    if (loaded == false) {
        alert('Image has not been loaded yet!');
        return;
    }
    if ($('.rectangle').length > 0) {
        var writeString = pathArr[current_id] + '|';
        $('.rectangle').each(function () {
            var position = $(this).position();
            writeString += position.left / canvas.width + ','
                         + position.top / canvas.height + ','
                         + Math.min(($(this).width() + position.left) / canvas.width, 1.0) + ','
                         + Math.min(($(this).height() + position.top) / canvas.height, 1.0) + ';';
        })
        fs.appendFile('anno.txt', writeString + '\n', function (err) {
            if (err) throw err;
        })
    }
    current_id += 1;
    if (current_id < pathArr.length) {
        currentImg.src = pathArr[current_id];
        loaded = false;
        //$('#finish').hide();
    }
    else {
        $('#imagePath').text("NO IMAGES!");
    }
})

$('#clear').click(function () {
    $('.rectangle').remove();
})
// add hotkey to finish button
// electronLocalshortcut.register(mainWindow, 'n', () => {
//     console.log('You pressed ctrl & A');
// });