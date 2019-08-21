.PHONY: set-project
configure:
	gcloud config set project youtube-tools-245705

.PHONY: deploy
deploy:
	gcloud functions deploy archive_search --runtime python37 --trigger-http --source=./src
	gcloud functions deploy web_search --runtime python37 --trigger-http --source=./src
