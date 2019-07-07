import os

from flask import (Flask, jsonify)
from flask_cors import CORS, cross_origin

from app import create_app
# from app.playlist.views import get_playlist_data

app = create_app('production')


@app.route('/', methods=['POST', 'OPTIONS'])
@cross_origin(origin='*',headers=['Content-Type', 'Authorization'])
def playlist(request):
    request_json = request.get_json()
    data = [{
        "url": "https://www.youtube.com/watch?v=OydFO53iSzk",
        "videoId": "OydFO53iSzk",
        "index": "2",
    }]
    return jsonify(data)


if __name__ == '__main__':
    port = int(app.config.get('PORT', '5000'))
    app.run(debug=True, host='0.0.0.0', port=port)
