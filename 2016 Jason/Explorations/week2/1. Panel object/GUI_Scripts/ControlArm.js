function ControlArm( xPos, yPos, length ) {
    this.mControllerSquare = this.createControllerSquare(xPos, yPos, length); // is a renderable
    this.mArm;  // set in update
    this.mSquareSize = this.getBoxSize();
    this.updateArm(xPos, yPos, length);
}

ControlArm.prototype.createControllerSquare = function (xPos, yPos, length) {
    var boxSize = this.mSquareSize;
    var resizeSquare = new Renderable();
    var xform = resizeSquare.getXform();
    xform.setXPos(xPos + length);
    xform.setYPos(yPos);
    xform.setWidth(boxSize);
    xform.setHeight(boxSize);
    resizeSquare.setColor([1, 0, 0, 1]);
    return resizeSquare;
};

// draw icon
ControlArm.prototype.draw = function(aCamera) {
    this.mArm.draw(aCamera);
    this.mControllerSquare.draw(aCamera);
};

ControlArm.prototype.update = function(xPos, yPos, length) {
    // move to light
    this.updateArm(xPos, yPos, length);
    this.updateControllerSquare(xPos, yPos, length);
};

ControlArm.prototype.updateArm = function (xPos, yPos, length) {
    this.mArm = new LineRenderable(xPos, yPos, (xPos + length), yPos);
    this.mArm.setColor([1, 1, 1, 1]);
};

ControlArm.prototype.updateControllerSquare = function (xPos, yPos, length) {
    this.mSquareSize = this.getBoxSize();
    var xform = this.mControllerSquare.getXform();
    xform.setXPos(xPos + length);
    xform.setYPos(yPos);
    xform.setWidth(this.mSquareSize);
    xform.setHeight(this.mSquareSize);
};

ControlArm.prototype.getBoxSize = function () {
    var camera = gGuiBase.SceneSupport.gCurrentScene.getSceneCamera();
    var camW = camera.getWCWidth();
    var boxSize = camW / 50 * 0.75;
    return boxSize;
};

ControlArm.prototype.mouseInResizeSquare = function (mouseX, mouseY) {
    var pos = this.mControllerSquare.getXform().getPosition();
    return gGuiBase.DirectManipulationSupport.mouseInBound(mouseX, mouseY,
        pos[0], pos[1], this.mSquareSize);
};