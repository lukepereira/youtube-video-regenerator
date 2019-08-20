from . import use_cases
from ..youtube_search.views import search_for_replacement_video

def get_web_searched_replacement_data(unplayable_video_data_array):
    replacement_video_found = {}
    replacement_video_not_found = {}


    for unplayable_video_data in unplayable_video_data_array:
        index = unplayable_video_data['index']

        archived_video_title = use_cases.get_archived_video_title_from_web_search(
            unplayable_video_data
        )

        if not archived_video_title:
            replacement_video_not_found[index] = unplayable_video_data
            continue

        replacement_video_data = search_for_replacement_video(
            archived_video_title,
        )

        if not replacement_video_data:
            replacement_video_not_found[index] = unplayable_video_data
            continue

        replacement_video_found[index] = replacement_video_data

    return {
        'found': replacement_video_found,
        'not_found': replacement_video_not_found,
    }
