from . import use_cases
from ..youtube_search.views import search_for_replacement_video

def get_web_searched_replacement_data(unplayable_video_data_array):
    replacement_video_found = []
    replacement_video_not_found = []


    for unplayable_video_data in unplayable_video_data_array:
        index = unplayable_video_data['index']
        confidence_level = 'MEDIUM'

        archived_video_title = use_cases.medium_confidence_attempt(unplayable_video_data)

        if not archived_video_title:
            confidence_level = 'LOW'
            archived_video_title = use_cases.low_confidence_attempt(unplayable_video_data)

        if not archived_video_title:
            replacement_video_not_found.append(unplayable_video_data)
            continue

        replacement_video_data = search_for_replacement_video(
            archived_video_title,
            index,
            confidence_level,
        )

        if not replacement_video_data:
            replacement_video_not_found.append(unplayable_video_data)
            continue

        replacement_video_found.append(replacement_video_data)

    return {
        'found': replacement_video_found,
        'not_found': replacement_video_not_found,
    }
