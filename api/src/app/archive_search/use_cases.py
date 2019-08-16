import html
import re

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


def get_archived_video_title_from_archived_url(archived_url):
    print('get_archived_video_title_from_archived_url')
    try:
        response = requests.get(url=archived_url)
        content = response.content
        soup = BeautifulSoup(content, features="html.parser")
        document_title_element = soup.findAll('title')[0]
        document_title = document_title_element.string
        length_of_placeholder = len(' - YouTube')
        title = document_title[0:-length_of_placeholder]
        if title:
            return title

    except IndexError:
        pass

    try:
        unavailable_message = soup.select('h1#unavailable-message')[0]
        title = re.findall(r'"([^"]*)"', unavailable_message.text)
        # title = re.search(r'"([^"]*)"', unavailable_message.text).group()
        return title[0]
    except IndexError:
        pass

    return None
