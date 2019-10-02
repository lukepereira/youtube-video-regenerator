.PHONY: set-project
configure:
	gcloud config set project youtube-tools-245705

.PHONY: python-deploy
python-deploy:
	gcloud functions deploy archive_search --runtime python37 --trigger-http --source=./python/src
	gcloud functions deploy web_search --runtime python37 --trigger-http --source=./python/src

.PHONY: go-deploy-archive-search
go-deploy-archive-search:
	(cd ./go/functions && go mod vendor)
	gcloud functions deploy ArchiveSearch --runtime go111 --trigger-http --source=./go/functions
	(cd ./go/functions && rm -rf vendor)

.PHONY: go-deploy-web-search
go-deploy-web-search:
	(cd ./go/functions && go mod vendor)
	gcloud functions deploy WebSearch --runtime go111 --trigger-http --source=./go/functions
	(cd ./go/functions && rm -rf vendor)

.PHONY: go-deploy
go-deploy:
	(cd ./go/functions && go mod vendor)
	gcloud functions deploy ArchiveSearch --runtime go111 --trigger-http --source=./go/functions
	gcloud functions deploy WebSearch --runtime go111 --trigger-http --source=./go/functions
	(cd ./go/functions && rm -rf vendor)

.PHONY: go-test-archive-search
go-test-archive-search:
	(cd ./go/functions && go test -run TestArchiveSearch)

.PHONY: go-test-web-search
go-test-web-search:
	(cd ./go/functions && go test -run TestWebSearch)

.PHONY: go-test
go-test:
	(cd ./go/functions && go test)
