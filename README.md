# Metadata Organizer

Tool for curating metadata (also called frontmatter) in markdown files.

Launches a local server, so you do the curation from your browser.

## How to Use

Install as a CLI tool using npm:

```bash
npm install -g metadata-organizer
# then launch
organizer
```

You can also use `npx` (which comes with npm) to launch directly:

```bash
npx metadata-organizer
```

## Configuration

By default, this launches a server using port 3000. You can set that with the `--port` or `-p` flag:

```bash
organizer -p 8080
# or with npx
npx metadata-organizer -p 8080
```

## License

Published and released under the [Very Open License](http://veryopenlicense.com).

If you need a commercial license, [contact me here](https://davistobias.com/license?software=metadata-organizer).
