// Connecting to ROS
// -----------------

var ros = new ROSLIB.Ros({
    url: 'ws://localhost:9090' //TODO: make this DDNS
});

ros.on('connection', function () {
    console.log('Connection to websocket!');
});

ros.on('error', function (error) {
    console.log('Error connecting to websocket server: ', error);
});

ros.on('close', function () {
    console.log('Connection to websocket server closed.');
});

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