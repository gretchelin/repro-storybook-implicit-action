import {SLOT_EVENT_PREFIX, SLOT_PROP_PREFIX} from "../config/constants.ts";

/** Util fn to turn string to kebab-case */
export const kebabize = (str: string) => (str || '').replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase());

/** Generate source code template for story with options - multiple presentation within a story */
export const templateOptionSourceCodeGen = (templateOptions: ({ key: string; value: any; label: string; [key: string]: any } | Record<string, any>)[]) => async (_, ctx) => {
  const prettier = await import('prettier/standalone');
  const parserHtml = await import('prettier/parser-html');
  const parserPostcss = await import('prettier/parser-postcss');
  const prettierPluginBabel = await import('prettier/plugins/babel');
  const prettierPluginEstree = await import('prettier/plugins/estree');

  // Generate a general source template
  // since we are building a vue component library, we can safely assume code are vue component by nature
  // if it's not, specific story can override this rendering as needed

  // Get the component name. With standardization on setting story title,
  // we can safely assume that last entry - if grouping exist - is the component's title
  const compName = ctx?.title?.split('/')?.at(-1) || 'StoryComp';

  const templates = templateOptions.map((opt) => {
    if(!opt) {
      return;
    }

    const mergedArgs = Object.assign({}, ctx.args, opt?.args, opt.key ? {[`${opt.key}`] : opt.value} : {});

    // Format and get props dynamically
    const props = Object.keys(mergedArgs).filter(e => !(e?.startsWith(SLOT_EVENT_PREFIX) || e?.startsWith(SLOT_PROP_PREFIX)))?.map(key => {
      let prepend = '';
      let value = `="${mergedArgs[key]}"`;

      if (['number', 'boolean', 'object'].includes(ctx.argTypes?.[key]?.control?.type)) {
        prepend = ':';
      }

      if (['boolean'].includes(ctx.argTypes?.[key]?.control?.type)) {
        value = mergedArgs[key] ? '' : value;
      }

      if (['object'].includes(ctx.argTypes?.[key]?.control?.type)) {
        value = (`="${(JSON.stringify(mergedArgs[key]) || '').replace(/"/gi, "'")}"`);
      }

      return `${prepend}${kebabize(key)}${value}`;
    });

    // Format and get events dynamically
    // We get all arguments prefixed with `on` as event listener,
    // as part of standardized argType definition to prevent clashing when slot/event/props shares naming
    // Here, we are assuming handler name is `on<eventName>` to simplify things
    const events = Object.keys(mergedArgs).filter(e => e?.startsWith(SLOT_EVENT_PREFIX))?.map((key) => {
      const evt = key?.slice(SLOT_EVENT_PREFIX.length);
      const handler = key.replace(/\W/gi, '_')
      return `@${kebabize(evt)}="${handler}"`
    });

    // Format and get slots dynamically
    // We get all arguments prefixed with `slot` as event listener,
    // as part of standardized argType definition to prevent clashing when slot/event/props shares naming
    // Here, we are assuming handler name is `on<eventName>` to simplify things
    const slots = Object.keys(mergedArgs).filter(e => e?.startsWith(SLOT_PROP_PREFIX))?.map((key) => {
      const slot = key?.slice(SLOT_PROP_PREFIX.length);
      return `\n<template #${kebabize(slot)}="slotProps">\n${mergedArgs[key]}\n</template>\n`
    });

    return `\n
          <!-- ${opt?.label} -->
          <${compName} ${props?.join(' ')}  ${events.join(' ')}>${slots}</${compName}>
          \n`;
  })

  // Generate new source template based on the above
  const sourceTemplate = `<template>${templates.join('\n')}</template>`;

  // Format source using prettier for vue config
  return prettier.format(sourceTemplate, {
    parser: 'vue',
    vueIndentScriptAndStyle: true,
    plugins: [prettierPluginBabel, parserHtml, parserPostcss, prettierPluginEstree],
  });
};

