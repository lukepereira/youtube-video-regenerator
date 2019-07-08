.PHONY: set-project
deploy:
	gcloud config set project youtube-tools-245705

.PHONY: deploy
deploy:
	gcloud functions deploy playlist --runtime python37 --trigger-http --source=./src
