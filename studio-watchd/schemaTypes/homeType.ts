import {defineField, defineType} from 'sanity'

export const homeType = defineType({
    name: 'home',
    title: 'Home',
    type: 'document',
    initialValue: {
        title: 'The initial title'
    },
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'placeholder',
            title: 'Input Placeholder',
            description: 'Add a placeholder for the input field',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'account',
            title: 'Account',
            description: 'Add a title for the account button',
            type: 'string',
        }),
    ],
})