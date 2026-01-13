# anthill-framework useful snippets

## Run one test
```bash
npx cross-env TS_NODE_PROJECT=tsconfig.jest.json node ./node_modules/jest/bin/jest.js -i ./tests/rest-handler-decorator.test.ts -c ./jest.config.ts -t "decorator add handler to anthill"
```

## Run a test file
```bash
npx cross-env TS_NODE_PROJECT=tsconfig.jest.json node ./node_modules/jest/bin/jest.js -i ./tests/rest-handler-decorator.test.ts -c ./jest.config.ts
```
