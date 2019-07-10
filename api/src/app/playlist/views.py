from . import  use_cases


def get_playlist_replacement_data(unplayable_video_data_array, youtube_api_key):
    print(unplayable_video_data_array)
    replacement_video_data_dict = {}
    for unplayable_video_data in unplayable_video_data_array:
        archived_url = use_cases.get_archived_url(unplayable_video_data)
        if not archived_url:
            continue

        archived_video_title = use_cases.get_archived_video_title(archived_url)
        print('archived_video_title')
        print(archived_video_title)
        if not archived_video_title:
            continue

        replacement_video_data = use_cases.search_for_replacement_video(
            archived_video_title,
            youtube_api_key,
        )
        print('replacement_video_data')
        print(replacement_video_data)
        index = unplayable_video_data['index']
        replacement_video_data_dict[index] = replacement_video_data
    return replacement_video_data_dict
