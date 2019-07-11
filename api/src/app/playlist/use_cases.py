import urllib

import requests
from bs4 import BeautifulSoup


def get_archived_url(unplayable_video_data):
    video_id = unplayable_video_data['videoId']
    video_url = 'https://www.youtube.com/watch?v={video_id}'.format(
        video_id=video_id,
    )
    wayback_url = 'http://archive.org/wayback/available?url={video_url}'.format(
        video_url=video_url,
    )
    response = requests.get(url=wayback_url)
    response_json = response.json()
    try:
        return response_json['archived_snapshots']['closest']['url']
    except KeyError:
        return None

def get_archived_video_title(archived_url):
    response = requests.get(url=archived_url)
    content = response.content
    soup = BeautifulSoup(content, features="html.parser")
    document_title_element = soup.findAll('title')[0]
    document_title = document_title_element.string
    title = document_title[0:-10]
    return title


def search_for_replacement_video(archived_video_title , api_key):
    query = urllib.parse.quote_plus(archived_video_title)
    youtube_search_url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&q={query}&key={api_key}&type=video&maxResults=1'.format(
        query=query,
        api_key=api_key,
    )
    response = requests.get(url=youtube_search_url)
    response_json = response.json()
    if 'items' in response_json:
        return serialize_youtube_response(response_json['items'])


def get_video_title(video_data):
    try:
        return video_data['snippet']['title']
    except KeyError:
        return ''


def get_video_id(video_data):
    try:
        return video_data['id']['videoId']
    except KeyError:
        return ''


def get_thumbnail_url(video_data):
    try:
        return video_data['snippet']['thumbnails']['high']['url']
    except KeyError:
        return ''


def serialize_youtube_response(response):
    formatted_response = []
    for video_data in response:
        formatted_response.append(
            {
                'title': get_video_title(video_data),
                'videoId': get_video_id(video_data),
                'thumbnailUrl': get_thumbnail_url(video_data),
            }
        )

    return formatted_response
