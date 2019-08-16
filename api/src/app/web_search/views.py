from . import use_cases
from ..youtube_search.views import search_for_replacement_video

def get_web_searched_replacement_data(unplayable_video_data_array):
    replacement_video_data_dict = {}

    for unplayable_video_data in unplayable_video_data_array:
        archived_video_title = use_cases.get_archived_video_title_from_web_search(
            unplayable_video_data
        )

        if not archived_video_title:
            continue

        replacement_video_data = search_for_replacement_video(
            archived_video_title,
        )

        if not replacement_video_data:
            continue

        index = unplayable_video_data['index']
        replacement_video_data_dict[index] = replacement_video_data

    return {
        'found': replacement_video_data_dict,
        'not_found': {}
    }
