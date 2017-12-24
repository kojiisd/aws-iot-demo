var apigClient = apigClientFactory.newClient();

var params = {
    // This is where any modeled request parameters should be added.
    // The key is the parameter name, as it is defined in the API in API Gateway.
    "Content-Type": "application/x-www-form-urlencoded"
};

var body = {

    "label_id": "id",
    "label_range": "timestamp",
    "id": [
        "H"
    ],
    "aggregator": "latest",
    "time_from": "2017-07-23T16:00:00.000",
    "time_to": "2017-07-23T16:06:00.000",
    "params": {
        "range": "timestamp"
    }
};

var additionalParams = {
    // If there are any unmodeled query parameters or headers that must be
    //   sent with the request, add them here.
    headers: {
    },
    queryParams: {
    }
};

var camera, scene, renderer;
var controls;

var objects = [];
var targets = { table: []/* , sphere: [], helix: [], grid: []  */ };

$(document).ready(function () {
    $("#getData").click(function () {
        apigClient.rootPost(params, body, additionalParams)
            .then(function (result) {
                var resultObjArray = new Array();
                // Add success callback code here.
                var resultJson = JSON.parse(result.data);
                for (var index = 0; index < resultJson.length; index++) {
                    var resultObj = new Object();
                    resultObj.id = resultJson[index].id;
                    resultObj.score = resultJson[index].score
                    resultObjArray[index] = resultObj;
                }

                for (var index = 0; index < resultObjArray.length; index++) {
                    var resultObj = resultObjArray[index];
                    if (resultObj.score != 0) {
                        $('#' + resultObj.id).css('background-color', 'rgba(255,127,127,' + (Math.random() * 0.5 + 0.25) + ')')
                    }
                }

            }).catch(function (result) {
                // Add error callback code here.
                alert("Failed");
                alert(JSON.stringify(result));
            });
    });

    apigClient.devicesGet(params, {}, additionalParams)
        .then(function (result) {
            scene = new THREE.Scene();
            init_map();
            init(JSON.parse(result.data));
            animate();
        });

    function init_map() {
        
        var texture = new THREE.ImageUtils.loadTexture('images/Japan.png');
        var material = new THREE.MeshBasicMaterial({ map: texture });

        var geometry = new THREE.PlaneGeometry(300, 300);
        var object = new THREE.Mesh( geometry, material );
        object.position.x = 0;
        object.position.y = 0;
        object.position.z = 0;
        scene.add(object);
        objects.push(object);
        
        var target = new THREE.Object3D();
        target.position.x = 0;
        target.position.y = 0;

        targets.table.push(target);
    }

    function init(table) {

        camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
        camera.position.z = 4000;


        
        
        // table

        for (var i = 0; i < table.length; i++) {

            var element = document.createElement('div');
            element.className = 'element';
            element.id = table[i].id;
            element.style.backgroundColor = 'rgba(0,127,127,' + (Math.random() * 0.5 + 0.25) + ')';

            // var number = document.createElement( 'div' );
            // number.className = 'number';
            // number.textContent = (i/5) + 1;
            // element.appendChild( number );

            var symbol = document.createElement('div');
            symbol.className = 'symbol';
            symbol.textContent = table[i].id;
            element.appendChild(symbol);

            var details = document.createElement('div');
            details.className = 'details';
            details.innerHTML = table[i].group;
            element.appendChild(details);

            var object = new THREE.CSS3DObject(element);
            object.position.x = Math.random() * 4000 - 2000;
            object.position.y = Math.random() * 4000 - 2000;
            object.position.z = Math.random() * 4000 - 2000;
            scene.add(object);

            objects.push(object);

            var object = new THREE.Object3D();
            object.position.x = (table[i].pos_x - 1000);
            object.position.y = - (table[i].pos_y - 1000);

            targets.table.push(object);
        }

        // sphere

        /* var vector = new THREE.Vector3();
        var spherical = new THREE.Spherical();
 
        for ( var i = 0, l = objects.length; i < l; i ++ ) {
 
            var phi = Math.acos( -1 + ( 2 * i ) / l );
            var theta = Math.sqrt( l * Math.PI ) * phi;
 
            var object = new THREE.Object3D();
 
            spherical.set( 800, phi, theta );
 
            object.position.setFromSpherical( spherical );
 
            vector.copy( object.position ).multiplyScalar( 2 );
 
            object.lookAt( vector );
 
            targets.sphere.push( object );
 
        } */

        // helix

        /* var vector = new THREE.Vector3();
        var cylindrical = new THREE.Cylindrical();
 
        for ( var i = 0, l = objects.length; i < l; i ++ ) {
 
            var theta = i * 0.175 + Math.PI;
            var y = - ( i * 8 ) + 450;
 
            var object = new THREE.Object3D();
 
            cylindrical.set( 900, theta, y );
 
            object.position.setFromCylindrical( cylindrical );
 
            vector.x = object.position.x * 2;
            vector.y = object.position.y;
            vector.z = object.position.z * 2;
 
            object.lookAt( vector );
 
            targets.helix.push( object );
 
        } */

        // grid

        /* for ( var i = 0; i < objects.length; i ++ ) {
 
            var object = new THREE.Object3D();
 
            object.position.x = ( ( i % 5 ) * 400 ) - 800;
            object.position.y = ( - ( Math.floor( i / 5 ) % 5 ) * 400 ) + 800;
            object.position.z = ( Math.floor( i / 25 ) ) * 1000 - 2000;
 
            targets.grid.push( object );
 
        } */

        //

        renderer = new THREE.CSS3DRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.domElement.style.position = 'absolute';
        document.getElementById('container').appendChild(renderer.domElement);

        //

        controls = new THREE.TrackballControls(camera, renderer.domElement);
        controls.rotateSpeed = 0.5;
        controls.minDistance = 500;
        controls.maxDistance = 6000;
        controls.noRotate = true;
        controls.addEventListener('change', render);

        var button = document.getElementById('table');
        button.addEventListener('click', function (event) {

            transform(targets.table, 2000);

        }, false);

        /* var button = document.getElementById( 'sphere' );
        button.addEventListener( 'click', function ( event ) {
 
            transform( targets.sphere, 2000 );
 
        }, false );
 
        var button = document.getElementById( 'helix' );
        button.addEventListener( 'click', function ( event ) {
 
            transform( targets.helix, 2000 );
 
        }, false );
 
        var button = document.getElementById( 'grid' );
        button.addEventListener( 'click', function ( event ) {
 
            transform( targets.grid, 2000 );
 
        }, false ); */

        transform(targets.table, 2000);

        //

        window.addEventListener('resize', onWindowResize, false);

    }

    function transform(targets, duration) {

        TWEEN.removeAll();

        for (var i = 0; i < objects.length; i++) {

            var object = objects[i];
            var target = targets[i];

            new TWEEN.Tween(object.position)
                .to({ x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();

            new TWEEN.Tween(object.rotation)
                .to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();

        }

        new TWEEN.Tween(this)
            .to({}, duration * 2)
            .onUpdate(render)
            .start();

    }

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

        render();

    }

    function animate() {

        requestAnimationFrame(animate);

        TWEEN.update();

        controls.update();

    }

    function render() {

        renderer.render(scene, camera);

    }

});