/** Generate source code template. Allows building custom template if callback argument is passed */
export const templateCustomSourceCodeGen = (callback?: (params: Record<string, any>) => string) => async (_, ctx) => {
  const prettier = await import('prettier/standalone');
  const parserHtml = await import('prettier/parser-html');
  const parserPostcss = await import('prettier/parser-postcss');
  const prettierPluginBabel = await import('prettier/plugins/babel');
  const prettierPluginEstree = await import('prettier/plugins/estree');

  // Generate a general source template
  // since we are building a vue component library, we can safely assume code are vue component by nature
  // if it's not, specific story can override this rendering as needed

  // Get the component name. With standardization on setting story title,
  // we can safely assume that last entry - if grouping exist - is the component's title
  const compName = ctx?.title?.split('/')?.at(-1) || 'StoryComp';

  // Format and get props dynamically
  const props = Object.keys(ctx?.args).filter(e => !(e?.startsWith(SLOT_EVENT_PREFIX) || e?.startsWith(SLOT_PROP_PREFIX)))?.map(key => {
    let prepend = '';
    let value = `="${ctx.args[key]}"`;

    if (['number', 'boolean', 'object'].includes(ctx.argTypes?.[key]?.control?.type)) {
      prepend = ':';
    }

    if (['boolean'].includes(ctx.argTypes?.[key]?.control?.type)) {
      value = ctx.args[key] ? '' : value;
    }

    if (['object'].includes(ctx.argTypes?.[key]?.control?.type)) {
      value = (`="${(JSON.stringify(ctx.args[key]) || '').replace(/"/gi, "'")}"`);
    }

    return `${prepend}${kebabize(key)}${value}`;
  });

  // Format and get events dynamically
  // We get all arguments prefixed with `on` as event listener,
  // as part of standardized argType definition to prevent clashing when slot/event/props shares naming
  // Here, we are assuming handler name is `on<eventName>` to simplify things
  const events = Object.keys(ctx?.args).filter(e => e?.startsWith(SLOT_EVENT_PREFIX))?.map((key) => {
    const evt = key?.slice(SLOT_EVENT_PREFIX.length);
    const handler = key.replace(/\W/gi, '_')
    return `@${kebabize(evt)}="${handler}"`
  });

  // Format and get slots dynamically
  // We get all arguments prefixed with `slot` as event listener,
  // as part of standardized argType definition to prevent clashing when slot/event/props shares naming
  // Here, we are assuming handler name is `on<eventName>` to simplify things
  const slots = Object.keys(ctx?.args).filter(e => e?.startsWith(SLOT_PROP_PREFIX))?.map((key) => {
    const slot = key?.slice(SLOT_PROP_PREFIX.length);
    return `\n<template #${kebabize(slot)}="slotProps">\n${ctx.args[key]}\n</template>\n`
  });

  // Generate new source template based on the above
  const sourceTemplate = typeof callback === 'function' ? callback({
    compName,
    props,
    events,
    slots,
  }) : `<${compName} ${props?.join(' ')}  ${events.join(' ')}>${slots}</${compName}>`;

  // Format source using prettier for vue config
  return prettier.format(sourceTemplate, {
    parser: 'vue',
    vueIndentScriptAndStyle: true,
    plugins: [prettierPluginBabel, parserHtml, parserPostcss, prettierPluginEstree],
  });
};

export const genDisabledArgTypes = (paramNames: string[]) => {
  return paramNames?.reduce((acc: Record<string, any>, name) => {
    acc[name] = {
      table: {
        disable: true,
      },
    };
    return acc;
  }, {} as Record<string, any>) || {};
}

/**
 *  Get `$slots` from passed story argument.
 * This is util function when custom `extractArgType`  is used where `slots` key are prefixed
 * with `slot` to prevent name collision when same name is being used for props and/or events
 *  */
export const getSlotsFromArgs = (args: Record<string, any>) => {
  return Object.keys(args).filter(e => e?.startsWith(SLOT_PROP_PREFIX)).reduce((acc, key) => {
    if (key) {
      const slotName = kebabize(key.slice(SLOT_PROP_PREFIX.length) || '');
      acc[slotName] = args[key];
    }

    return acc;
  }, {} as Record<string, any>);
}

/**
 * Generator function to create basic story template
 * This template already handling arbitrary slot naively using v-html. If specific components are
 * required for precise rendering, manually creating story template is still recommended,
 * */
export const genBasicTemplate = (Comp: any) => (args: Record<string, any>) => {
  return ({
    components: { StoryComp: Comp },
    setup() {
      const slots = getSlotsFromArgs(args);

      return {args, slots};
    },
    template: `<StoryComp v-bind="args">
    <template v-for="(val, slotName) in slots" #[slotName]="slotProps">
      <div v-if="val" v-html="val"></div>
    </template>
  </StoryComp>`,
  })
}

/**
 * Generator function to create basic story template with optiona.
 * This is useful when needing to show variants within single story instead of making separate
 * stories for each variant.
 * This template already handling arbitrary slot naively using v-html. If specific components are
 * required for precise rendering, manually creating story template is still recommended,
 * */
export const genOptionTemplate = (Comp: any, templateOptions: {label: string; key?: string; value?: any; [key:string]:any }[], containerOpts?: Record<string, any>) => (args: Record<string, any>) => {
  return ({
    components: { StoryComp: Comp },

    setup() {
      const slots = getSlotsFromArgs(args);

      return {templateOptions, containerOpts, args, slots};
    },
    template: `
      <div class="flex flex-wrap w-full justify-items-stretch gap-8" v-bind="containerOpts">
        <div
          v-for="(opt, idx) in templateOptions"
          :key="idx"
          class="flex flex-col items-start flex-1 min-w-48"
        >
          <div class="font-bold capitalize w-full">
            {{ opt.label }}
          </div>
          <div class="w-full">
            <StoryComp v-bind="Object.assign({}, args, opt.args)" :[opt.key]="opt.value">
              <template v-for="(val, slotName) in slots" #[slotName]="slotProps">
                <div v-if="val" v-html="val"></div>
              </template>
            </StoryComp>
          </div>
        </div>
      </div>`,
  })
}
