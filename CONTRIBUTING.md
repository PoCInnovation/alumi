## Test

- In the project root

```bash
npm install # be sure you have installed the dependencies
npm run build # build the project
```

- In the project root

```
./run-dev.sh # this will launch a docker/podman container with the pulumi dependencies
# Now that you are in the container, you can test the project
cd tests # go to the tests folder
./test.sh # setup the tests (it copy the builded project before and install it for the current tests folder
cd test1
# Now, you can use the `pulumi` command line tool
```
