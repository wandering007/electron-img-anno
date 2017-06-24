// definition
window.$ = window.jQuery = require('jquery');
var fs = require('fs');
var draw_region = document.getElementById('drawing');
var canvas = document.getElementById("canvasImg");
var context = canvas.getContext('2d');
const pathRoot = 'E:/box_img';
var pathArr = [];

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
current_id = 0;
currentImg = new Image();
currentImg.src = pathArr[current_id];
currentImg.onload = function () {
    if (currentImg.width > currentImg.height) {
        context.drawImage(currentImg, 0, 0, canvas.width, canvas.height);
    }
    else { // 旋转90度
        var center_cood = {x: canvas.width / 2, y: canvas.height / 2};
        context.translate(center_cood.x, center_cood.y);
        context.rotate(90 * Math.PI / 180);
        context.drawImage(currentImg, -center_cood.y, -center_cood.x, canvas.height, canvas.width);
        context.rotate(-90 * Math.PI / 180);
        context.translate(-center_cood.x, -center_cood.y);
    }
    $('#imagePath').text(pathArr[current_id]);
}
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
    if ($('.rectangle').length > 0) {
        var writeString = pathArr[current_id] + ':';
        $('.rectangle').each(function () {
            var position = $(this).position();
            writeString += position.left / canvas.width + ','
                         + position.top / canvas.height + ','
                         + ($(this).width() + position.left) / canvas.width + ','
                         + ($(this).height() + position.top) / canvas.height + ';';
        })
        fs.appendFile('anno.txt', writeString + '\n', function (err) {
            if (err) throw err;
        })
        $('.rectangle').remove();
    }
    current_id += 1;
    if (current_id < pathArr.length) {
        currentImg.src = pathArr[current_id];
    }
    else {
        $('#imagePath').text("NO IMAGES!");
    }
})

$('#clear').click(function () {
    $('.rectangle').remove();
})
