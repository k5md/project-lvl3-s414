install:
	npm install

develop:
	npx webpack-dev-server

build:
	rm -rf dist
	NODE_ENV=production npx webpack

deploy:	build
	npx surge --domain `cat ./CNAME` --project dist/ 

test:
	npm test

lint:
	npx eslint
