module.exports = function ( controls ) { 
    var element;
    var blocker;
    var instructions;
    
        blocker = document.getElementById('blocker');
        instructions = document.getElementById('instructions');
        var havePointerLock = 'pointerLockElement' in document ||
            'mozPointerLockElement' in document ||
            'webkitPointerLockElement' in document;
        if (havePointerLock) {
            element = document.body;
            
            var pointerlockchange = function (event) {
                if (document.pointerLockElement === element ||
                    document.mozPointerLockElement === element ||
                    document.webkitPointerLockElement === element) {
                    controls.enabled = true;
                    blocker.style.display = 'none';
                }
                else {
                    controls.enabled = false;
                    blocker.style.display = 'flex';
                    instructions.style.display = '';
                }
            };
            var pointerlockerror = function (event) {
                instructions.style.display = '';
            };
            // Hook pointer lock state change events
            document.addEventListener('pointerlockchange', pointerlockchange, false);
            document.addEventListener('mozpointerlockchange', pointerlockchange, false);
            document.addEventListener('webkitpointerlockchange', pointerlockchange, false);
            document.addEventListener('pointerlockerror', pointerlockerror, false);
            document.addEventListener('mozpointerlockerror', pointerlockerror, false);
            document.addEventListener('webkitpointerlockerror', pointerlockerror, false);
            instructions.addEventListener('click', function (event) {
                instructions.style.display = 'none';
                // Ask the browser to lock the pointer
                element.requestPointerLock = element.requestPointerLock ||
                    element.mozRequestPointerLock ||
                    element.webkitRequestPointerLock;
                   /* 
                if (/Firefox/i.test(navigator.userAgent)) {
                    var fullscreenchange = function (event) {
                        if (document.fullscreenElement === element ||
                            document.mozFullscreenElement === element ||
                            document.mozFullScreenElement === element) {
                            document.removeEventListener('fullscreenchange', fullscreenchange);
                            document.removeEventListener('mozfullscreenchange', fullscreenchange);
                            element.requestPointerLock();
                        }
                    };
                    document.addEventListener('fullscreenchange', fullscreenchange, false);
                    document.addEventListener('mozfullscreenchange', fullscreenchange, false);
                    element.requestFullscreen = element.requestFullscreen ||
                        element.mozRequestFullscreen ||
                        element.mozRequestFullScreen ||
                        element.webkitRequestFullscreen;
                    element.requestFullscreen();
                    
                }
                else {
                    */
                    element.requestPointerLock();
                    
                //}
            }, false);
        }
        else {
            instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
            
        }
        
};
/*
var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
    if (havePointerLock) {
      var element = document.body;
      var pointerlockchange = function (event) {
        if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
          controls.enabled = true;
        } else {
          controls.enabled = false;
        }
      };

      var pointerlockerror = function (event) {
        console.log('Error loading Pointer Lock');
      };

      // Hook pointer lock state change events
      document.addEventListener('pointerlockchange', pointerlockchange, false);
      document.addEventListener('mozpointerlockchange', pointerlockchange, false);
      document.addEventListener('webkitpointerlockchange', pointerlockchange, false);
      document.addEventListener('pointerlockerror', pointerlockerror, false);
      document.addEventListener('mozpointerlockerror', pointerlockerror, false);
      document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

      element.addEventListener('click', function (event) {
        // Ask the browser to lock the pointer
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
        element.requestPointerLock();
      }, false);
    } else {
      console.error('Your browser doesn\'t support the pointer lock API');
    }*/