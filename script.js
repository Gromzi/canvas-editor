screen.orientation.lock("portrait");

function draw() {
    const canvas = document.getElementById('canvas');

    if(canvas.getContext) {
        const ctx = canvas.getContext('2d');
    } 
    else {
        console.log("Canvas not supported in this browser")
    }
}



