// "exposed" is used by the vue-component-meta plugin while "expose" is used by vue-docgen-api
import {SLOT_EVENT_PREFIX} from "./constants";

const ARG_TYPE_SECTIONS = ['props', 'events', 'slots', 'exposed', 'expose'] as const;

const JSDOC_VALUE_REGEX = /^\{([\s\W\w]*)\}\s*.*$/g;

function hasDocgen(component: any): component is object & { __docgenInfo: any } {
  return !!component.__docgenInfo;
}

function getDocgenSection(component: any, section: string): any {
  return hasDocgen(component) ? component.__docgenInfo[section] : null;
}

const extractComponentProps = (component, section) => {
  const docgenSection = getDocgenSection(component, section);

  if(Array.isArray(docgenSection)) {
    return docgenSection;
  }
  else if(docgenSection) {
    // if not an array, we need to normalize it to regular format used in `docgenInfo` prop
    // in this case, section that returns object is props because it doesn't exist in __docgenInfo
    return Object.keys(docgenSection)?.map(key => {
      return {
        description: '',
        declarations: [],
        name: key,
        schema: docgenSection[key]?.type?.toString(),
        type: docgenSection[key]?.type?.toString(),
        required: docgenSection[key]?.required,
      }
    }) || [];
  }
};

function toEventName(name: string) {
  return `${SLOT_EVENT_PREFIX}${name.charAt(0).toUpperCase()}${name.slice(1)}`
}

const getPropControl = (prop) => {
  const control = {
    type: '',
    options: undefined,
  }
  const sbControlTag = prop?.tags?.find(e => e?.name === 'sbcontrol')?.text?.trim();
  const sbControlOptions = prop?.tags?.find(e => e?.name === 'sbcontroloptions')?.text?.trim();
  const typeArr = prop?.type?.split('|')?.map(item => item?.trim()).filter(e => !['undefined'].includes(e));

  if(sbControlTag) {
    control.type = sbControlTag?.replace(JSDOC_VALUE_REGEX, '$1');
  }

  if(sbControlOptions) {
    const opts = sbControlOptions?.replace(JSDOC_VALUE_REGEX, '$1');
    control.options = opts?.split(/[|,]/);
  }

  if(!sbControlTag) {
    if (typeArr.includes('string')) {
      control.type = 'text';
    } else if (typeArr.includes('boolean')) {
      control.type = 'boolean';
    } else if (typeArr.includes('number')) {
      control.type = 'number';
    } else if(typeArr.length) {
      control.type = 'object';
    }
  }

  return control;
}

/**
 * Same as Storybook `extractArgTypes` with the following changes:
 * - Remove control from events and methods.
 * - Add `on` prefix to events, so that `actions: { argTypesRegex: '^on[A-Z].*' }` can be used.
 * - Get event types from TS `defineEmits`. docgen info has it in `names` prop.
 * - Set types on `update:[prop]` events based on [prop] type
 * - Add all props not defined by docgen info in a group called "other props"
 * - Expand union type and use radio/select control when values are strings
 * - Expand array types
 * @see https://github.com/storybookjs/storybook/blob/d5ca2f42838c9f5a3e556a5e819e58f0deff522e/code/renderers/vue3/src/docs/extractArgTypes.ts
 */
export function extractArgTypes(component: any) {
  if (!hasDocgen(component)) return null;

  const argTypes = {};

  ARG_TYPE_SECTIONS.forEach((section) => {
    const props = extractComponentProps(component, section);

    // Map property props
    if(['props'].includes(section)) {
      props?.forEach(prop => {
        if(!prop || prop.global) return;

        const sbControl = getPropControl(prop);

        const {name, schema, type, description, required, default: defaultValue, tags} = prop;
        const typeArr = type?.split('|')?.map(item => item?.trim()).filter(e => !['undefined'].includes(e));

        // get content for table.type.detail from custom jsdoc tag @sbtypedetail
        const tagTypeDetail = tags?.find(e => e?.name === 'sbtypedetail')?.text?.trim()?.replace(JSDOC_VALUE_REGEX, '$1');
        const typeSchemaDetail = schema?.schema?.filter(e => e !== 'undefined' && typeof e === 'string');
        let typeDetail = tagTypeDetail || typeSchemaDetail?.join('|');

        if(['select', 'text', 'boolean', 'number'].includes(sbControl?.type) || !typeDetail?.length) {
          typeDetail = undefined;
        }

        argTypes[name] = {
          name,
          description,
          control: {
            type: sbControl?.type,
          },
          options: sbControl?.options?.map(e => e?.replaceAll(/'/gi, '')?.trim()),
          required,
          type: {
            required,
          },
          table: {
            category: section,
            defaultValue: {
              summary: defaultValue,
            },
            type: {
              required,
              summary: (sbControl?.type === 'select' && sbControl?.options?.join('|')) || typeArr.join('|'),
              detail: typeDetail,
            }
          }
        }
      })
    }

    // Map expose props
    if(['exposed', 'expose'].includes(section)) {
      props?.forEach(prop => {
        if(!prop) return;

        const {name, schema, type, description} = prop;

        // if exposed data already exist in argTypes, do not add it as exposed
        if(argTypes[name]) {
          return;
        }

        argTypes[name] = {
          name,
          description,
          control: undefined,
          table: {
            category: section,
            type: {
              summary: type || schema.toString(),
            }
          }
        }
      })
    }

    // Map slot props
    if(['slots'].includes(section)) {
      props?.forEach(prop => {
        if(!prop) return;

        const {name, schema, type, description} = prop;
        const argKey = `slot:${name}`;
        // only override original name if original name does not exist in argType list
        if(!argTypes[name]) {
          argTypes[name] = {
            table: {
              disable: true,
            }
          };
        }
        argTypes[argKey] = {
          name,
          description,
          control: undefined,
          table: {
            category: section,
            type: {
              summary: type || schema.toStrin(),
            }
          }
        }
      })
    }

    if(['events'].includes(section)) {
      props?.forEach(prop => {
        if(!prop) return;

        const {name, type, signature, description} = prop;
        const argKey = toEventName(name);
        argTypes[name] = {
          table: {
            disable: true,
          }
        };
        argTypes[argKey] = {
          name,
          description,
          control: undefined,
          table: {
            category: section,
            type: {
              summary: type || signature,
            }
          }
        }
      })
    }
  });

  return argTypes;
}
