# ROS-remote-gui
To get this going in a quick container, use nginx like so:

`docker run --name experimentpage_server --rm -it -p 8080:80 -v $PWD:/usr/share/nginx/html:ro nginx`

Then access at http://localhost:8080
