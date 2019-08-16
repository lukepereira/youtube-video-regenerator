from . import use_cases


def search_for_replacement_video(video_title):
    query = use_cases.get_search_query(video_title)
    youtube_search_url = use_cases.get_search_url(query)
    soup = use_cases.get_bs4_soup(youtube_search_url)
    video_id = use_cases.get_video_id_from_bs4_soup(soup)
    thumbnail_url = use_cases.get_thumbnail_url(video_id)
    return {
        'title': video_title,
        'videoId': video_id,
        'thumbnailUrl': thumbnail_url
    }
