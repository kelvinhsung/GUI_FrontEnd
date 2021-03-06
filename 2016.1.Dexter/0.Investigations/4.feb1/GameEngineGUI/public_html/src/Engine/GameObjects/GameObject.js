/* File: GameObject.js 
 *
 * Abstracts a game object's behavior and apparance
 */

/*jslint node: true, vars: true */
/*global vec2, vec3, BoundingBox */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function GameObject(renderableObj) {
    this.mRenderComponent = renderableObj;
    this.mVisible = true;
    this.mCurrentFrontDir = vec2.fromValues(0, 1);  // this is the current front direction of the object
    this.mSpeed = 0;
    this.mPhysicsComponent = null;
    
    this.mName = "";
    
    this.mScriptUpdate = "// Your code here";
    this.mScriptUpdateSuccess = false;
    
    this.mHexColor = "";
}

GameObject.prototype.getXform = function () { return this.mRenderComponent.getXform(); };
GameObject.prototype.getBBox = function () {
    var xform = this.getXform();
    var b = new BoundingBox(xform.getPosition(), xform.getWidth(), xform.getHeight());
    return b;
};
GameObject.prototype.setVisibility = function (f) { this.mVisible = f; };
GameObject.prototype.isVisible = function () { return this.mVisible; };

GameObject.prototype.setSpeed = function (s) { this.mSpeed = s; };
GameObject.prototype.getSpeed = function () { return this.mSpeed; };
GameObject.prototype.incSpeedBy = function (delta) { this.mSpeed += delta; };

GameObject.prototype.setCurrentFrontDir = function (f) { vec2.normalize(this.mCurrentFrontDir, f); };
GameObject.prototype.getCurrentFrontDir = function () { return this.mCurrentFrontDir; };

GameObject.prototype.getRenderable = function () { return this.mRenderComponent; };

GameObject.prototype.setPhysicsComponent = function (p) { this.mPhysicsComponent = p; };
GameObject.prototype.getPhysicsComponent = function () { return this.mPhysicsComponent; };

GameObject.prototype.setColor = function (color) { this.mRenderComponent.setColor(color); };
GameObject.prototype.getColor = function () { return this.mRenderComponent.getColor(); };

GameObject.prototype.setHexColor = function (color) { this.mHexColor = color; };
GameObject.prototype.getHexColor = function () { return this.mHexColor; };

GameObject.prototype.setName = function (name) { this.mName = name; };
GameObject.prototype.getName = function () { return this.mName; };

GameObject.prototype.setScriptUpdate = function (script) {
    if (this.mScriptUpdate !== script) {    // In case it is the same script (e.g. the user clicked on a different text box, do not reset the script flag)
        this.mScriptUpdate = script;
        this.mScriptUpdateSuccess = true;   // It will let you try this script.  If it fails, it'll go false.
    }
};

GameObject.prototype.getScriptUpdate = function () { return this.mScriptUpdate; };

// Orientate the entire object to point towards point p
// will rotate Xform() accordingly
GameObject.prototype.rotateObjPointTo = function (p, rate) {
    // Step A: determine if reach the destination position p
    var dir = [];
    vec2.sub(dir, p, this.getXform().getPosition());
    var len = vec2.length(dir);
    if (len < Number.MIN_VALUE) {
        return; // we are there.
    }
    vec2.scale(dir, dir, 1 / len);

    // Step B: compute the angle to rotate
    var fdir = this.getCurrentFrontDir();
    var cosTheta = vec2.dot(dir, fdir);

    if (cosTheta > 0.999999) { // almost exactly the same direction
        return;
    }

    // Step C: clamp the cosTheda to -1 to 1 
    // in a perfect world, this would never happen! BUT ...
    if (cosTheta > 1) {
        cosTheta = 1;
    } else {
        if (cosTheta < -1) {
            cosTheta = -1;
        }
    }

    // Step D: compute whether to rotate clockwise, or counterclockwise
    var dir3d = vec3.fromValues(dir[0], dir[1], 0);
    var f3d = vec3.fromValues(fdir[0], fdir[1], 0);
    var r3d = [];
    vec3.cross(r3d, f3d, dir3d);

    var rad = Math.acos(cosTheta);  // radian to roate
    if (r3d[2] < 0) {
        rad = -rad;
    }

    // Step E: rotate the facing direction with the angle and rate
    rad *= rate;  // actual angle need to rotate from Obj's front
    vec2.rotate(this.getCurrentFrontDir(), this.getCurrentFrontDir(), rad);
    this.getXform().incRotationByRad(rad);
};

GameObject.prototype.update = function () {
    // simple default behavior
    var pos = this.getXform().getPosition();
    vec2.scaleAndAdd(pos, pos, this.getCurrentFrontDir(), this.getSpeed());

    if (this.mPhysicsComponent !== null) {
        this.mPhysicsComponent.update();
    }
    
    // Pass it in so it knows which script to call
    if (this.mScriptUpdateSuccess) {    // Only run it if: it's already found to be bug-free, or if it's the first time
        this.executeScript(this.mScriptUpdate);
    }
};

GameObject.prototype.draw = function (aCamera) {
    if (this.isVisible()) {
        this.mRenderComponent.draw(aCamera);
    }
    if (this.mPhysicsComponent !== null) {
        this.mPhysicsComponent.draw(aCamera);
    }
};

GameObject.prototype.executeScript = function(script) {
    // Check contents for initial issues
    var msg = "Error:";
    var secondary = "\n\nYour script will be disabled until the error is fixed."
    if (script.includes("$")) {
        msg = msg + "\nThe symbol \"$\" is not allowed in the script.";
    }
    if (script.includes("document")) {
        msg = msg + "\nThe term \"document\" is not allowed in the script.";
    }
    if (script.includes("window")) {
        msg = msg + "\nThe term \"window\" is not allowed in the script.";
    }
    if (msg !== "Error:") {
        alert(msg + secondary);
        this.mScriptUpdateSuccess = false;
    } else {
        // It survived initial checks so try the script
        try {
            eval(script);
        } catch (error) {
            alert("Error:\n" + error + secondary);
            this.mScriptUpdateSuccess = false;
        }
    }
};