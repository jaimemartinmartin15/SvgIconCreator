# TODO

Angular web page that TODO. Deployed to <https://jaimeelingeniero.es/TODO>

[![Build And Deploy](https://github.com/jaimemartinmartin15/TODO/actions/workflows/build-and-publish.yml/badge.svg)](https://github.com/jaimemartinmartin15/TODO/actions/workflows/build-and-publish.yml)

## Development

**Clone** the repository:

```text
git clone https://github.com/jaimemartinmartin15/TODO.git
```

**Install** dependencies:

```text
npm i
```

You might need a valid personal access token to download some scoped dependencies on GPR (Github Package Registry).

**Start** the server:

```text
npm run start
```

## Build

To build the project run:

```text
npm run build
```

## Deploy

After doing the changes in your branch, increase the [package.json](./package.json) version and then run `npm i` to update the package-lock.json

Update also [CHANGELOG.md](./CHANGELOG.md) file.

Then merge the changes in `main` branch and create a tag with the same version than in the package.json

When pushing the tag to the remote, it will trigger the workflow **build-and-publish.yml** automatically to deploy it.

## Workflows

### build-and-publish.yml

Builds and deploys the application to the server.

Basically, it copies the files in the `dist` folder and puts them in `todo/` folder in the server.
