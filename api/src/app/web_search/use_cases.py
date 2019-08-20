import itertools
import re

import requests
from bs4 import BeautifulSoup

def get_archived_video_title_from_web_search(unplayable_video_data):
    search_string = medium_confidence_attempt(unplayable_video_data)

    if search_string:
        return search_string

    return low_confidence_attempt(unplayable_video_data)


def medium_confidence_attempt(unplayable_video_data):
    video_id = unplayable_video_data['videoId']
    number_of_results = 1
    search_url = 'https://www.google.com/search?q=site%3Ayoutu.be%2F{video_id}&num={number_of_results}'.format(
        video_id=video_id,
        number_of_results= str(number_of_results),
    )
    response = requests.get(url=search_url)
    content = response.content
    soup = BeautifulSoup(content, features="html.parser")
    result_elements = soup.select('div#main')[0].find_all(recursive=False)[3:3 + number_of_results]
    try:
        result_text = result_elements[0].find('a').find('div').text
        clean_result_text = result_text.split('- Youtu.be')[0].strip()
        return clean_result_text

    except (AttributeError):
        return None


def low_confidence_attempt(unplayable_video_data):
    video_id = unplayable_video_data['videoId']
    number_of_results = 3
    search_url = 'https://www.google.com/search?q="{video_id}"&num={number_of_results}'.format(
        video_id=video_id,
        number_of_results= str(number_of_results),
    )
    response = requests.get(url=search_url)
    content = response.content
    soup = BeautifulSoup(content, features="html.parser")
    result_elements = soup.select('div#main')[0].find_all(recursive=False)[3: 3 + number_of_results]

    # for result in result_elements:
    #     result.find('a').decompose()

    result_text = [ result.text for result in result_elements ]
    clean_result_text = [ re.sub(r'http\S+', '', result) for result in result_text ]
    return get_search_string(clean_result_text)


def longest_common_substring(data):
    substrs = lambda x: {x[i:i+j] for i in range(len(x)) for j in range(len(x) - i + 1)}
    s = substrs(data[0])
    for val in data[1:]:
        s.intersection_update(substrs(val))
    sorted_set = sorted(s, key=len, reverse=True)
    first_phrase = sorted_set[0]
    second_phrase = sorted_set[ len(first_phrase) + 1]
    return ' '.join([first_phrase, second_phrase])


def get_search_string(array_of_sentences):
    array_of_words = [ sentence.split(' ') for sentence in array_of_sentences ]
    pairs_of_word_arrays = [ result for result in itertools.combinations(array_of_words, 2) ]
    global_keep = []
    for pair in pairs_of_word_arrays:
        local_keep = []
        for word in pair[0]:
            if word in pair[1]:
                local_keep.append(word)
            else:
                if len(local_keep) > len(global_keep):
                    global_keep = local_keep
                local_keep = []

    return ' '.join(global_keep)
