all:
	@bin/deploy --new
full:
	@bin/deploy --all
deploy:
	@bin/deploy --all && bin/deploy --commit && git push host master
clean:
	@bin/deploy --clean
