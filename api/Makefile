.PHONY: set-project
configure:
	gcloud config set project youtube-tools-245705

.PHONY: python-deploy
deploy:
	gcloud functions deploy archive_search --runtime python37 --trigger-http --source=./python/src
	gcloud functions deploy web_search --runtime python37 --trigger-http --source=./python/src

.PHONY: go-deploy
go-deploy:
	(cd ./go/functions && go mod vendor)
	gcloud functions deploy OutputMessage --runtime go111 --trigger-http --source=./go/functions
	(cd ./go/functions && rm -rf vendor)
