# Markdown Curator (mdcurate)

Tool for curating metadata (also called frontmatter) and content in markdown files.

Launches a local server, so you do the curation from your browser, but everything only happens locally.

## How to Use

Install as a CLI tool using npm:

```bash
npm install -g mdcurate
# then launch
mdcurate
```

You can also use `npx` (which comes with npm) to launch directly:

```bash
npx mdcurate
```

## Configuration

By default, this launches a server using port 3000. You can set that with the `--port` or `-p` flag:

```bash
organizer -p 8080
# or with npx
npx mdcurate -p 8080
```

## License

Published and released under the [Very Open License](http://veryopenlicense.com).

If you need a commercial license, [contact me here](https://davistobias.com/license?software=mdcurate).
