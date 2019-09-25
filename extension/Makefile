.PHONY: build
build:
	(cd ./chrome && npm run build)

.PHONY: zip
zip:
	zip -vr build.zip ./chrome/build

.PHONY: build-zip
build-zip: build zip

.PHONY: make-key
make-key:
	openssl rsa -inform PEM -pubin -in pubkey.pem -outform DER | openssl base64 -A
