import urllib

from bs4 import BeautifulSoup
import requests


def get_search_query(video_title):
    return urllib.parse.quote_plus(video_title)


def get_search_url(query):
    return 'https://www.youtube.com/results?search_query={query}'.format(
        query=query,
    )


def get_bs4_soup(youtube_search_url):
    response = requests.get(url=youtube_search_url)
    content = response.content
    return BeautifulSoup(content, features="html.parser")


def get_video_id_from_bs4_soup(soup):
    try:
        result_container = soup.select('div#results')[0].select('ol[class="item-section"]')[0]
        first_result = result_container.select('li')[0]
        return first_result.select('div')[0]['data-context-item-id']

    except KeyError:
        return None


def get_thumbnail_url(video_id):
    return 'https://i.ytimg.com/vi/{video_id}/hqdefault.jpg'.format(
        video_id=video_id,
    )



