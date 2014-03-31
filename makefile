all:
	@bin/deploy --new
full:
	@bin/deploy --all
deploy:
	@bin/deploy --all && bin/deploy --commit
clean:
	@bin/deploy --clean
