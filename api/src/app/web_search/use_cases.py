import re

import requests
from bs4 import BeautifulSoup


def get_archived_video_title_from_web_search(unplayable_video_data):
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


def longest_common_substring(data):
    substrs = lambda x: {x[i:i+j] for i in range(len(x)) for j in range(len(x) - i + 1)}
    s = substrs(data[0])
    for val in data[1:]:
        s.intersection_update(substrs(val))
    sorted_set = sorted(s, key=len, reverse=True)
    first_phrase = sorted_set[0]
    second_phrase = sorted_set[ len(first_phrase) + 1]
    return ' '.join([first_phrase, second_phrase])
