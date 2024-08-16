Download log file from here: https://drive.google.com/file/d/1POWpaw3YUaUe6zziqmWYkJfg4vgq9Wnv/view?usp=sharing

and put at `./build.log`, then launch application by command: `npm start`

Application will be available at http://localhost:4000

There is HTTP API at `/view-log` and websocket API at `/view-log-ws`.

Both are streaming build log with limited bandwith to avoid overwhelming the frontend.

Each websocket message (and chunk in HTTP API) contains one line.

Example usage can be found at `./index.html`.
