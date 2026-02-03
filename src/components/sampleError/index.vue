<script setup lang="ts">
interface IsampleErrorProps {
  /**
  * Write description for storybook explaining what the var below represent
  * @sbcontrol {select} - Use custom jsdoc tag @sbcontrol to define the control type in storybook if auto detection is not correct
  * @sbcontroloptions {'A'|'b'|'c'} - Use custom jsdoc tag @sbcontroltype to define the options for select control
  * @sbtypedetail {{name: string; age?: number;}} - Use custom jsdoc @sbtypedetail to define content for table.type.detail in storybook
  * */
  title?: string;

  /** Icon prop */
  icon?: string;
  test?: boolean;
  description?: string;
  descriptionA?: string;
  descriptionB?: string;
}

defineOptions({
  name: "sampleError",
  displayName: "sampleError",
})

const props = withDefaults(defineProps<IsampleErrorProps>(), {
  title: 'Lorem',
});

const emit = defineEmits<{
  blabla: []
  // update: [value: string]
}>();

const { title } = toRefs(props);

onMounted(() => {
  emit('blabla');
  console.warn('Component mounted');
});
</script>

<template>
  <div>
    {{ title }}
  </div>
</template>

<style lang="postcss" scoped>
@import './style.css';

/* uncomment the line below if not using external style and requires tailwind `@apply` fn */
/* @reference "#tailwind.css"; */

.component {
  width: 100%;
}
</style>




