// Connecting to ROS
// -----------------

var remote_url= 'ws://placeholder.duckdns.org:9090'
var local_url= 'ws://localhost:9090'
var ros = new ROSLIB.Ros();

var url = remote_url;

ros.on('connection', function () {
    console.log('Connection to websocket!');
});

ros.on('error', function (error) {
    console.log('Error connecting to websocket server: ', error);
    if(url===remote_url){
        url = local_url;
        ros.connect(url);
    }
});

ros.on('close', function () {
    console.log('Connection to websocket server closed.');
});

ros.connect(url);

// Subscribing to a Topic
// ----------------------

camera_topic = new ROSLIB.Topic({
    ros: ros,
    name: '/camera/remote_camera/compressed',
    messageType: 'sensor_msgs/CompressedImage'
});

camera_topic.subscribe(function (message) {
    document.getElementById('camera_stream').src = "data:image/jpg;base64," + message.data;
});

function filterItems(arr, query) {
    return arr.filter(function (el) {
        return el.toLowerCase().indexOf(query.toLowerCase()) !== -1
    })
}

// https://stackoverflow.com/questions/22395357/how-to-compare-two-arrays-are-equal-using-javascript
function arraysAreIdentical(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (var i = 0, len = arr1.length; i < len; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}

var cubes = [];

var cubes_topic = new ROSLIB.Topic({
    ros: ros,
    name: '/gazebo/model_states',
    messageType: 'gazebo_msgs/ModelStates'
});

function chooseCube(cube_str) {
    console.log(cube_str);
}

function updatePick(arr) {
    var drop = [document.getElementById('select_pick'), document.getElementById('select_place')];
    drop.forEach(function (_value, _index, _array) {
        //remove options
        while (_value.firstChild) {
            _value.removeChild(_value.lastChild);
        }
        //add options
        for (var i = 0; i < arr.length; i++) {
            var opt = arr[i];
            var el = document.createElement("option");
            el.textContent = opt;
            _value.appendChild(el);
        }
    })
    $("#select_pick").selectpicker('refresh');
    $("#select_place").selectpicker('refresh');
}

cubes_topic.subscribe(function (message) {
    var newcubes = filterItems(message.name, 'cube_');
    if (!arraysAreIdentical(newcubes, cubes)) {
        cubes = newcubes;
        updatePick(cubes);
    }

});

// Calling a service
// -----------------

var spawnCubesClient = new ROSLIB.Service({
    ros: ros,
    name: '/spawn_objects_service',
    serviceType: 'spawn_objects/spawn_objects'
});

function spawnService() {
    var request = new ROSLIB.ServiceRequest({
        surface_name: '',
        overwrite: document.getElementById('overwrite').checked,
        length: parseInt(document.getElementById('ycubes').value),
        width: parseInt(document.getElementById('xcubes').value),
    });

    console.log(document.getElementById('overwrite').value);

    spawnCubesClient.callService(request, function (result) {
        console.log('Result for service call on '
            + spawnCubesClient.name
            + ': '
            + result.status);
    });
}

var goPickPlaceClient = new ROSLIB.Service({
    ros: ros,
    name: '/pick_place',
    serviceType: 'targetpose/pickplace'
});

function goPickPlace() {
    var request = new ROSLIB.ServiceRequest({
        pick_object: document.getElementById('select_pick').value,
        place_object: document.getElementById('select_place').value
    });

    goPickPlaceClient.callService(request, function (result) {
        console.log('Result for service call on '
            + spawnCubesClient.name
            + ': '
            + result.status);
    });
}