from . import  use_cases


def get_playlist_replacement_data(unplayable_video_data_array, youtube_api_key):
    print(unplayable_video_data_array)
    replacement_video_data_dict = {}
    for unplayable_video_data in unplayable_video_data_array:
        archived_url = use_cases.get_archived_url(unplayable_video_data)

        if archived_url:
            archived_video_title = use_cases.get_archived_video_title_from_archived_url(
                archived_url
            )

        else:
            archived_video_title = use_cases.get_archived_video_title_from_web_search(
                unplayable_video_data
            )

        print ("archived_video_title")
        print (archived_video_title)

        if not archived_video_title:
            continue

        replacement_video_data = use_cases.search_for_replacement_video(
            archived_video_title,
        )

        print ("replacement_video_data")
        print (replacement_video_data)

        if not replacement_video_data:
            continue

        index = unplayable_video_data['index']
        replacement_video_data_dict[index] = replacement_video_data
    return replacement_video_data_dict
