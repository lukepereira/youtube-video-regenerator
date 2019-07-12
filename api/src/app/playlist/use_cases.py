import html
import urllib
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

def get_archived_video_title_from_web_search(unplayable_video_data):
    print('get_archived_video_title_from_web_search')
    video_id = unplayable_video_data['videoId']
    search_url = 'https://www.google.com/search?q="{video_id}&num={number_results}'.format(
        video_id=video_id,
        number_results= str(3),
    )
    response = requests.get(url=search_url)
    content = response.content
    soup = BeautifulSoup(content, features="html.parser")
    result_elements = soup.select('div#main')[0].find_all(recursive=False)[4:6]
    result_text = [ result.text for result in result_elements]
    clean_result_text = [ re.sub(r'http\S+', '', result) for result in result_text ]
    return longest_common_substring(clean_result_text)


def search_for_replacement_video(archived_video_title):
    query = urllib.parse.quote_plus(archived_video_title)
    youtube_search_url = 'https://www.youtube.com/results?search_query={query}'.format(
        query=query,
    )
    response = requests.get(url=youtube_search_url)
    content = response.content
    soup = BeautifulSoup(content, features="html.parser")
    try:
        result_container = soup.select('div#results')[0].select('ol[class="item-section"]')[0]
        first_result = result_container.select('li')[0]
        video_id = first_result.select('div')[0]['data-context-item-id']
        return {
            'title': archived_video_title,
            'videoId': video_id,
            'thumbnailUrl': 'https://i.ytimg.com/vi/{video_id}/hqdefault.jpg'.format(
                video_id=video_id,
            )
        }
    except KeyError:
        return None


def search_for_replacement_video_using_api(archived_video_title , api_key):
    query = urllib.parse.quote_plus(archived_video_title)
    youtube_search_url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&q={query}&key={api_key}&type=video&maxResults=1'.format(
        query=query,
        api_key=api_key,
    )
    response = requests.get(url=youtube_search_url)
    response_json = response.json()
    if 'items' in response_json:
        return serialize_youtube_response(response_json['items'])


def longest_common_substring(data):
    substrs = lambda x: {x[i:i+j] for i in range(len(x)) for j in range(len(x) - i + 1)}
    s = substrs(data[0])
    for val in data[1:]:
        s.intersection_update(substrs(val))
    sorted_set = sorted(s, key=len, reverse=True)
    first_phrase = sorted_set[0]
    second_phrase = sorted_set[ len(first_phrase) + 1]
    return ' '.join([first_phrase, second_phrase])


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
                'title': html.unescape(get_video_title(video_data)),
                'videoId': get_video_id(video_data),
                'thumbnailUrl': get_thumbnail_url(video_data),
            }
        )

    return formatted_response
