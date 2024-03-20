## Test

```bash
./run-dev.sh
npm install # be sure you have installed the dependencies
# now, each time you modify ./src/
npm run build
cd tests
./init.sh
# and after these steps, you can run `pulumi up`
```
