let model = null;
let controller = null;
let view = null;

function startGame(model) {
    controller = new BVGameController(model, view);
}

$(document).ready(() => {
    model = new BVmodel();
    view = new BVview(model);
    controller = new BVcontroller(model, view);
    controller.onFinalize(startGame);
    $('body').append(view.selectionDIV);



    
});
