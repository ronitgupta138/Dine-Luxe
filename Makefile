.PHONY: all install build test typecheck dev clean

all: install test build

install:
	pnpm install || npm install

test:
	node tests/reservation.test.js

typecheck:
	pnpm run typecheck || npm run typecheck

build:
	pnpm run build || npm run build

dev:
	pnpm run dev || npm run dev

clean:
	rm -rf dist frontend/.next backend/dist
