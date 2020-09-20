let heartImages = [];
let start = 0;

$(document).ready(() => {
    imageFill();
    randomAnimation('.ghost');
    start = Date.now();
});

function imageFill() {
    let height = $(document).height();
    let widht = $(document).width();
    let docFragment = document.createDocumentFragment();

    for (let i = 0;i < 10;i++) {
        let x = Math.floor(Math.random() * widht);
        let y = Math.floor(Math.random() * height);
        let img = document.createElement('img');
        img.src = "https://img.icons8.com/officel/30/000000/like.png";
        img.draggable = false;
        img.className = 'heart';
        img.style.position = 'absolute';
        img.style.top = y + 'px';
        img.style.left = x + 'px';
        docFragment.appendChild(img);
    }

    document.getElementsByClassName('playarea')[0].appendChild(docFragment);

    heartImages = [].slice.call(document.getElementsByClassName('heart'));
    console.log(heartImages);
}

function makeNewPosition() {
    let winHeight = $(window).height() - 50;
    let winWidth = $(window).width() - 50;

    let nh = Math.floor(Math.random() * winHeight);
    let nw = Math.floor(Math.random() * winWidth);

    return [nh,nw];
}

function randomAnimation(element) {
    let newq = makeNewPosition();
    $(element).animate({ top: newq[0], left: newq[1] }, 1000, () => {
        randomAnimation(element);
    });
}

let playarea = $('#playarea'),
    blob = $('#blob'),
    ghost = $('.ghost'),
    goal = $('.goal'),
    blobX = blob.offset().left,
    blobY = blob.offset().top,
    maxValue = playarea.width() - blob.width(),
    keysPressed = {},
    heartCount = 0,
    distancePerIteration = 3;

const LEFT = 37,
      UP = 38,
      RIGHT = 39,
      DOWN = 40;

function calculateNewValue(oldValue, keyCode1, keyCode2) {
    let newValue = parseInt(oldValue, 10)
        - (keysPressed[keyCode1] ? distancePerIteration : 0)
        + (keysPressed[keyCode2] ? distancePerIteration : 0);
    return newValue < 0 ? 0 : newValue > maxValue ? maxValue : newValue;
}

$(window).keydown((event) => keysPressed[event.which] = true);
$(window).keyup((event) => keysPressed[event.which] = false);

setInterval(() => {
    blob.css({
        left: function(index, oldValue) {
            return calculateNewValue(oldValue, LEFT, RIGHT);
        },
        top: function(index, oldValue) {
            return calculateNewValue(oldValue, UP, DOWN);
        }
    });

    if (heartImages.length === 0) {
        imageFill();
    }

    blobY = blob.offset().top;
    blobX = blob.offset().left;

    let goalX = goal.offset().left;
    let goalY = goal.offset().top;

    let ghostX = parseInt(ghost.offset().left);
    let ghostY = parseInt(ghost.offset().top);

    if (getDistance(blobX, blobY, goalX, goalY) < 10) {
        let time = (Date.now() - start) / 1000;
        window.location.href = '/result?t=' + time + '&s=' + heartCount;heartCount
    }

    if (getDistance(blobX, blobY, ghostX, ghostY) < 40) {
        heartCount--;
        if (heartCount < 0) {
            heartCount = 0;
        }
        $('.score').text(heartCount);
    }

    heartImages.forEach((img, index) => {
        let imgX = parseInt(img.style.left, 10);
        let imgY = parseInt(img.style.top, 10);

        let dx = blobX - imgX;
        let dy = blobY - imgY;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < ((blob.width() / 2) + (img.width / 2))) {
            img.remove();
            heartImages.splice(index, 1);
            heartCount++;
            $('.score').text(heartCount);
        }
    });

}, 20);

function getDistance(xA, yA, xB, yB) {
    const xDiff = xA - xB;
    const yDiff = yA - yB;

    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}