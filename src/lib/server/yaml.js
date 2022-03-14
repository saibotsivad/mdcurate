import yaml from 'js-yaml'

export const parseYaml = string => yaml.load(string, { schema: yaml.JSON_SCHEMA })

export const serializeToYaml = obj => yaml.dump(obj, {
	schema: yaml.JSON_SCHEMA, quotingType: '"',
	lineWidth: -1,
}).trim()
